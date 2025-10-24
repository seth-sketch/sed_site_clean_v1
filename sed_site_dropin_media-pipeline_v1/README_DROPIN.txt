SED Drop‑in: Folder‑based media + hero copy
=============================================

What this gives you
-------------------
1) Folder‑based media for projects. Put any images/videos into:
   assets/work/<slug>/ and run `npm run build:data`. It auto‑creates assets/work.json.
2) Optional meta per project: assets/work/<slug>/meta.json (title, client, year, order, fit).
3) Project page 'contain' support: if fit:"contain" is set, large media won’t be crop‑filled.
4) Hero copy JSON: edit assets/home.json; js/home-copy.js renders it on the home page.

Install / Use
-------------
1) Copy the contents of this zip into your repo root. It will create:
   - tools/build-work-manifest.mjs
   - package.json  (adds script "build:data")
   - js/project.js (safe replacement; adds 'contain' support)
   - js/home-copy.js  (optional; only used on home when you include the script)
   - assets/home.json (editable hero text)
2) Run once locally:
   npm run build:data
   Commit the updated assets/work.json
3) Optional: on Cloudflare Pages, set the Build command to:
   npm run build:data && echo .

Folder structure example
------------------------
assets/
  work/
    gma-2025/
      meta.json
      cover.jpg
      img_001.jpg
      img_002.png
      hero.mp4
    this-week-4e/
      meta.json
      anything1.jpg
      anything2.webp

meta.json example
-----------------
{
  "title": "Good Morning America — 2025 Studio Revamp",
  "client": "ABC News",
  "year": "2025",
  "role": "Production Designer",
  "order": 1,
  "fit": "contain"
}

Notes
-----
- The generator picks 'cover.*' if present, else the first media file.
- Natural sort makes img_2.jpg come before img_10.jpg.
- Supported media: jpg, jpeg, png, webp, gif, avif, mp4, mov, m4v, webm.
