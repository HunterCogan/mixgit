// Maps a file extension to a Monaco Editor language id.
// Sourced from Monaco's own built-in basic-languages registrations,
// so any extension listed here is guaranteed to get real syntax highlighting.
export const EXT_TO_LANGUAGE: Record<string, string> = {
  py: "python",
  rpy: "python",
  pyw: "python",
  cpy: "python",
  gyp: "python",
  gypi: "python",

  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  es6: "javascript",

  ts: "typescript",
  tsx: "typescript",
  mts: "typescript",
  cts: "typescript",

  html: "html",
  htm: "html",
  xhtml: "html",
  shtml: "html",

  css: "css",
  scss: "scss",
  less: "less",

  json: "json",

  md: "markdown",
  markdown: "markdown",
  mdx: "mdx",

  yaml: "yaml",
  yml: "yaml",

  xml: "xml",
  xsd: "xml",
  svg: "xml",
  xaml: "xml",
  xsl: "xml",
  xslt: "xml",

  sql: "sql",

  sh: "shell",
  bash: "shell",

  ps1: "powershell",
  psm1: "powershell",
  psd1: "powershell",

  go: "go",
  rs: "rust",
  rlib: "rust",

  rb: "ruby",
  gemspec: "ruby",

  php: "php",
  phtml: "php",

  java: "java",
  jav: "java",

  cs: "csharp",
  csx: "csharp",

  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  hh: "cpp",
  hxx: "cpp",

  swift: "swift",

  kt: "kotlin",
  kts: "kotlin",

  scala: "scala",
  sc: "scala",
  sbt: "scala",

  lua: "lua",
  dart: "dart",

  r: "r",
  rmd: "r",

  jl: "julia",

  ex: "elixir",
  exs: "elixir",

  clj: "clojure",
  cljs: "clojure",
  cljc: "clojure",

  coffee: "coffeescript",

  bat: "bat",
  cmd: "bat",

  dockerfile: "dockerfile",

  graphql: "graphql",
  gql: "graphql",

  vb: "vb",

  fs: "fsharp",
  fsi: "fsharp",
  fsx: "fsharp",

  proto: "proto",

  tf: "hcl",
  tfvars: "hcl",
  hcl: "hcl",

  ini: "ini",

  toml: "ini",

  m: "objective-c",

  handlebars: "handlebars",
  hbs: "handlebars",

  txt: "plaintext",
};

export function fileNameToLanguage(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_LANGUAGE[ext] ?? "plaintext";
}

const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  less: "Less",
  json: "JSON",
  markdown: "Markdown",
  mdx: "MDX",
  yaml: "YAML",
  xml: "XML",
  sql: "SQL",
  shell: "Shell Script",
  powershell: "PowerShell",
  go: "Go",
  rust: "Rust",
  ruby: "Ruby",
  php: "PHP",
  java: "Java",
  csharp: "C#",
  cpp: "C++",
  swift: "Swift",
  kotlin: "Kotlin",
  scala: "Scala",
  lua: "Lua",
  dart: "Dart",
  r: "R",
  julia: "Julia",
  elixir: "Elixir",
  clojure: "Clojure",
  coffeescript: "CoffeeScript",
  bat: "Batch",
  dockerfile: "Dockerfile",
  graphql: "GraphQL",
  vb: "Visual Basic",
  fsharp: "F#",
  proto: "Protocol Buffers",
  hcl: "HCL / Terraform",
  ini: "INI",
  "objective-c": "Objective-C",
  handlebars: "Handlebars",
  plaintext: "Plain Text",
};

export function languageDisplayName(language: string): string {
  return LANGUAGE_DISPLAY_NAMES[language] ?? language;
}
