import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const messagesDir = path.join(rootDir, "src/i18n/messages");
const noPath = path.join(messagesDir, "no.json");
const enPath = path.join(messagesDir, "en.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getKind(value) {
  if (Array.isArray(value)) {
    return "array";
  }

  if (value === null) {
    return "null";
  }

  return typeof value;
}

function compareStructure(a, b, pathPrefix, errors) {
  const kindA = getKind(a);
  const kindB = getKind(b);

  if (kindA !== kindB) {
    errors.push(
      `${pathPrefix || "<root>"} has mismatched types: no=${kindA}, en=${kindB}`,
    );
    return;
  }

  if (kindA === "array") {
    if (a.length !== b.length) {
      errors.push(
        `${pathPrefix || "<root>"} has different array length: no=${a.length}, en=${b.length}`,
      );
    }

    const maxLength = Math.max(a.length, b.length);
    for (let index = 0; index < maxLength; index += 1) {
      if (index >= a.length || index >= b.length) {
        continue;
      }

      compareStructure(a[index], b[index], `${pathPrefix}[${index}]`, errors);
    }

    return;
  }

  if (kindA === "object") {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    for (const key of aKeys) {
      if (!(key in b)) {
        errors.push(
          `${pathPrefix ? `${pathPrefix}.` : ""}${key} exists in no.json but is missing in en.json`,
        );
      }
    }

    for (const key of bKeys) {
      if (!(key in a)) {
        errors.push(
          `${pathPrefix ? `${pathPrefix}.` : ""}${key} exists in en.json but is missing in no.json`,
        );
      }
    }

    for (const key of aKeys) {
      if (!(key in b)) {
        continue;
      }

      compareStructure(
        a[key],
        b[key],
        pathPrefix ? `${pathPrefix}.${key}` : key,
        errors,
      );
    }

    return;
  }
}

const noMessages = readJson(noPath);
const enMessages = readJson(enPath);
const errors = [];

compareStructure(noMessages, enMessages, "", errors);

if (errors.length > 0) {
  console.error("i18n parity check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("i18n parity check passed.");
