"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  ListBox,
  SearchField,
  Select,
  Separator,
  Spinner,
  Text,
} from "@heroui/react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Category = "users" | "projects";

type UserResult = {
  id: string;
  name: string;
  email: string;
  projectCount: number;
};

type ProjectResult = {
  id: string;
  name: string;
  creatorId: string;
  remixCount: number;
};

type SearchResult = UserResult | ProjectResult;

function isUserResult(r: SearchResult): r is UserResult {
  return "email" in r;
}

const ResultsList = ({
  results,
  onSelect,
  itemClassName = "px-3 py-2",
}: {
  results: SearchResult[];
  onSelect: (keys: Set<string> | "all") => void;
  itemClassName?: string;
}) => (
  <ListBox
    selectionMode="single"
    onSelectionChange={(keys) => onSelect(keys as Set<string> | "all")}
    aria-label="Search results"
  >
    {results.map((result, index) =>
      isUserResult(result) ? (
        <Fragment key={result.id}>
          <ListBox.Item
            id={result.id}
            textValue={result.name}
            className={`${itemClassName} rounded-lg`}
          >
            <div className="flex flex-col gap-0.5">
              <Text className="text-sm font-medium">{result.name}</Text>
              <Text className="text-xs text-nav-text-subtle">
                {result.email} &middot;{" "}
                {result.projectCount === 1
                  ? "1 project"
                  : `${result.projectCount} projects`}
              </Text>
            </div>
          </ListBox.Item>
          {index < results.length - 1 && <Separator />}
        </Fragment>
      ) : (
        <Fragment key={result.id}>
          <ListBox.Item
            id={result.id}
            textValue={result.name}
            className={`${itemClassName} rounded-lg`}
          >
            <div className="flex flex-col gap-0.5">
              <Text className="text-sm font-medium">{result.name}</Text>
              <Text className="text-xs text-nav-text-subtle">
                {result.remixCount === 1
                  ? "1 remix"
                  : `${result.remixCount} remixes`}
              </Text>
            </div>
          </ListBox.Item>
          {index < results.length - 1 && <Separator />}
        </Fragment>
      ),
    )}
  </ListBox>
);

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("projects");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setTimeout(() => {
        setResults([]);
        setOpen(false);
      }, 0);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&category=${category}`,
        );
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, category]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(keys: Set<string> | "all") {
    if (keys === "all" || keys.size === 0) return;
    const id = [...keys][0];
    const result = results.find((r) => r.id === id);
    if (!result) return;

    setOpen(false);
    setQuery("");

    if (isUserResult(result)) {
      router.push(`/users/${result.id}`);
    } else {
      router.push(`/projects/${result.creatorId}?projectId=${result.id}`);
    }
  }

  function handleCategoryChange(key: string) {
    setCategory(key as Category);
    setResults([]);
    setOpen(false);
  }

  function handleMobileClose() {
    setMobileOpen(false);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function handleMobileSelect(keys: Set<string> | "all") {
    handleSelect(keys);
    handleMobileClose();
  }

  const CategorySelect = (
    <Select
      value={category}
      variant="secondary"
      onChange={(val) => handleCategoryChange(String(val))}
      aria-label="Search category"
      className="w-20 shrink-0 border-r border-nav-border"
    >
      <Select.Trigger className="h-full rounded-none border-0 bg-transparent px-2 flex items-center justify-center">
        <Select.Value className="text-xs" />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover className="rounded-lg text-xs">
        <ListBox>
          <ListBox.Item
            id="projects"
            textValue="Projects"
            className="rounded-lg"
          >
            Projects
          </ListBox.Item>
          <ListBox.Item id="users" textValue="Users" className="rounded-lg">
            Users
          </ListBox.Item>
        </ListBox>
      </Select.Popover>
    </Select>
  );

  return (
    <>
      {/* Mobile search bar */}
      <Button
        isIconOnly
        variant="ghost"
        className="sm:hidden text-nav-text-subtle hover:bg-nav-item-hover hover:text-nav-text"
        onPress={() => setMobileOpen((o) => !o)}
        aria-label="Open search"
      >
        <MagnifyingGlassIcon className="h-6 w-6" />
      </Button>

      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 top-14 z-30 bg-nav-surface flex flex-col">
          <div className="flex items-center gap-2 p-3 border-b border-nav-border shrink-0">
            <SearchField
              value={query}
              onChange={setQuery}
              aria-label="Search"
              className="flex-1 min-w-0"
            >
              <SearchField.Group className="border border-nav-border rounded-lg">
                {CategorySelect}
                <SearchField.Input
                  placeholder="Search..."
                  className="min-w-0 w-full text-xs"
                />
                {loading ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <SearchField.SearchIcon className="mr-2" />
                )}
              </SearchField.Group>
            </SearchField>

            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              className="shrink-0 text-nav-text-subtle hover:bg-nav-item-hover hover:text-nav-text"
              onPress={handleMobileClose}
              aria-label="Close search"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {results.length > 0 ? (
              <ResultsList
                results={results}
                onSelect={handleMobileSelect}
                itemClassName="px-3 py-3"
              />
            ) : query.trim() && !loading ? (
              <p className="text-sm text-nav-text-subtle px-3 py-4">
                No results found
              </p>
            ) : !query.trim() ? (
              <p className="text-sm text-nav-text-subtle px-3 py-4">
                Search for{" "}
                {category === "users"
                  ? "Users by name or email"
                  : "Projects by name"}
              </p>
            ) : null}
          </div>
        </div>
      )}

      {/* Desktop search bar */}
      <div
        ref={containerRef}
        className="hidden sm:flex relative items-center gap-2 min-w-0 max-w-sm w-full ml-4"
      >
        <SearchField
          value={query}
          onChange={setQuery}
          aria-label="Search"
          className="min-w-0 w-full"
        >
          <SearchField.Group className="border border-nav-border rounded-lg">
            {CategorySelect}
            <SearchField.Input
              placeholder="Search..."
              title={
                category === "users"
                  ? "Search for a User by name or email"
                  : "Search for Projects by name"
              }
              className="min-w-0 w-full text-xs"
            />
            {loading ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <SearchField.SearchIcon className="mr-2" />
            )}
          </SearchField.Group>
        </SearchField>

        {open && (results.length > 0 || (!loading && query.trim())) && (
          <Card className="absolute top-full mt-1 left-0 w-full z-50 rounded-lg p-1">
            {results.length > 0 ? (
              <ResultsList results={results} onSelect={handleSelect} />
            ) : (
              <Card.Content className="px-4 py-3">
                <p className="text-xs text-nav-text-subtle">No results found</p>
              </Card.Content>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
