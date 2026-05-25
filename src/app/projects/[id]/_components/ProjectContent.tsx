"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Chip,
  Link,
  ScrollShadow,
  Separator,
} from "@heroui/react";
import { parseScripts } from "@/lib/scratch";
import CreateRemixModal from "./CreateRemixModal";
import { ScriptsPanel } from "./ScriptsPanel";
import {
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export type RemixItem = {
  id: string;
  name: string;
  uploaderName: string;
  description: string;
  isMain: boolean;
  projectJsonData: string;
  createdAt: string;
};

interface Props {
  projectId: string;
  remixes: RemixItem[];
}

export function ProjectContent({ projectId, remixes }: Props) {
  const defaultId = (remixes.find((r) => r.isMain) ?? remixes[0])?.id ?? null;
  const [selectedId, setSelectedId] = useState<string | null>(defaultId);

  const selectedRemix = remixes.find((r) => r.id === selectedId) ?? null;

  const scripts = useMemo(() => {
    if (!selectedRemix?.projectJsonData) return {};
    try {
      return parseScripts(selectedRemix.projectJsonData);
    } catch {
      return {};
    }
  }, [selectedRemix]);

  return (
    <div className="flex gap-6 flex-1 min-h-0">
      <ScrollShadow
        className="w-100 shrink-0 flex flex-col gap-3 p-2"
        hideScrollBar
      >
        <h2 className="text-lg font-semibold">Remixes</h2>
        <CreateRemixModal projectId={projectId} />
        {remixes.length === 0 ? (
          <p className="text-sm text-gray-400">No remixes yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {remixes.map((remix) => (
              <Card
                key={remix.id}
                className={
                  remix.id === selectedId ? "ring-2 ring-green-500" : ""
                }
              >
                <Card.Header>
                  <Card.Title className="flex justify-between">
                    {remix.name}
                    {remix.isMain && (
                      <Chip color="success" variant="primary">
                        <Chip.Label>Main</Chip.Label>
                      </Chip>
                    )}
                  </Card.Title>
                  <Card.Description>Created {remix.createdAt}</Card.Description>
                </Card.Header>
                <Card.Content className="flex flex-row gap-2 items-center">
                  <Avatar>
                    <Avatar.Fallback>
                      {remix.uploaderName.substring(0, 2)}
                    </Avatar.Fallback>
                  </Avatar>
                  <span className="truncate"> {remix.description}</span>
                </Card.Content>
                <Card.Footer>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setSelectedId(remix.id)}
                  >
                    <EyeIcon />
                    View
                  </Button>
                </Card.Footer>
              </Card>
            ))}
          </div>
        )}
      </ScrollShadow>
      <Separator orientation="vertical"></Separator>
      <div className="flex-1 min-w-0 flex flex-col gap-3 p-2">
        <h2 className="text-lg font-semibold">{selectedRemix?.name}</h2>
        <ScriptsPanel scripts={scripts} />
        <Card variant="secondary">
          <Card.Header>
            <Card.Title>About this Remix</Card.Title>
            <Card.Description>
              Created {selectedRemix?.createdAt} by{" "}
              <Link href="#">{selectedRemix?.uploaderName}</Link>
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-row gap-2 items-center">
            <Avatar>
              <Avatar.Fallback>
                {selectedRemix?.uploaderName.substring(0, 2)}
              </Avatar.Fallback>
            </Avatar>
            {selectedRemix?.description}
          </Card.Content>
          <Card.Footer className="flex gap-2">
            <Button size="sm">
              <ArrowDownTrayIcon />
              Download
            </Button>
            <Button variant="danger" size="sm">
              <TrashIcon className="h-4 w-4" />
              Delete
            </Button>
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
}
