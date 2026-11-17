import fs from "node:fs";
import path from "node:path";
import { emptyState } from "./logic";
import type { State } from "./types";

const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "state.json");

export function loadState(): State {
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return {
      swipes: Array.isArray(parsed.swipes) ? parsed.swipes : [],
      matches: Array.isArray(parsed.matches) ? parsed.matches : [],
    };
  } catch {
    return emptyState(); // file doesn't exist yet
  }
}

export function saveState(state: State): void {
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
}