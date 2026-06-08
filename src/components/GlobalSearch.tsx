"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  ListBox,
  SearchField,
  Select,
  Separator,
  Spinner,
  Text,
} from "@heroui/react";

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

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("projects");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
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

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-2 min-w-0 max-w-sm w-full ml-4"
    >
      <SearchField
        value={query}
        onChange={setQuery}
        aria-label="Search"
        className="min-w-0 w-full"
      >
        <SearchField.Group className="border border-nav-border rounded-lg">
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
                <ListBox.Item
                  id="users"
                  textValue="Users"
                  className="rounded-lg"
                >
                  Users
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
          <SearchField.Input
            placeholder={
              category === "users"
                ? "Search by Name or Email..."
                : "Search by Project name..."
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
            <ListBox
              selectionMode="single"
              onSelectionChange={(keys) =>
                handleSelect(keys as Set<string> | "all")
              }
              aria-label="Search results"
            >
              {results.map((result, index) =>
                isUserResult(result) ? (
                  <Fragment key={result.id}>
                    <ListBox.Item
                      id={result.id}
                      textValue={result.name}
                      className="px-3 py-2 rounded-lg"
                    >
                      <div className="flex flex-col gap-0.5">
                        <Text className="text-sm font-medium">
                          {result.name}
                        </Text>
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
                      className="px-3 py-2 rounded-lg"
                    >
                      <div className="flex flex-col gap-0.5">
                        <Text className="text-sm font-medium">
                          {result.name}
                        </Text>
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
          ) : (
            <Card.Content className="px-4 py-3">
              <p className="text-xs text-nav-text-subtle">No results found</p>
            </Card.Content>
          )}
        </Card>
      )}
    </div>
  );
}
