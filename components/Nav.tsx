"use client";

import { useLayoutEffect, useState } from "react";
import MindPatternLogo from "./logos/MindPattern";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import Github from "./logos/GitHub";
import pkg from '@/package.json';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export const Nav = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useLayoutEffect(() => {
    const el = document.documentElement;

    if (el.classList.contains("dark")) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);

  const toggleDark = () => {
    const el = document.documentElement;
    el.classList.toggle("dark");
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div
      className={
        "px-4 py-2 flex items-center h-14 z-50 bg-card border-b border-border"
      }
    >
      <div>
        <MindPatternLogo className={"h-5 w-auto"} />
      </div>
      <div className={"ml-auto flex items-center gap-2"}>
        <Button
          onClick={() => {
            window.open(
              pkg.homepage,
              "_blank",
              "noopener noreferrer"
            );
          }}
          variant={"ghost"}
          className={"flex items-center gap-1.5"}
        >
          <span>
            <Github className={"size-4"} />
          </span>
          <span className={"text-xs"}>GitHub</span>
        </Button>
        <Button
          onClick={toggleDark}
          variant={"ghost"}
          size={"icon"}
          className={"size-9"}
        >
          {isDarkMode ? (
            <Sun className={"size-4"} />
          ) : (
            <Moon className={"size-4"} />
          )}
        </Button>
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="default">
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "size-9",
              }
            }}
          />
        </SignedIn>
      </div>
    </div>
  );
};
