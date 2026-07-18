"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Description,
  ErrorMessage,
  FieldError,
  Form,
  Input,
  Label,
  Modal,
  Spinner,
  TextArea,
  TextField,
  Tooltip,
  useOverlayState,
} from "@heroui/react";
import { FileNameSchema, RemixSchema } from "@/lib/schemas/remix.zod";
import { fileNameToLanguage, languageDisplayName } from "@/lib/language";
import { useRouter } from "next/navigation";

export default function CreateRawRemixModal({
  projectId,
  creatorId,
  onCreated,
}: {
  projectId: string;
  creatorId: string;
  onCreated?: (id: string) => void;
}) {
  const state = useOverlayState();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!name || !description || !fileName) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/remixes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, fileName, creatorId }),
      });

      if (res.ok) {
        const data = await res.json();
        state.close();
        setName("");
        setDescription("");
        setFileName("");
        setSubmitted(false);
        router.refresh();
        onCreated?.(data.remix._id);
      } else {
        const data = await res.json();
        setError(
          typeof data.error === "string"
            ? data.error
            : "Failed to create remix",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal state={state}>
      <Tooltip delay={0}>
        <Tooltip.Trigger>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label="New Raw Code Remix"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>Create a new Raw Code Remix</p>
        </Tooltip.Content>
      </Tooltip>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>New Raw Code Remix</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="px-1 mb-2 text-sm">
                You can add more files after creating this Remix — each
                file&apos;s extension (like <code>.py</code> or <code>.js</code>
                ) sets its own language.
              </p>
              <Form
                className="flex flex-col gap-4 p-1"
                validationBehavior="aria"
                onSubmit={handleSubmit}
              >
                <TextField
                  isRequired
                  name="name"
                  value={name}
                  onChange={setName}
                  validate={(value) => {
                    if (!submitted && !value) return null;
                    if (!value) return "Name is required";
                    const result = RemixSchema.shape.name.safeParse(value);
                    return result.success
                      ? null
                      : result.error.issues[0].message;
                  }}
                >
                  <Label>Name</Label>
                  <Input variant="secondary" placeholder='"my-python-remix"' />
                  <FieldError />
                </TextField>

                <TextField
                  isRequired
                  name="description"
                  value={description}
                  onChange={setDescription}
                  validate={(value) => {
                    if (!submitted && !value) return null;
                    if (!value) return "Description is required";
                    const result =
                      RemixSchema.shape.description.safeParse(value);
                    return result.success
                      ? null
                      : result.error.issues[0].message;
                  }}
                >
                  <Label>Description</Label>
                  <TextArea
                    variant="secondary"
                    rows={2}
                    placeholder='"Added a sorting algorithm"'
                  />
                  <FieldError />
                </TextField>

                <TextField
                  isRequired
                  name="fileName"
                  value={fileName}
                  onChange={setFileName}
                  validate={(value) => {
                    if (!submitted && !value) return null;
                    const result = FileNameSchema.safeParse(value);
                    return result.success
                      ? null
                      : result.error.issues[0].message;
                  }}
                >
                  <Label>File name</Label>
                  <Input
                    variant="secondary"
                    placeholder='"main.py", "app.js", "index.html"'
                  />
                  <Description>
                    {fileName
                      ? `Detected language: ${languageDisplayName(fileNameToLanguage(fileName))}`
                      : "The extension you choose (like .py or .js) sets this file's language."}
                  </Description>
                  <FieldError />
                </TextField>

                <ErrorMessage>{error}</ErrorMessage>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isPending={loading}
                >
                  {loading && <Spinner size="sm" />}
                  {loading ? "Creating..." : "Create Remix"}
                </Button>
              </Form>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
