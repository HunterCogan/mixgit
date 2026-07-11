export const EXT_TO_LANGUAGE: Record<string, string> = {
  py: "python",
  js: "javascript",
  ts: "typescript",
  html: "html",
  css: "css",
};

export function fileNameToLanguage(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_LANGUAGE[ext] ?? "plaintext";
}
