import { Collection } from "discord.js";
import { ExtendedClient, MessageCommand } from "../types";
import { readdirSync } from "fs";
import fs from "fs";
import path from "path";
import { Ollama } from "ollama";

export const ClientVar = async (client: ExtendedClient): Promise<void> => {
  client.commands = new Collection<string, MessageCommand>();
  client.aliases = new Map<string, string>();
  client.cooldowns = new Map<string, Collection<string, number>>();
  client.broadCastCache = new Map<string, any>();
  client.caches = new Map<string, any>();
  client.categories = readdirSync("./src/commands/");
  client.fetched = false;
  client.invitations = {};

  client.ollama = new Ollama({ host: "http://localhost:11434" });

  // Bot stats.
  let lines = 0;
  let letters = 0;
  let newInstances = 0;

  const excludedDirs = [
    "node_modules",
    "language",
    ".vscode",
    ".git",
    "gitbook",
  ];
  const excludedFiles = [
    "package-lock.json",
    ".env",
    "example.env",
    "pnpm.lock",
    "bun.lock",
    ".env",
    ".env.ci",
    ".env.ci.previous",
    ".env.previous",
    ".env.vault",
    ".gitignore",
  ];

  const newInstanceRegex = new RegExp(
    "new\\s+(Map|Collection|Set)\\s*(?:<(?:[^<>]|<[^<>]*>)*>)?\\s*\\(",
    "g",
  );

  const walk = (dir: string): string[] => {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      if (!excludedDirs.includes(file)) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(walk(filePath));
        } else {
          if (!excludedFiles.includes(path.basename(file))) {
            results.push(filePath);
          }
        }
      }
    });
    return results;
  };

  const files = walk(process.cwd());

  for (const source of files) {
    try {
      const data = fs.readFileSync(source, "utf8");
      letters += data.length;
      const dataLines = data.split("\n");
      lines += dataLines.length;

      // Check each line for new Map() or new Map<type, type>()
      for (const line of dataLines) {
        if (newInstanceRegex.test(line)) {
          newInstances++;
        }
      }
    } catch (e) {
      client.sentry?.captureException(e);
      console.error(e);
    }
  }

  client.data = {
    stats: {
      linesOfCode: lines,
      lettersOfCode: letters,
      MapAndSet: newInstances,
      files: files.length,
    },
  };
};
