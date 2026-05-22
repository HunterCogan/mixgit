"use client";

import { Button } from "@heroui/react";
import { CalculatorIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [exampleNumber, setExampleNumber] = useState(0);
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center py-32 px-16 sm:items-start">
        <h1 className="text-4xl"> Welcome to Scratchpad</h1>

        <p className="mt-6">
          This is an example for the landing page of Scratchpad. We will make
          much more in the future.
        </p>

        <Button
          className="mt-6"
          onPress={() => setExampleNumber((prevNum) => prevNum + 1)}
        >
          <CalculatorIcon /> Example HeroUI button: {exampleNumber}
        </Button>

        <Button className="mt-6" onPress={() => router.push("/signup")}>
          Go to Signup
        </Button>
      </main>
    </div>
  );
}
