import { describe, it, expect } from "vitest";
import { GET } from "./route";

describe("GET /api/auth/clear-session", () => {
  it("issues a redirect to the app root", () => {
    const res = GET();
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("adds a Set-Cookie header to all four session cookies", () => {
    const res = GET();

    // cookie.delete() adds a "Set-Cookie" header
    // getSetCookie() returns one string per Set-Cookie header
    const setCookies = res.headers.getSetCookie();
    const names = setCookies.map((c) => c.split("=")[0]);

    expect(names).toContain("better-auth.session_token");
    expect(names).toContain("better-auth.dont_remember");
    expect(names).toContain("__Secure-better-auth.session_token");
    expect(names).toContain("__Secure-better-auth.dont_remember");
  });

  it("expires each cookie to delete it", () => {
    const res = GET();
    const setCookies = res.headers.getSetCookie();
    for (const cookie of setCookies) {
      expect(cookie.toLowerCase()).toMatch("expires=thu, 01 jan 1970");
    }
  });
});
