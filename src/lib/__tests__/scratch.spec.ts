import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import {
  parsePrimitive,
  getInputValue,
  getFieldValue,
  getAllInputValues,
  getAllFieldValues,
  getScripts,
  parseScripts,
  parseMutationArray,
  parseProcedureCode,
} from "../scratch";
import type { Block } from "@/types";

// Helpers
function makeBlock(overrides: Partial<Block> = {}): Block {
  return {
    id: "test-block",
    opcode: "motion_movesteps",
    next: null,
    parent: null,
    inputs: {},
    fields: {},
    shadow: false,
    topLevel: false,
    ...overrides,
  };
}

// parsePrimitive
describe("parsePrimitive", () => {
  it.each([4, 5, 6, 7, 8] as const)("code %i → number", (code) => {
    expect(parsePrimitive([code, "42"])).toEqual({ type: "number", value: 42 });
  });

  it("code 4 coerces numeric string to number", () => {
    expect(parsePrimitive([4, "3.14"])).toEqual({
      type: "number",
      value: 3.14,
    });
  });

  it("code 9 → color", () => {
    expect(parsePrimitive([9, "#ff0000"])).toEqual({
      type: "color",
      value: "#ff0000",
    });
  });

  it("code 10 → string", () => {
    expect(parsePrimitive([10, "hello"])).toEqual({
      type: "string",
      value: "hello",
    });
  });

  it("code 11 → broadcast", () => {
    expect(parsePrimitive([11, "my message"])).toEqual({
      type: "broadcast",
      name: "my message",
    });
  });

  it("code 12 → variable", () => {
    expect(parsePrimitive([12, "score", "uid-1"])).toEqual({
      type: "variable",
      name: "score",
      id: "uid-1",
    });
  });

  it("code 13 → list", () => {
    expect(parsePrimitive([13, "items", "uid-2"])).toEqual({
      type: "list",
      name: "items",
      id: "uid-2",
    });
  });
});

// getInputValue
describe("getInputValue", () => {
  it("returns empty for a missing key", () => {
    const block = makeBlock();
    expect(getInputValue(block, "STEPS")).toEqual({ type: "empty" });
  });

  it("returns empty when second element is null", () => {
    const block = makeBlock({ inputs: { SUBSTACK: [2, null] } });
    expect(getInputValue(block, "SUBSTACK")).toEqual({ type: "empty" });
  });

  it("resolves an inline primitive", () => {
    const block = makeBlock({ inputs: { STEPS: [1, [4, "10"]] } });
    expect(getInputValue(block, "STEPS")).toEqual({
      type: "number",
      value: 10,
    });
  });

  it("resolves a reporter block ID", () => {
    const block = makeBlock({ inputs: { STEPS: [1, "reporter-block-id"] } });
    expect(getInputValue(block, "STEPS")).toEqual({
      type: "block",
      blockId: "reporter-block-id",
    });
  });

  it("resolves a reporter block with a shadow fallback", () => {
    const block = makeBlock({
      inputs: { STEPS: [1, "reporter-id", "shadow-id"] },
    });
    expect(getInputValue(block, "STEPS")).toEqual({
      type: "block",
      blockId: "reporter-id",
    });
  });
});

// getFieldValue
describe("getFieldValue", () => {
  it("returns the display value for an existing field", () => {
    const block = makeBlock({ fields: { KEY_OPTION: ["right arrow", null] } });
    expect(getFieldValue(block, "KEY_OPTION")).toBe("right arrow");
  });

  it("returns null for a missing field", () => {
    const block = makeBlock();
    expect(getFieldValue(block, "KEY_OPTION")).toBeNull();
  });
});

// getAllInputValues
describe("getAllInputValues", () => {
  it("returns an empty record when the block has no inputs", () => {
    expect(getAllInputValues(makeBlock())).toEqual({});
  });

  it("maps every input key to its resolved value", () => {
    const block = makeBlock({
      inputs: {
        STEPS: [1, [4, "10"]],
        MESSAGE: [1, [10, "hi"]],
      },
    });
    expect(getAllInputValues(block)).toEqual({
      STEPS: { type: "number", value: 10 },
      MESSAGE: { type: "string", value: "hi" },
    });
  });
});

// getAllFieldValues
describe("getAllFieldValues", () => {
  it("returns an empty record when the block has no fields", () => {
    expect(getAllFieldValues(makeBlock())).toEqual({});
  });

  it("maps every field key to its display string", () => {
    const block = makeBlock({
      fields: {
        DIRECTION: ["left-right", null],
        KEY_OPTION: ["space", null],
      },
    });
    expect(getAllFieldValues(block)).toEqual({
      DIRECTION: "left-right",
      KEY_OPTION: "space",
    });
  });
});

// getScripts
describe("getScripts", () => {
  // Project: https://scratch.mit.edu/projects/212835544/
  const RAW_PROJECT_JSON = readFileSync(
    join(__dirname, "/__fixtures__/scratch.json"),
    "utf-8",
  );
  const project = JSON.parse(RAW_PROJECT_JSON);

  it("finds all 14 scripts across all targets", () => {
    const scripts = getScripts(project);
    const total = Object.values(scripts).reduce((sum, s) => sum + s.length, 0);
    expect(total).toBe(14);
  });

  it("every script has a valid hat block marked topLevel", () => {
    const scripts = getScripts(project);
    Object.values(scripts)
      .flat()
      .forEach((s) => {
        expect(s.hat.topLevel).toBe(true);
        expect(s.hat.shadow).toBe(false);
        expect(s.blocks[0].opcode).toBe(s.hat.opcode);
      });
  });

  it("Stage has 1 script with 17 blocks", () => {
    const scripts = getScripts(project);
    expect(scripts["Stage"]).toHaveLength(1);
    expect(scripts["Stage"][0].blocks).toHaveLength(17);
    expect(scripts["Stage"][0].hat.opcode).toBe("event_whenflagclicked");
  });

  it("Cat1 Flying has 1 script with 39 blocks", () => {
    const scripts = getScripts(project);
    expect(scripts["Cat1 Flying"]).toHaveLength(1);
    expect(scripts["Cat1 Flying"][0].blocks).toHaveLength(39);
    expect(scripts["Cat1 Flying"][0].hat.opcode).toBe("event_whenflagclicked");
  });

  it("Cat1 Flying with excludeReporters=true has 18 blocks", () => {
    const noReporters = getScripts(project, true)["Cat1 Flying"][0];
    expect(noReporters.blocks.length).toEqual(18);
  });

  it("Heart, Heart2, Heart3 each have 3 scripts", () => {
    const scripts = getScripts(project);
    expect(scripts["Heart"]).toHaveLength(3);
    expect(scripts["Heart2"]).toHaveLength(3);
    expect(scripts["Heart3"]).toHaveLength(3);
  });

  it("Heart broadcast scripts listen for scratchTouched and scratchHeal", () => {
    const scripts = getScripts(project);
    const broadcastHats = scripts["Heart"].filter(
      (s) => s.hat.opcode === "event_whenbroadcastreceived",
    );
    const messages = broadcastHats.map((s) =>
      getFieldValue(s.hat, "BROADCAST_OPTION"),
    );
    expect(messages).toContain("scratchTouched");
    expect(messages).toContain("scratchHeal");
  });

  it("Parrot has 1 start_as_clone script with 23 blocks", () => {
    const scripts = getScripts(project);
    expect(scripts["Parrot"]).toHaveLength(1);
    expect(scripts["Parrot"][0].hat.opcode).toBe("control_start_as_clone");
    expect(scripts["Parrot"][0].blocks).toHaveLength(23);
  });

  it("Cloud has 2 scripts", () => {
    const scripts = getScripts(project);
    expect(scripts["Cloud"]).toHaveLength(2);
  });

  it("Cloud start_as_clone script has 18 blocks", () => {
    const scripts = getScripts(project);
    const cloneScript = scripts["Cloud"].find(
      (s) => s.hat.opcode === "control_start_as_clone",
    )!;
    expect(cloneScript.blocks).toHaveLength(18);
  });

  it("excludeReporters=true has all targets with same or fewer blocks than full traversal", () => {
    const full = getScripts(project);
    const excludeReporters = getScripts(project, true);
    Object.keys(full).forEach((target) => {
      expect(excludeReporters[target]).toBeDefined();
      expect(excludeReporters[target].length).toBeLessThanOrEqual(
        full[target].length,
      );
    });
  });
});

// parseMutationArray
describe("parseMutationArray", () => {
  it("parses a valid JSON string array", () => {
    expect(parseMutationArray('["x","y","z"]')).toEqual(["x", "y", "z"]);
  });

  it("returns [] for undefined input", () => {
    expect(parseMutationArray(undefined)).toEqual([]);
  });
});

// parseProcedureCode
describe("parseProcedureCode", () => {
  it("replaces %s/%n/%b placeholders with labeled args", () => {
    expect(
      parseProcedureCode("move %n steps in %s direction %b", [
        "10",
        "right",
        "fast",
      ]),
    ).toBe("move (10) steps in (right) direction (fast)");
  });
});

// parseScripts
describe("parseScripts", () => {
  const RAW_PROJECT_JSON = readFileSync(
    join(__dirname, "/__fixtures__/scratch.json"),
    "utf-8",
  );

  it("produces identical output to getScripts when given the same project", () => {
    expect(parseScripts(RAW_PROJECT_JSON)).toEqual(
      getScripts(JSON.parse(RAW_PROJECT_JSON)),
    );
  });
});
