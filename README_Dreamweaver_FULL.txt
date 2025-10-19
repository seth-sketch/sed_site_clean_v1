
Full Site — Dreamweaver Editing Guide

1) Unzip this folder locally.
2) Open Dreamweaver → Site → New Site…
   • Site Name: SED Site
   • Local Site Folder: choose this unzipped folder
3) In the Files panel, open index.html to preview layout.
4) Open css/site.dw.css and tweak variables at the top:
   --hero-x: 68%;     (50% center; larger = move the big logo to the right)
   --hero-size: 98%;  (100% = fill the box; 95–98% = breathing room)
   --hero-height: 440px; (height of the left hero box)
   --nav-logo-height: 0px; (set >0 only if you re-add a nav logo with class="nav-logo")
5) Save and Preview in Browser (File → Preview in Browser). No cache issues locally.
6) When ready, deploy these files to Cloudflare Pages as a preview build.
7) If you want a top logo, add <img class="nav-logo" src="assets/sed-logo-tight.svg" alt="SED"> and set --nav-logo-height.
