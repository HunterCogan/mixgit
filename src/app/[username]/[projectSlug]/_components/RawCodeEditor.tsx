"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false },
);

const LANGUAGE_MAP: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  html: "html",
  css: "css",
};

interface RawCodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language: string;
  readOnly?: boolean;
}

export default function RawCodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
}: RawCodeEditorProps) {
  return (
    <MonacoEditor
      height="100%"
      language={LANGUAGE_MAP[language] ?? "plaintext"}
      value={value}
      onChange={(val) => onChange?.(val ?? "")}
      options={{
        readOnly,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 13,
        lineNumbers: "on",
        wordWrap: "off",
        automaticLayout: true,
        padding: { top: 8, bottom: 8 },
        scrollbar: {
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
        },
      }}
    />
  );
}
