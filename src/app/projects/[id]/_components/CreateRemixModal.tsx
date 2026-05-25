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
  useOverlayState,
} from "@heroui/react";
import { RemixSchema } from "@/lib/schemas/remix.zod";
import { useRouter } from "next/navigation";

function SubmitButton({ isPending }: { isPending?: boolean }) {
  return (
    <Button type="submit" variant="primary" fullWidth isPending={isPending}>
      {isPending && <Spinner size="sm" />}
      {isPending ? "Creating..." : "Create Remix"}
    </Button>
  );
}

export default function CreateRemixModal({ projectId }: { projectId: string }) {
  const state = useOverlayState();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectData, setProjectData] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!description.trim() || !projectData.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/remixes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, projectData }),
      });

      if (res.ok) {
        state.close();
        router.refresh();
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
      <Button>
        <PlusIcon />
        New Remix
      </Button>
      <Modal.Backdrop variant="blur">
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>New Remix</Modal.Heading>
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
                  <Input
                    variant="secondary"
                    placeholder='"v2 - fixed jumping"'
                  />
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
                  <Input
                    variant="secondary"
                    placeholder='"Fixed the jumping mechanic"'
                  />
                  <Description>
                    Describe what changed in this version
                  </Description>
                  <FieldError />
                </TextField>

                <TextField
                  isRequired
                  name="projectData"
                  value={projectData}
                  onChange={setProjectData}
                  validate={(value) => {
                    if (!submitted && !value) return null;
                    if (!value) return "Project data is required";
                    return null;
                  }}
                >
                  <Label>Project Data</Label>
                  <TextArea
                    variant="secondary"
                    rows={6}
                    placeholder="Paste project.json here…"
                  />
                  <Description>
                    The project.json contents for this version
                  </Description>
                  <FieldError />
                </TextField>
                <ErrorMessage>{error}</ErrorMessage>
                <SubmitButton isPending={loading} />
              </Form>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
