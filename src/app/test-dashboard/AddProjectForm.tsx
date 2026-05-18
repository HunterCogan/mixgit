"use client";

import { useState } from "react";
import {
  Description,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
  Button,
} from "@heroui/react";
import { handleCreateProject } from "./actions";
import { ProjectSchema } from "@/lib/schemas/project.zod";
import { useFormStatus } from "react-dom";

export default function AddProjectForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { pending } = useFormStatus();

  // Zod provides safeParse for client-side validation
  // validate recieves error messages defined in project.zod.ts

  return (
    <Form
      action={handleCreateProject}
      className="flex flex-col gap-2 w-full"
      validationBehavior="aria"
    >
      <TextField
        isRequired
        name="name"
        value={name}
        onChange={setName}
        validate={(value) => {
          const result = ProjectSchema.shape.name.safeParse(value);
          return result.success ? null : result.error.issues[0].message;
        }}
      >
        <Label>Title</Label>
        <Input placeholder="Our Amazing Project" />
        <Description>Choose a unique name for your project</Description>
        <FieldError />
      </TextField>
      <TextField
        name="description"
        value={description}
        onChange={setDescription}
        validate={(value) => {
          const result = ProjectSchema.shape.description.safeParse(value);
          return result.success
            ? null
            : (result.error.issues[0]?.message ?? null);
        }}
      >
        <Label>Description</Label>
        <Input placeholder="Made by a smart team of students!" />
        <Description>Write a short description for your project</Description>
        <FieldError />
      </TextField>
      <Button type="submit" isPending={pending}>
        Add Project
      </Button>
    </Form>
  );
}
