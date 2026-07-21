type BlockLike = {
  next?: string | null;
  parent?: string | null;
  inputs?: Record<string, unknown>;
  topLevel?: boolean;
};

type BlockMapLike = Record<string, BlockLike>;

export type ProjectLike = {
  targets?: Array<{ name?: string; blocks?: BlockMapLike }>;
};

export type ProjectIntegrityCode =
  | "invalid-json"
  | "no-targets"
  | "self-reference"
  | "next-missing"
  | "next-parent-mismatch"
  | "input-missing"
  | "input-parent-mismatch"
  | "parent-missing"
  | "parent-not-linked"
  | "orphan"
  | "toplevel-has-parent"
  | "toplevel-referenced";

export type ProjectIntegrityIssue = {
  target: string;
  blockId: string;
  code: ProjectIntegrityCode;
  message: string;
};

export type ProjectIntegrityResult = {
  valid: boolean;
  issues: ProjectIntegrityIssue[];
};

function inputBlockIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const ids: string[] = [];
  for (let i = 1; i < value.length; i++) {
    if (typeof value[i] === "string") ids.push(value[i] as string);
  }
  return ids;
}

function inputRefs(
  inputs: Record<string, unknown>,
): { name: string; id: string }[] {
  const refs: { name: string; id: string }[] = [];
  for (const [name, value] of Object.entries(inputs)) {
    for (const id of inputBlockIds(value)) refs.push({ name, id });
  }
  return refs;
}

/**
 * Validates the structural integrity of a Scratch `project.json`, focusing on
 * the block linkage that edits must preserve.
 */
export function validateProjectIntegrity(
  project: unknown,
): ProjectIntegrityResult {
  let parsed: ProjectLike;
  if (typeof project === "string") {
    try {
      parsed = JSON.parse(project) as ProjectLike;
    } catch {
      return {
        valid: false,
        issues: [
          {
            target: "",
            blockId: "",
            code: "invalid-json",
            message: "project.json is not valid JSON",
          },
        ],
      };
    }
  } else if (project && typeof project === "object") {
    parsed = project as ProjectLike;
  } else {
    return {
      valid: false,
      issues: [
        {
          target: "",
          blockId: "",
          code: "invalid-json",
          message: "project.json is not valid JSON",
        },
      ],
    };
  }

  if (!Array.isArray(parsed.targets)) {
    return {
      valid: false,
      issues: [
        {
          target: "",
          blockId: "",
          code: "no-targets",
          message: "project has no targets array",
        },
      ],
    };
  }

  const issues: ProjectIntegrityIssue[] = [];

  for (const target of parsed.targets) {
    const name = target?.name ?? "";
    const blocks = (target?.blocks ?? {}) as BlockMapLike;

    // child id -> parent ids that reference it (via `next` or an input slot).
    const referencedBy = new Map<string, Set<string>>();
    const addRef = (child: string, parent: string) => {
      const set = referencedBy.get(child) ?? new Set<string>();
      set.add(parent);
      referencedBy.set(child, set);
    };
    for (const [id, block] of Object.entries(blocks)) {
      if (block.next) addRef(block.next, id);
      for (const { id: childId } of inputRefs(block.inputs ?? {})) {
        addRef(childId, id);
      }
    }

    const push = (
      blockId: string,
      code: ProjectIntegrityCode,
      message: string,
    ) => issues.push({ target: name, blockId, code, message });

    for (const [id, block] of Object.entries(blocks)) {
      if (block.next === id || block.parent === id) {
        push(id, "self-reference", `block "${id}" references itself`);
      }

      if (block.next) {
        const nextBlock = blocks[block.next];
        if (!nextBlock) {
          push(id, "next-missing", `next "${block.next}" does not exist`);
        } else if (nextBlock.parent !== id) {
          push(
            id,
            "next-parent-mismatch",
            `next "${block.next}" has parent "${nextBlock.parent}", expected "${id}"`,
          );
        }
      }

      for (const { name: inputName, id: childId } of inputRefs(
        block.inputs ?? {},
      )) {
        const child = blocks[childId];
        if (!child) {
          push(
            id,
            "input-missing",
            `input "${inputName}" references missing block "${childId}"`,
          );
        } else if (child.parent !== id) {
          push(
            id,
            "input-parent-mismatch",
            `input "${inputName}" child "${childId}" has parent "${child.parent}", expected "${id}"`,
          );
        }
      }

      if (block.parent) {
        const parent = blocks[block.parent];
        if (!parent) {
          push(id, "parent-missing", `parent "${block.parent}" does not exist`);
        } else if (!(referencedBy.get(id)?.has(block.parent) ?? false)) {
          push(
            id,
            "parent-not-linked",
            `parent "${block.parent}" does not reference this block via next or inputs`,
          );
        }
      } else if (!block.topLevel) {
        push(id, "orphan", `block "${id}" has no parent but is not topLevel`);
      }

      if (block.topLevel) {
        if (block.parent) {
          push(
            id,
            "toplevel-has-parent",
            `topLevel block "${id}" also has parent "${block.parent}"`,
          );
        }
        const refs = referencedBy.get(id);
        if (refs && refs.size > 0) {
          push(
            id,
            "toplevel-referenced",
            `topLevel block "${id}" is also referenced by ${[...refs].join(", ")}`,
          );
        }
      }
    }
  }

  return { valid: issues.length === 0, issues };
}
