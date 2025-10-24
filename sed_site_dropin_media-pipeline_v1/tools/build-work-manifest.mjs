#!/usr/bin/env node
import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();
const SRC  = path.join(ROOT, "assets", "work");
const OUT  = path.join(ROOT, "assets", "work.json");

const exts = new Set([".jpg",".jpeg",".png",".webp",".gif",".avif",".mp4",".mov",".m4v",".webm"]);

function isMedia(file){ return exts.has(path.extname(file).toLowerCase()); }
function humanize(slug){
  return slug.replace(/[-_]+/g," ").replace(/^\w|\s\w/g, m => m.toUpperCase());
}

function naturalSort(a,b){
  return a.localeCompare(b, undefined, { numeric:true, sensitivity:"base" });
}

async function readJSON(file){
  try{ return JSON.parse(await fs.readFile(file,"utf8")); }catch{ return null; }
}

async function ensureDir(p){
  try{ await fs.mkdir(p, { recursive: true }); }catch{}
}

async function main(){
  await ensureDir(SRC);
  const entries = await fs.readdir(SRC, { withFileTypes: true });
  const projects = [];

  for (const dir of entries){
    if (!dir.isDirectory()) continue;
    const slug = dir.name;
    const abs  = path.join(SRC, slug);
    const listing = await fs.readdir(abs);
    const files = listing.filter(isMedia).sort(naturalSort);

    if (files.length === 0) continue;

    const meta = await readJSON(path.join(abs, "meta.json")) || {};
    const coverByName = files.find(f => /cover/i.test(f));
    const cover = meta.cover && files.includes(meta.cover) ? meta.cover : (coverByName || files[0]);

    const baseURL = `/assets/work/${slug}/`;
    const gallery = files.filter(f => f !== cover).map(f => baseURL + f);

    projects.push({
      slug,
      title: meta.title || humanize(slug),
      client: meta.client || "",
      year: meta.year || "",
      role: meta.role || "Production Designer",
      order: typeof meta.order === "number" ? meta.order : 9999,
      fit: meta.fit === "contain" ? "contain" : "cover",
      cover: baseURL + cover,
      gallery
    });
  }

  projects.sort((a,b) =>
    (a.order - b.order) ||
    (parseInt(b.year||0) - parseInt(a.year||0)) ||
    a.title.localeCompare(b.title)
  );

  await fs.writeFile(OUT, JSON.stringify(projects, null, 2) + "\n");
  console.log(`Wrote ${projects.length} projects → ${path.relative(ROOT, OUT)}`);
}

main().catch(err => { console.error(err); process.exit(1); });
