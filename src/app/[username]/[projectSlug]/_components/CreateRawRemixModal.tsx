"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  Button,
  ErrorMessage,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  Spinner,
  TextArea,
  TextField,
  useOverlayState,
} from "@heroui/react";
import { RemixSchema } from "@/lib/schemas/remix.zod";
import { useRouter } from "next/navigation";

const LANGUAGES = [
  { id: "python", label: "Python" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
];

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
  const [language, setLanguage] = useState<string>("python");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!name || !description) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/remixes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, language, creatorId }),
      });

      if (res.ok) {
        const data = await res.json();
        state.close();
        setName("");
        setDescription("");
        setLanguage("python");
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
      <Button isIconOnly size="sm" variant="ghost" className="h-6.5 w-6.5">
        <PlusIcon className="h-4 w-4" />
      </Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>New Raw Code Remix</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
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

                <Select
                  value={language}
                  onChange={(value) => setLanguage(value as string)}
                >
                  <Label>Language</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {LANGUAGES.map((lang) => (
                        <ListBox.Item
                          key={lang.id}
                          id={lang.id}
                          textValue={lang.label}
                        >
                          {lang.label}
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>

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
