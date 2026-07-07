"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false },
);

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
      language={language}
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
