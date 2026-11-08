/** Синхронизирует catalog.json и demos/ внутрь gallery/ — делает её самодостаточной для раздачи. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const G = path.join(ROOT, "gallery");

fs.copyFileSync(path.join(ROOT, "catalog.json"), path.join(G, "catalog.json"));
fs.cpSync(path.join(ROOT, "demos"), path.join(G, "demos"), { recursive: true });
console.log("gallery synced:", path.join(G, "index.html"));
