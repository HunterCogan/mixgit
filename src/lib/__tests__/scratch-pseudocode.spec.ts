import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import {
  computeIndents,
  inputLabel,
  rawToPseudocode,
} from "../scratch-pseudocode";
import type { Script } from "@/types";

// Helpers
function makeScript(
  overrides: Partial<Script["blocks"][number]>[] = [],
): Script["blocks"] {
  return overrides.map((o, i) => ({
    id: `block-${i}`,
    opcode: "motion_movesteps",
    next: null,
    parent: null,
    inputs: {},
    fields: {},
    shadow: false,
    topLevel: i === 0,
    ...o,
  }));
}

// computeIndents
describe("computeIndents", () => {
  it("sequential blocks share the same indent level", () => {
    const blocks = makeScript([
      { id: "a", parent: null, next: "b" },
      { id: "b", parent: "a", next: null },
    ]);
    expect(computeIndents(blocks)).toEqual([0, 0]);
  });

  it("nested input block is indented one level deeper than parent", () => {
    const blocks = makeScript([
      { id: "a", parent: null, next: null },
      { id: "b", parent: "a", next: null },
    ]);
    expect(computeIndents(blocks)).toEqual([0, 1]);
  });

  it("sequential chain after a nested block shares the nested indent", () => {
    const blocks = makeScript([
      { id: "a", parent: null, next: null },
      { id: "b", parent: "a", next: "c" },
      { id: "c", parent: "b", next: null },
    ]);
    expect(computeIndents(blocks)).toEqual([0, 1, 1]);
  });

  it("non-sequential block after a nested chain returns to the original indent", () => {
    const blocks = makeScript([
      { id: "a", parent: null, next: "c" },
      { id: "b", parent: "a", next: null },
      { id: "c", parent: "a", next: null },
    ]);
    expect(computeIndents(blocks)).toEqual([0, 1, 0]);
  });

  it("returns 0 when parent id is not in the block list", () => {
    const blocks = makeScript([
      { id: "a", parent: null, next: null },
      { id: "b", parent: "a", next: null },
      { id: "c", parent: "unknown-id", next: null },
    ]);
    expect(computeIndents(blocks)).toEqual([0, 1, 0]);
  });
});

// inputLabel
describe("inputLabel", () => {
  it("number → numeric string", () => {
    expect(inputLabel({ type: "number", value: 42 })).toBe("42");
  });

  it("string with non-numeric value → quoted", () => {
    expect(inputLabel({ type: "string", value: "hello" })).toBe('"hello"');
  });

  it("string with numeric value → unquoted", () => {
    expect(inputLabel({ type: "string", value: "10" })).toBe("10");
  });

  it("color → hex string", () => {
    expect(inputLabel({ type: "color", value: "#ff0000" })).toBe("#ff0000");
  });

  it("broadcast → @name", () => {
    expect(inputLabel({ type: "broadcast", name: "my message" })).toBe(
      "@my message",
    );
  });

  it("variable → (name)", () => {
    expect(inputLabel({ type: "variable", name: "score", id: "uid-1" })).toBe(
      "(score)",
    );
  });

  it("list → (name)", () => {
    expect(inputLabel({ type: "list", name: "items", id: "uid-2" })).toBe(
      "(items)",
    );
  });

  it("block → [ ]", () => {
    expect(inputLabel({ type: "block", blockId: "some-id" })).toBe("[ ]");
  });

  it("empty → null", () => {
    expect(inputLabel({ type: "empty" })).toBeNull();
  });
});

// rawToPseudocode
describe("rawToPseudocode", () => {
  const RAW_PROJECT_JSON = readFileSync(
    join(__dirname, "../defaults/project.json"),
    "utf-8",
  );

  it("returns raw input unchanged when JSON is invalid", () => {
    const bad = "if you're reading this, hi, welcome to the repo! - adonis";
    expect(rawToPseudocode(bad)).toBe(bad);
  });

  it("produces the expected pseudocode for the default project", () => {
    expect(rawToPseudocode(RAW_PROJECT_JSON)).toBe(
      `Target: Stage
Costumes: [backdrop1]
No scripts

Target: Sprite1
Costumes: [costume1]
event_whenflagclicked():
\tlooks_say(MESSAGE="Hello, World!")`,
    );
  });

  it("filters to Stage only", () => {
    expect(rawToPseudocode(RAW_PROJECT_JSON, ["Stage"])).toBe(
      `Target: Stage
Costumes: [backdrop1]
No scripts`,
    );
  });

  it("filters to Sprite1 only", () => {
    expect(rawToPseudocode(RAW_PROJECT_JSON, ["Sprite1"])).toBe(
      `Target: Sprite1
Costumes: [costume1]
event_whenflagclicked():
\tlooks_say(MESSAGE="Hello, World!")`,
    );
  });
});
