/** Поиск по каталогу референсов.
 *  Примеры:
 *    node tools/search.mjs глитч
 *    node tools/search.mjs --cat maps
 *    node tools/search.mjs --cat stats --lic mit счётчик
 *    node tools/search.mjs --ids RCE-STAT-001 OML-MAPS-001   (выбор по ID)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const cat = JSON.parse(fs.readFileSync(path.join(ROOT, "catalog.json"), "utf-8"));

const args = process.argv.slice(2);
const get = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args.splice(i, 2)[1] : null;
};
const catFilter = get("--cat");
const licFilter = get("--lic");
let ids = [];
const idsIdx = args.indexOf("--ids");
if (idsIdx >= 0) { ids = args.splice(idsIdx, 2)[1].split(","); }
const query = args.join(" ").toLowerCase();

let items = cat.items;
if (ids.length) items = items.filter((i) => ids.includes(i.id));
if (catFilter) items = items.filter((i) => i.category === catFilter);
if (licFilter === "mit") items = items.filter((i) => i.commercial === true);
if (licFilter === "warn") items = items.filter((i) => i.commercial !== true);
if (query) {
  items = items.filter((i) =>
    `${i.id} ${i.title} ${i.title_ru} ${i.description} ${(i.tags || []).join(" ")}`.toLowerCase().includes(query),
  );
}

const CATRU = Object.fromEntries(cat.categories);
console.log(`найдено: ${items.length}`);
for (const i of items) {
  const comm = i.commercial === true ? "коммерч.✅" : i.commercial === "verify" ? "⚠️ознакомление" : i.commercial;
  console.log(`${i.id}  [${CATRU[i.category] || i.category}]  ${i.title_ru} — ${i.title}  (${i.license}, ${comm})`);
  console.log(`   демо: ${i.demo}`);
  if (i.code_path) console.log(`   код:  ${i.code_path}`);
}
