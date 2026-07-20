import type { BlockInput, BlockField, BlockMutation } from "@/types";

const SOUP =
  "!#%()*+,-./:;=?@[]^_`{|}~" +
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** A block as stored under `targets[].blocks` in project.json (id is the map key, and inputs/fields/mutations are raw JSON). */
export type ProjectBlock = {
  opcode: string;
  next: string | null;
  parent: string | null;
  inputs: Record<string, BlockInput | unknown>;
  fields: Record<string, BlockField | unknown>;
  shadow: boolean;
  topLevel: boolean;
  x?: number;
  y?: number;
  mutation?: BlockMutation | unknown;
};

export type ProjectBlockMap = Record<string, ProjectBlock>;

export type BlockDef = {
  opcode: string;
  inputs?: ProjectBlock["inputs"];
  fields?: ProjectBlock["fields"];
  mutation?: ProjectBlock["mutation"];
};

export type InsertBlockOpts = {
  afterId?: string | null;
  topLevel?: { x: number; y: number } | null;
  intoInput?: {
    parentId: string;
    inputName: string;
    shadow?: unknown | null;
  };
};

/**
 * Generates a Scratch-style 20-character block id (scratch-vm `uid`).
 * @see https://github.com/scratchfoundation/scratch-vm/blob/develop/src/util/uid.js
 */
export function uid(): string {
  let id = "";
  for (let i = 0; i < 20; i++) {
    id += SOUP.charAt(Math.floor(Math.random() * SOUP.length));
  }
  return id;
}

/**
 * Inserts a block into a target's `blocks` map, wiring next/parent links.
 *
 * @returns The new block's id.
 */
export function insertBlock(
  blocks: ProjectBlockMap,
  blockDef: BlockDef,
  opts: InsertBlockOpts = {},
): string {
  const id = uid();

  const block: ProjectBlock = {
    opcode: blockDef.opcode,
    next: null,
    parent: null,
    inputs: blockDef.inputs || {},
    fields: blockDef.fields || {},
    shadow: false,
    topLevel: false,
    ...(blockDef.mutation ? { mutation: blockDef.mutation } : {}),
  };

  const into = opts.intoInput;
  if (into) {
    const parent = blocks[into.parentId];
    if (!parent) {
      throw new Error(
        `intoInput parent "${into.parentId}" not found in blocks map`,
      );
    }
    block.parent = into.parentId;
    block.topLevel = false;

    const explicitShadow = into.shadow ?? null;
    const shadow =
      explicitShadow ?? shadowFallback(parent.inputs[into.inputName]);

    parent.inputs[into.inputName] = shadow != null ? [3, id, shadow] : [2, id];
    blocks[id] = block;
    return id;
  }

  if (opts.topLevel) {
    block.topLevel = true;
    block.x = opts.topLevel.x | 0;
    block.y = opts.topLevel.y | 0;
    blocks[id] = block;
    return id;
  }

  const afterId = opts.afterId;
  if (!afterId) {
    throw new Error("afterId is required unless topLevel is set");
  }

  const parent = blocks[afterId];
  if (!parent) {
    throw new Error(`afterId "${afterId}" not found in blocks map`);
  }

  // Splice into the linked list: parent -> new -> oldNext
  const oldNext = parent.next;
  parent.next = id;
  block.parent = afterId;
  block.next = oldNext;

  if (oldNext && blocks[oldNext]) {
    blocks[oldNext].parent = id;
  }

  blocks[id] = block;
  return id;
}

/**
 * Extracts the block ids referenced by a single input value.
 */
function inputBlockIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const ids: string[] = [];
  for (let i = 1; i < value.length; i++) {
    if (typeof value[i] === "string") ids.push(value[i] as string);
  }
  return ids;
}

/**
 * Extracts the shadow fallback (a primitive like `[10, ""]` or a shadow block
 * id) from an existing input value, so a reporter dropped into the slot can keep
 * the original default. Returns `null` when there is no reusable shadow.
 */
function shadowFallback(value: unknown): unknown | null {
  if (!Array.isArray(value)) return null;
  // [1, [4, "10"]] — a literal shadow primitive lives at index 1.
  if (value[0] === 1 && Array.isArray(value[1])) return value[1];
  // [3, blockId, shadow] — the shadow fallback lives at index 2.
  if (value[0] === 3 && value.length >= 3) return value[2];
  return null;
}

/**
 * Repoints (or removes) the input slot in `inputs` that references `oldId`.
 * Used when healing a stack after a block is deleted: a substack head is
 * repointed to the next block, or the slot is dropped when nothing follows.
 */
function replaceInputRef(
  inputs: ProjectBlock["inputs"],
  oldId: string,
  newId: string | null,
): void {
  for (const [key, value] of Object.entries(inputs)) {
    if (!Array.isArray(value)) continue;
    for (let i = 1; i < value.length; i++) {
      if (value[i] === oldId) {
        if (newId) {
          value[i] = newId;
        } else {
          delete inputs[key];
        }
        return;
      }
    }
  }
}

/**
 * Deletes a block and everything it owns through its inputs — its shadow
 * blocks, nested reporters, and substack bodies — following each owned block's
 * `next` chain so whole branches are removed. The starting block's own `next`
 * sibling is NOT followed; callers heal that link separately.
 */
function deleteOwnedChain(blocks: ProjectBlockMap, id: string): void {
  let current: string | null = id;
  while (current && blocks[current]) {
    const block: ProjectBlock = blocks[current];
    const next: string | null = block.next;
    for (const value of Object.values(block.inputs)) {
      for (const childId of inputBlockIds(value)) {
        deleteOwnedChain(blocks, childId);
      }
    }
    delete blocks[current];
    current = next;
  }
}

/**
 * Deletes a block from a target's `blocks` map, healing the surrounding stack
 * so the blocks that follow it stay connected. The block's own inputs (shadows,
 * nested reporters) and any blocks nested inside it (substack branches) are
 * removed with it.
 */
export function deleteBlock(blocks: ProjectBlockMap, id: string): void {
  const block = blocks[id];
  if (!block) {
    throw new Error(`block "${id}" not found in blocks map`);
  }

  const parentId = block.parent;
  const nextId = block.next;

  // Heal the surrounding stack: reconnect the following block to the parent.
  if (parentId && blocks[parentId]) {
    const parent = blocks[parentId];
    if (parent.next === id) {
      parent.next = nextId;
    } else {
      // The block sits in one of the parent's input slots (substack head or reporter).
      replaceInputRef(parent.inputs, id, nextId);
    }
  }
  if (nextId && blocks[nextId]) {
    blocks[nextId].parent = parentId;
  }

  // Remove the block plus everything it owns via its inputs. The `next` sibling
  // was healed above, so it is intentionally excluded here.
  for (const value of Object.values(block.inputs)) {
    for (const childId of inputBlockIds(value)) {
      deleteOwnedChain(blocks, childId);
    }
  }
  delete blocks[id];
}
