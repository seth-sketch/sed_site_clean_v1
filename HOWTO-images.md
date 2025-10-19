# How to add images and update projects.json

1) Create a folder per project at **media/<slug>/** (example: `media/gma-2025-studio/`).  
   - Put one **thumb** image (card cover) and any number of gallery images inside.

2) Open **tools/make-projects.html** locally in a browser.  
   - Fill in title/client/year/role/tags; drag in your thumb + gallery images (this page only records filenames).  
   - Click **Add Project** → copy the JSON from the bottom.

3) Paste the JSON entries into **assets/projects.json** (merge with existing array).

4) Deploy to Cloudflare Pages. The home tiles will use `thumb` if present; otherwise they show the title.
