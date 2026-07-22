import { describe, expect, it } from "vitest";
import {
  deleteBlock,
  insertBlock,
  uid,
  type ProjectBlockMap,
} from "@/lib/scratch-edit";
import { validateProjectIntegrity } from "@/lib/scratch-validate";

describe("uid", () => {
  it("returns a 20-character id from the Scratch soup", () => {
    const id = uid();
    expect(id).toHaveLength(20);
    expect(id).toMatch(/^[!#%()*+,\-./:;=?@[\]^_`{|}~A-Za-z0-9]{20}$/);
  });

  it("returns different ids across calls", () => {
    const ids = new Set(Array.from({ length: 20 }, () => uid()));
    expect(ids.size).toBeGreaterThan(1);
  });
});

describe("insertBlock", () => {
  it("splices a block into an existing stack", () => {
    const blocks: ProjectBlockMap = {
      hat: {
        opcode: "event_whenflagclicked",
        next: "say",
        parent: null,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: true,
        x: 0,
        y: 0,
      },
      say: {
        opcode: "looks_say",
        next: null,
        parent: "hat",
        inputs: { MESSAGE: [1, [10, "Hello"]] },
        fields: {},
        shadow: false,
        topLevel: false,
      },
    };

    const waitId = insertBlock(
      blocks,
      {
        opcode: "control_wait",
        inputs: { DURATION: [1, [4, 2]] },
      },
      { afterId: "say" },
    );

    expect(blocks.say.next).toBe(waitId);
    expect(blocks[waitId].parent).toBe("say");
    expect(blocks[waitId].next).toBeNull();
    expect(blocks[waitId].opcode).toBe("control_wait");
  });

  it("re-points the displaced next block's parent", () => {
    const blocks: ProjectBlockMap = {
      a: {
        opcode: "motion_movesteps",
        next: "c",
        parent: null,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: true,
        x: 10,
        y: 10,
      },
      c: {
        opcode: "motion_turnright",
        next: null,
        parent: "a",
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },
    };

    const b = insertBlock(blocks, { opcode: "control_wait" }, { afterId: "a" });

    expect(blocks.a.next).toBe(b);
    expect(blocks[b].next).toBe("c");
    expect(blocks.c.parent).toBe(b);
  });

  it("creates a top-level stack", () => {
    const blocks: ProjectBlockMap = {};
    const id = insertBlock(
      blocks,
      { opcode: "event_whenflagclicked" },
      { topLevel: { x: 100, y: 200 } },
    );

    expect(blocks[id].topLevel).toBe(true);
    expect(blocks[id].x).toBe(100);
    expect(blocks[id].y).toBe(200);
    expect(blocks[id].parent).toBeNull();
  });
});

describe("deleteBlock", () => {
  it("heals the stack when a middle block is removed", () => {
    const blocks: ProjectBlockMap = {
      hat: {
        opcode: "event_whenflagclicked",
        next: "say",
        parent: null,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: true,
        x: 0,
        y: 0,
      },
      say: {
        opcode: "looks_say",
        next: "move",
        parent: "hat",
        inputs: { MESSAGE: [1, [10, "Hello"]] },
        fields: {},
        shadow: false,
        topLevel: false,
      },
      move: {
        opcode: "motion_movesteps",
        next: null,
        parent: "say",
        inputs: { STEPS: [1, [4, 10]] },
        fields: {},
        shadow: false,
        topLevel: false,
      },
    };

    deleteBlock(blocks, "say");

    expect(blocks.say).toBeUndefined();
    expect(blocks.hat.next).toBe("move");
    expect(blocks.move.parent).toBe("hat");
  });

  it("removes reporter blocks nested in the deleted block's inputs", () => {
    const blocks: ProjectBlockMap = {
      hat: {
        opcode: "event_whenflagclicked",
        next: "set",
        parent: null,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: true,
        x: 0,
        y: 0,
      },
      set: {
        opcode: "data_setvariableto",
        next: null,
        parent: "hat",
        inputs: { VALUE: [3, "rand", [10, ""]] },
        fields: { VARIABLE: ["score", "scoreId"] },
        shadow: false,
        topLevel: false,
      },
      rand: {
        opcode: "operator_random",
        next: null,
        parent: "set",
        inputs: { FROM: [1, [4, 1]], TO: [1, [4, 10]] },
        fields: {},
        shadow: false,
        topLevel: false,
      },
    };

    deleteBlock(blocks, "set");

    expect(blocks.set).toBeUndefined();
    expect(blocks.rand).toBeUndefined();
    expect(blocks.hat.next).toBeNull();
  });

  it("repoints a substack input to the next block in the branch", () => {
    const blocks: ProjectBlockMap = {
      if: {
        opcode: "control_if",
        next: null,
        parent: null,
        inputs: { SUBSTACK: [2, "first"] },
        fields: {},
        shadow: false,
        topLevel: true,
        x: 0,
        y: 0,
      },
      first: {
        opcode: "looks_show",
        next: "second",
        parent: "if",
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },
      second: {
        opcode: "looks_hide",
        next: null,
        parent: "first",
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },
    };

    deleteBlock(blocks, "first");

    expect(blocks.first).toBeUndefined();
    expect(blocks.if.inputs.SUBSTACK).toEqual([2, "second"]);
    expect(blocks.second.parent).toBe("if");
  });

  it("throws when the block id is missing", () => {
    const blocks: ProjectBlockMap = {};
    expect(() => deleteBlock(blocks, "nope")).toThrow();
  });
});

describe("insertBlock intoInput", () => {
  it("nests a boolean reporter into a slot and wires both directions", () => {
    const blocks: ProjectBlockMap = {
      if: {
        opcode: "control_if",
        next: null,
        parent: null,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: true,
        x: 0,
        y: 0,
      },
    };

    const id = insertBlock(
      blocks,
      { opcode: "sensing_touchingobject" },
      { intoInput: { parentId: "if", inputName: "CONDITION" } },
    );

    // Boolean slot: no shadow fallback.
    expect(blocks.if.inputs.CONDITION).toEqual([2, id]);
    expect(blocks[id].parent).toBe("if");
    expect(blocks[id].topLevel).toBe(false);
  });

  it("nests a menu shadow block with input mode 1", () => {
    const blocks: ProjectBlockMap = {
      touch: {
        opcode: "sensing_touchingobject",
        next: null,
        parent: "if",
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },
    };

    const id = insertBlock(
      blocks,
      {
        opcode: "sensing_touchingobjectmenu",
        fields: { TOUCHINGOBJECTMENU: ["Ben", null] },
        shadow: true,
      },
      { intoInput: { parentId: "touch", inputName: "TOUCHINGOBJECTMENU" } },
    );

    expect(blocks.touch.inputs.TOUCHINGOBJECTMENU).toEqual([1, id]);
    expect(blocks[id].shadow).toBe(true);
    expect(blocks[id].parent).toBe("touch");
    expect(blocks[id].fields).toEqual({ TOUCHINGOBJECTMENU: ["Ben", null] });
  });

  it("nests a value reporter with a shadow fallback", () => {
    const blocks: ProjectBlockMap = {
      set: {
        opcode: "data_setvariableto",
        next: null,
        parent: "hat",
        inputs: {},
        fields: { VARIABLE: ["score", "scoreId"] },
        shadow: false,
        topLevel: false,
      },
    };

    const id = insertBlock(
      blocks,
      {
        opcode: "operator_random",
        inputs: { FROM: [1, [4, 1]], TO: [1, [4, 10]] },
      },
      { intoInput: { parentId: "set", inputName: "VALUE", shadow: [10, ""] } },
    );

    expect(blocks.set.inputs.VALUE).toEqual([3, id, [10, ""]]);
    expect(blocks[id].parent).toBe("set");
  });

  it("reuses an existing shadow already sitting in the slot", () => {
    const blocks: ProjectBlockMap = {
      move: {
        opcode: "motion_movesteps",
        next: null,
        parent: "hat",
        inputs: { STEPS: [1, [4, 10]] },
        fields: {},
        shadow: false,
        topLevel: false,
      },
    };

    const id = insertBlock(
      blocks,
      {
        opcode: "operator_add",
        inputs: { NUM1: [1, [4, 1]], NUM2: [1, [4, 2]] },
      },
      { intoInput: { parentId: "move", inputName: "STEPS" } },
    );

    expect(blocks.move.inputs.STEPS).toEqual([3, id, [4, 10]]);
  });

  it("throws when the parent block is missing", () => {
    const blocks: ProjectBlockMap = {};
    expect(() =>
      insertBlock(
        blocks,
        { opcode: "operator_gt" },
        { intoInput: { parentId: "nope", inputName: "CONDITION" } },
      ),
    ).toThrow();
  });

  it("produces a project that passes integrity validation", () => {
    const blocks: ProjectBlockMap = {
      hat: {
        opcode: "event_whenflagclicked",
        next: "if",
        parent: null,
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: true,
        x: 0,
        y: 0,
      },
      if: {
        opcode: "control_if",
        next: null,
        parent: "hat",
        inputs: {},
        fields: {},
        shadow: false,
        topLevel: false,
      },
    };

    const eqId = insertBlock(
      blocks,
      { opcode: "operator_equals", inputs: { OPERAND2: [1, [10, "1"]] } },
      { intoInput: { parentId: "if", inputName: "CONDITION" } },
    );
    insertBlock(
      blocks,
      {
        opcode: "looks_costumenumbername",
        fields: { NUMBER_NAME: ["number", null] },
      },
      {
        intoInput: { parentId: eqId, inputName: "OPERAND1", shadow: [10, ""] },
      },
    );

    const result = validateProjectIntegrity({
      targets: [{ name: "Sprite1", blocks }],
    });
    expect(result.valid).toBe(true);
  });
});
