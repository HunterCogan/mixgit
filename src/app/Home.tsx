"use client";

import Link from "next/link";
import { Button, Card, Surface } from "@heroui/react";
import {
  SparklesIcon,
  Square3Stack3DIcon,
  PuzzlePieceIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { ScriptStack } from "./[username]/[projectSlug]/_components/ScriptStack";
import type { Script } from "@/types";

const DEMO: Script = {
  hatBlockId: "hat",
  hat: {
    id: "hat",
    opcode: "event_whenflagclicked",
    next: "say",
    parent: null,
    inputs: {},
    fields: {},
    shadow: false,
    topLevel: true,
    x: 0,
    y: 0,
  },
  blocks: [
    {
      id: "hat",
      opcode: "event_whenflagclicked",
      next: "say",
      parent: null,
      inputs: {},
      fields: {},
      shadow: false,
      topLevel: true,
      x: 0,
      y: 0,
    },
    {
      id: "say",
      opcode: "looks_sayforsecs",
      next: "repeat",
      parent: "hat",
      inputs: {
        MESSAGE: [1, [10, "Hi!"]],
        SECS: [1, [4, "2"]],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    },
    {
      id: "repeat",
      opcode: "control_repeat",
      next: null,
      parent: "say",
      inputs: {
        TIMES: [1, [6, "10"]],
        SUBSTACK: [2, "move"],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    },
    {
      id: "move",
      opcode: "motion_movesteps",
      next: "turn",
      parent: "repeat",
      inputs: {
        STEPS: [1, [4, "10"]],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    },
    {
      id: "turn",
      opcode: "motion_turnright",
      next: null,
      parent: "move",
      inputs: {
        DEGREES: [1, [8, "15"]],
      },
      fields: {},
      shadow: false,
      topLevel: false,
    },
  ],
};

const ACCENTS = {
  blue: {
    icon: "bg-brand-blue/12 text-brand-blue",
    border: "border-brand-blue/30",
  },
  orange: {
    icon: "bg-brand-orange/12 text-brand-orange",
    border: "border-brand-orange/30",
  },
  green: {
    icon: "bg-brand-green/12 text-brand-green",
    border: "border-brand-green/30",
  },
} as const;

const FEATURES = [
  {
    icon: Square3Stack3DIcon,
    accent: "blue",
    title: "Projects & Remixes",
    description:
      "A student-friendly take on branches and pull requests. Iterate without fear of breaking things.",
  },
  {
    icon: PuzzlePieceIcon,
    accent: "orange",
    title: "Block parser",
    description:
      "Reconstructs your full program and shows it as clean, indented, readable block stacks.",
  },
  {
    icon: SparklesIcon,
    accent: "green",
    title: "AI code review",
    description:
      "Claude returns plain-language structured feedback on your code, tuned to a 5th grade reading level.",
  },
  {
    icon: UsersIcon,
    accent: "blue",
    title: "Collaboration",
    description:
      "Invite collaborators to a project and browse everything that's been shared with you.",
  },
  {
    icon: MagnifyingGlassIcon,
    accent: "orange",
    title: "Search",
    description:
      "Find users and projects fast, and easily view collaboration history.",
  },
  {
    icon: LockClosedIcon,
    accent: "green",
    title: "Privacy",
    description:
      "Device-identifiable metadata is stripped from every upload before it's stored.",
  },
] as const;

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-brand-blue/30 via-brand-blue/10 to-brand-green/30">
      <section className="mx-auto grid max-w-6xl gap-12 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-24 lg:grid-cols-2 lg:items-center">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 text-center lg:mx-0 lg:max-w-none lg:items-start lg:text-left">
          <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
            Mix projects, Git that speaks your language.
          </h1>
          <p className="max-w-prose text-lg text-muted">
            MixGit brings collaboration, version history, and beginner-friendly
            code review to young learners. Share your work as Remixes and let
            Claude explain your blocks in plain language.
          </p>
          <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-brand-orange/90 px-10 font-semibold text-white hover:bg-brand-orange"
              >
                Get started
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="ghost"
                className="border border-brand-blue/10 hover:bg-brand-blue/10 px-10"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl lg:max-w-none">
          <Surface className="relative rounded-3xl p-8 bg-grid border border-brand-green/30 shadow-lg">
            <div className="flex justify-center lg:justify-start">
              <ScriptStack script={DEMO} />
            </div>
            <Card
              variant="secondary"
              className="mx-auto mt-4 w-full max-w-[300px] shadow-lg lg:absolute lg:mx-0 lg:left-50 lg:top-50 lg:mt-0 lg:-rotate-2"
            >
              <Card.Header>
                <Card.Title className="flex items-center gap-1 font-semibold text-brand-blue">
                  <SparklesIcon className="h-4 w-4" />
                  AI Feedback
                </Card.Title>
                <Card.Description>
                  Nice loop! Your sprite repeats and turns smoothly. Try adding
                  a{" "}
                  <span className="text-category-control font-semibold font-mono">
                    wait
                  </span>{" "}
                  block so the spin is easier to see.
                </Card.Description>
              </Card.Header>
            </Card>
          </Surface>
        </div>
      </section>

      <section id="features" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card
                key={feature.title}
                className={`border shadow-lg ${ACCENTS[feature.accent].border}`}
              >
                <Card.Header>
                  <Card.Title className="flex items-center gap-1 font-semibold text-lg">
                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-md shrink-0 ${ACCENTS[feature.accent].icon}`}
                    >
                      <feature.icon className="w-5 h-5" />
                    </span>
                    {feature.title}
                  </Card.Title>
                  <Card.Description className="mt-2">
                    {feature.description}
                  </Card.Description>
                </Card.Header>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
