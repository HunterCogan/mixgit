import { verifySession } from "@/lib/dal";
import { Button, Card, Form, Surface } from "@heroui/react";
import Link from "next/link";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import mongoose from "mongoose";
import AddProjectForm from "./AddProjectForm";
import { handleLogout } from "./actions";

export default async function DashboardPage() {
  const session = await verifySession();

  await connectDB();
  const projects = await Project.find({
    creator: new mongoose.Types.ObjectId(session.userId),
  }).lean();

  return (
    <div className="min-h-screen flex items-center justify-center font-sans">
      <div className="flex flex-col gap-4 items-center justify-center">
        <div className="text-blue-500 text-2xl">
          Test Dashboard page, if logged in.
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <span className="text-blue-500">Name: {session.name}</span>
          <span className="text-blue-500">Email: {session.email}</span>
          <span className="text-blue-500">User ID: {session.userId}</span>
        </div>

        <AddProjectForm />

        <Surface
          variant="secondary"
          className="flex flex-col gap-2 w-full p-2 rounded-lg"
        >
          {projects.length === 0 ? (
            <p>No projects yet.</p>
          ) : (
            projects.map((p) => (
              <Card key={p._id}>
                <Card.Header>
                  <Card.Title>{p.name}</Card.Title>
                  <Card.Description>
                    Last changed: {p.updatedAt.toLocaleString()}
                  </Card.Description>
                </Card.Header>
                <Card.Content>{p.description}</Card.Content>
              </Card>
            ))
          )}
        </Surface>

        <Button variant="primary" className="w-fit">
          <Link href="/test-project">Go to Project</Link>
        </Button>

        <Form action={handleLogout}>
          <Button type="submit" variant="danger" className="w-fit">
            Log out
          </Button>
        </Form>
      </div>
    </div>
  );
}
