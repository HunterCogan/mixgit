import fs from "fs";
import path from "path";

// get the usernames that are reserved because the app already uses those page routes
export function getReservedUsernames(): string[] {
  const appDir = path.join(process.cwd(), "src", "app");
  return fs
    .readdirSync(appDir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.name.startsWith("[") &&
        !entry.name.startsWith("_") &&
        entry.name !== "api",
    )
    .map((entry) => entry.name);
}
