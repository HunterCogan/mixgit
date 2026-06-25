import { describe, it, expect } from "vitest";
import { escapeForTag } from "../anthropic";

// escapeForTag
describe("escapeForTag", () => {
  it("replaces both < and > in a tag", () => {
    expect(escapeForTag("<instruction>")).toBe("&lt;instruction&gt;");
  });
  it("leaves strings with no angle brackets unchanged", () => {
    expect(escapeForTag("hello world")).toBe("hello world");
  });
});
