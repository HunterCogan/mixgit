import { describe, expect, it } from "vitest";
import { validateProjectIntegrity } from "@/lib/scratch-validate";

describe("validateProjectIntegrity", () => {
  it("accepts a well-linked project", () => {
    const result = validateProjectIntegrity({
      targets: [
        {
          name: "Sprite1",
          blocks: {
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
              inputs: { MESSAGE: [1, [10, "Hi"]] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
          },
        },
      ],
    });
    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("flags a floating reporter that is also referenced as an input", () => {
    const result = validateProjectIntegrity({
      targets: [
        {
          name: "Sprite1",
          blocks: {
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
              inputs: { CONDITION: [2, "cond"] },
              fields: {},
              shadow: false,
              topLevel: false,
            },
            // Referenced by `if` but still marked topLevel with no parent — the
            // exact "insert reporter first, forget to re-parent" bug.
            cond: {
              opcode: "sensing_mousedown",
              next: null,
              parent: null,
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: true,
              x: 5,
              y: 5,
            },
          },
        },
      ],
    });
    expect(result.valid).toBe(false);
    const codes = result.issues.map((i) => i.code);
    expect(codes).toContain("toplevel-referenced");
    expect(codes).toContain("input-parent-mismatch");
  });

  it("flags an input that references a missing block", () => {
    const result = validateProjectIntegrity({
      targets: [
        {
          name: "Sprite1",
          blocks: {
            if: {
              opcode: "control_if",
              next: null,
              parent: null,
              inputs: { CONDITION: [2, "ghost"] },
              fields: {},
              shadow: false,
              topLevel: true,
              x: 0,
              y: 0,
            },
          },
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.issues.map((i) => i.code)).toContain("input-missing");
  });

  it("flags a next link whose child does not point back", () => {
    const result = validateProjectIntegrity({
      targets: [
        {
          name: "Sprite1",
          blocks: {
            a: {
              opcode: "control_wait",
              next: "b",
              parent: null,
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: true,
              x: 0,
              y: 0,
            },
            b: {
              opcode: "control_wait",
              next: null,
              parent: "someoneElse",
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          },
        },
      ],
    });
    expect(result.valid).toBe(false);
    const codes = result.issues.map((i) => i.code);
    expect(codes).toContain("next-parent-mismatch");
  });

  it("flags an orphan (no parent, not topLevel)", () => {
    const result = validateProjectIntegrity({
      targets: [
        {
          name: "Sprite1",
          blocks: {
            lonely: {
              opcode: "looks_say",
              next: null,
              parent: null,
              inputs: {},
              fields: {},
              shadow: false,
              topLevel: false,
            },
          },
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.issues.map((i) => i.code)).toContain("orphan");
  });

  it("returns an invalid-json issue for malformed input", () => {
    const result = validateProjectIntegrity("{ not json");
    expect(result.valid).toBe(false);
    expect(result.issues[0].code).toBe("invalid-json");
  });
});
