"use client";

import { useState, useEffect, useRef } from "react";
import { Button, SearchField, Separator, Spinner, Text } from "@heroui/react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

export type UserResult = {
  id: string;
  name: string;
  email: string;
  projectCount: number;
};

interface Props {
  teamIds: string[];
  creatorId: string;
  onAdd: (user: UserResult) => Promise<void>;
  onRemove: (user: UserResult) => Promise<void>;
}

export default function UserSearch({
  teamIds,
  creatorId,
  onAdd,
  onRemove,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) return;

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&category=users`,
        );
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const displayResults = query.trim()
    ? results.filter((u) => u.id !== creatorId)
    : [];

  async function handleAdd(user: UserResult) {
    setAddingId(user.id);
    try {
      await onAdd(user);
    } finally {
      setAddingId(null);
    }
  }

  async function handleRemove(user: UserResult) {
    setRemovingId(user.id);
    try {
      await onRemove(user);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 bg-nav-surface z-10 px-1 py-2">
        <SearchField
          value={query}
          onChange={setQuery}
          aria-label="Search users"
          className="w-full"
        >
          <SearchField.Group className="border border-nav-border rounded-lg">
            <SearchField.Input
              placeholder="Search..."
              className="w-full text-sm"
            />
            {loading ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <SearchField.SearchIcon className="mr-2" />
            )}
          </SearchField.Group>
        </SearchField>
      </div>

      {displayResults.length > 0 && (
        <div className="flex flex-col">
          {displayResults.map((user, index) => {
            const isAdded = teamIds.includes(user.id);
            const isAdding = addingId === user.id;
            const isRemoving = removingId === user.id;
            return (
              <div key={user.id}>
                <div className="flex items-center justify-between gap-3 px-1 py-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <Text className="text-sm font-medium truncate">
                      {user.name}
                    </Text>
                    <Text className="text-xs text-nav-text-subtle truncate">
                      {user.email} &middot;{" "}
                      {user.projectCount === 1
                        ? "1 project"
                        : `${user.projectCount} projects`}
                    </Text>
                  </div>
                  {isAdded ? (
                    <Button
                      size="sm"
                      variant="danger-soft"
                      isDisabled={isRemoving}
                      onPress={() => handleRemove(user)}
                      className="shrink-0"
                    >
                      {isRemoving ? (
                        <Spinner size="sm" />
                      ) : (
                        <MinusIcon className="h-4 w-4" />
                      )}
                      {isRemoving ? "Removing..." : "Remove"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      isDisabled={isAdding}
                      onPress={() => handleAdd(user)}
                      className="shrink-0"
                    >
                      {isAdding ? (
                        <Spinner size="sm" />
                      ) : (
                        <PlusIcon className="h-4 w-4" />
                      )}
                      {isAdding ? "Adding..." : "Add"}
                    </Button>
                  )}
                </div>
                {index < displayResults.length - 1 && <Separator />}
              </div>
            );
          })}
        </div>
      )}

      {!loading && query.trim() && displayResults.length === 0 && (
        <p className="text-sm text-nav-text-subtle py-2">No users found</p>
      )}
    </div>
  );
}
