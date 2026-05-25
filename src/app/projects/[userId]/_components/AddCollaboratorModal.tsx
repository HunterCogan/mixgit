"use client";

import { useState } from "react";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Description,
  ErrorMessage,
  FieldError,
  Form,
  Label,
  Modal,
  SearchField,
  Spinner,
  useOverlayState,
} from "@heroui/react";

function SubmitButton({ isPending }: { isPending?: boolean }) {
  return (
    <Button type="submit" variant="primary" fullWidth isPending={isPending}>
      {isPending && <Spinner size="sm" />}
      {isPending ? "Adding..." : "Send Invitation"}
    </Button>
  );
}

export default function AddCollaboratorModal({
  projectId,
}: {
  projectId: string;
}) {
  const state = useOverlayState();
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setSubmitted(true);

    setLoading(true);
    try {
      // TODO: implement when UPDATE route is ready
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal state={state}>
      <Button variant="outline" fullWidth>
        <UserPlusIcon />
        Add Collaborator
      </Button>
      <Modal.Backdrop variant="blur">
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Add Collaborator</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <Form
                className="flex flex-col gap-4 p-1"
                validationBehavior="aria"
                onSubmit={handleSubmit}
              >
                <SearchField
                  isRequired
                  name="username"
                  value={username}
                  onChange={setUsername}
                  validate={(value) => {
                    if (!submitted && !value) return null;
                    if (!value) return "Username is required";
                    return null;
                  }}
                >
                  <Label>Username</Label>
                  <SearchField.Group>
                    <SearchField.SearchIcon />
                    <SearchField.Input placeholder="Search users..." />
                  </SearchField.Group>
                  <Description>Search by username or email</Description>
                  <FieldError />
                </SearchField>
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
