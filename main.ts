// The Dog Ate My Homework: Funniest Excuse
// make.fun bounty: u-agentfid001-the-dog-ate-my-homework-funniest-excuse-8659c98c
//
// The entry is a single line — the excuse a dog gives after being caught
// eating the homework — stored as a string constant in this repository.
// Running the program writes the line into the harness output directory
// as entry.txt, then reads the copy back and checks it against the
// original byte for byte, so the two graded runs always produce
// identical output. No network is used and nothing is read from
// outside the repository: the line is the deliverable.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The excuse, in the dog's own voice. One line, under 200 characters.
const EXCUSE =
  "The teacher said the dog ate my homework is the oldest excuse. So I made it true. You're welcome.";

// The gate allows 1 to 200 characters (code points).
const MIN_CHARS = 1;
const MAX_CHARS = 200;

// The harness sets MAKEFUN_OUTPUT_DIR; without it, write to /output.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outputPath = join(outputDir, "entry.txt");

function sha256Hex(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

// Check the line before writing it: 1–200 characters (counted in code
// points, so an emoji or accented letter counts once), not only white
// space, a single line, and no leading or trailing whitespace —
// otherwise the gate would refuse it instead of judging it.
function checkExcuse(line: string): void {
  const chars = [...line].length;
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    fail(`excuse must be ${MIN_CHARS}–${MAX_CHARS} characters, got ${chars}`);
  }
  if (line.trim().length === 0) {
    fail("excuse must not be only white space");
  }
  if (line.includes("\n") || line.includes("\r")) {
    fail("excuse must be a single line");
  }
  if (line !== line.trim()) {
    fail("excuse must not start or end with whitespace");
  }
  // The gate reads UTF-8 text: refuse a line that does not survive a
  // UTF-8 round trip unchanged (for example a lone surrogate), so what
  // is written is exactly the line that was checked.
  if (Buffer.from(line, "utf8").toString("utf8") !== line) {
    fail("excuse must be valid UTF-8 text");
  }
}

checkExcuse(EXCUSE);
console.log(`Excuse (${[...EXCUSE].length} characters): ${EXCUSE}`);
console.log(`Excuse sha256: ${sha256Hex(Buffer.from(EXCUSE, "utf8"))}`);

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, EXCUSE, "utf8");

// Read the copy back and prove it matches the original byte for byte.
const written = readFileSync(outputPath);
const original = Buffer.from(EXCUSE, "utf8");
if (!written.equals(original)) {
  fail(
    `copy mismatch: ${outputPath} is ${written.length} bytes, ` +
      `expected ${original.length}`,
  );
}

console.log(`Wrote ${written.length} bytes to ${outputPath} (byte-identical copy)`);
