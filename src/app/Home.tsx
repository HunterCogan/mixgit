"use client";

import { Card, Label } from "@heroui/react";
import {
  PuzzlePieceIcon,
  CodeBracketSquareIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import LoginPage from "./login/Login";

const FEATURES = [
  {
    icon: PuzzlePieceIcon,
    title: "Scratch blocks & Python",
    description:
      "View and explore projects in block-based code like Scratch or typed languages like Python",
  },
  {
    icon: CodeBracketSquareIcon,
    title: "Remix any project",
    description: "Fork someone's game and make it your own in seconds",
  },
  {
    icon: UsersIcon,
    title: "Collaborate live",
    description: "Add collaborators and build together in real time",
  },
];

export default function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col items-center pl-12 pt-12 pb-12 pr-12 sm:pr-0 bg-secondary">
        <div className="flex flex-col flex-wrap items-center max-w-3xl w-full">
          <Label className="text-3xl font-semibold">
            Build games and programs with visual blocks
          </Label>
          <p className="opacity-80 mb-5">
            A collaborative coding playground where you remix projects, share
            scripts, and learn by doing.
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-3xl w-full">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="shadow-lg" variant="default">
              <Card.Header className="flex flex-row items-center gap-3">
                <Card
                  variant="secondary"
                  className="flex items-center justify-center w-10 h-10 p-0 rounded-md shrink-0"
                >
                  <feature.icon className="w-6 h-6" />
                </Card>
                <Card.Title className="text-xl font-semibold">
                  {feature.title}
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <Card.Description>{feature.description}</Card.Description>
              </Card.Content>
            </Card>
          ))}
        </div>
      </div>

      <LoginPage currentPage="home" />
    </div>
  );
}
