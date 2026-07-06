"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Checkbox,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  Modal,
  Spinner,
  TextArea,
  TextField,
  useOverlayState,
} from "@heroui/react";
import { ProjectSchema } from "@/lib/schemas/project.zod";
import { generateSlug } from "@/lib/slugify";
import { useRouter } from "next/navigation";

// Confirmation button that show on the Modal and submits the Form inputs
function SubmitButton({ isPending }: { isPending?: boolean }) {
  return (
    <Button type="submit" variant="primary" fullWidth isPending={isPending}>
      {isPending && <Spinner size="sm" />}
      {isPending ? "Creating..." : "Create Project"}
    </Button>
  );
}

// Modal that contains the form for creating a new project. It is opened with the Create New Project button.
export default function CreateProjectModal() {
  const state = useOverlayState();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  function toggleTag(tag: string) {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
      return;
    }

    if (tags.length >= 3) {
      return;
    }

    setTags([...tags, tag]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          tags,
        }),
      });

      if (res.ok) {
        setName("");
        setDescription("");
        setSubmitted(false);
        setError(null);
        state.close();
        router.refresh();
      } else {
        const { error } = await res.json().catch(() => ({}));
        setError(
          typeof error === "string" ? error : "Failed to create project",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal state={state}>
      <Button variant="primary">
        <PlusIcon className="h-4 w-4" />
        Create New Project
      </Button>
      <Modal.Backdrop>
        <Modal.Container size="md">
          <Modal.Dialog>
            <Modal.CloseTrigger className="m-2" />
            <Modal.Header>
              <Modal.Heading className="text-2xl">
                New MixGit Project
              </Modal.Heading>
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
                    if (!value) return "Project name is required";
                    const result = ProjectSchema.shape.name.safeParse(value);
                    return result.success
                      ? null
                      : result.error.issues[0].message;
                  }}
                >
                  <Label>Title</Label>
                  <Input
                    variant="secondary"
                    placeholder='"My Awesome MixGit Project!"'
                    aria-label="Project title"
                  />
                  {name.trim() && (
                    <Description>URL: /{generateSlug(name)}</Description>
                  )}
                  <FieldError />
                </TextField>

                <TextField
                  name="description"
                  value={description}
                  onChange={setDescription}
                  validate={(value) => {
                    if (!value) return null;
                    const result =
                      ProjectSchema.shape.description.safeParse(value);
                    return result.success
                      ? null
                      : (result.error.issues[0]?.message ?? null);
                  }}
                >
                  <Label>Description</Label>
                  <TextArea
                    variant="secondary"
                    aria-label="Project description"
                    placeholder='"Made by a smart team of students!"'
                    rows={2}
                    className="resize-y max-h-65"
                    maxLength={500}
                  />
                  <Description>
                    Write a short description for your project
                  </Description>
                  <FieldError />
                </TextField>

                <div className="flex flex-col gap-2 w-full">
                  <Label>Categories (max 3)</Label>

                  <div className="flex flex-wrap gap-3">
                    {["Game", "Tool", "Art", "Music", "Story"].map((tag) => (
                      <Checkbox
                        key={tag}
                        isSelected={tags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                        variant="secondary"
                      >
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>

                        <Checkbox.Content>
                          <Label>{tag}</Label>
                        </Checkbox.Content>
                      </Checkbox>
                    ))}
                  </div>

                  <Description>
                    Select up to 3 categories for your project
                  </Description>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                <SubmitButton isPending={loading} />
              </Form>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
