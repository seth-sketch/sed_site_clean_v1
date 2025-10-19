
UPDATE INSTRUCTIONS

Selected Work scroller (home):
- The band with borders is scrollable and lazy-loads projects in chunks.
- To add a show, edit assets/projects.json and append an object:
  {
    "title": "Show Name — Short Label",
    "slug": "show-name-short-label",
    "client": "ABC News",
    "year": "2025",
    "role": "Production Designer",
    "tags": ["ABC","Broadcast","Studio"],
    "featured": true
  }
- 'featured: true' puts it at the top of the home scroller.
- Then create (optional) a custom detail page at projects/<slug>/index.html,
  or leave as is (auto page already exists).

Press & Awards:
- Edit assets/press.json and assets/awards.json (home auto-renders them).

Deploy:
- Upload the folder to Cloudflare Pages (no build step).
