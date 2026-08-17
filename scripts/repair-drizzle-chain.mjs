import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";

const metadataDir = "drizzle/meta";
const currentFile = `${metadataDir}/0008_snapshot.json`;
const previousFile = `${metadataDir}/0007_snapshot.json`;
const backupFile = `${metadataDir}/0008_snapshot.json.pre-product-visibility.bak`;
const backupOutsideMetadata = "drizzle/0008_snapshot.json.pre-product-visibility.bak";

if (existsSync(backupFile)) renameSync(backupFile, backupOutsideMetadata);

const current = JSON.parse(readFileSync(currentFile, "utf8"));
const previous = JSON.parse(readFileSync(previousFile, "utf8"));

if (current.prevId !== previous.prevId) {
  throw new Error(`Snapshots não pertencem ao mesmo ramo: ${current.prevId} !== ${previous.prevId}`);
}

const originalParent = current.prevId;
current.prevId = previous.id;
writeFileSync(currentFile, JSON.stringify(current));

console.log(JSON.stringify({ currentFile, originalParent, newParent: current.prevId, previousSnapshot: previous.id }));
