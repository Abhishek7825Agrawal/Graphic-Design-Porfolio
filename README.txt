THE BREAK - ABHISHEK AGRAWAL
============================

RUN LOCALLY
- Use VS Code Live Server or another local HTTP server. No build step is needed.
- The site uses plain HTML, CSS, and JavaScript.
- GSAP and ScrollTrigger are served locally from assets/.

PRESERVED VERSION
- The files as found before this iteration are copied to
  archive/pre-the-break-redesign/.
- This workspace has no .git directory and no Git executable, so a branch named
  the-break-redesign could not be created here.

PORTRAIT
- The expected source is assets/abhishek-portrait.jpg.
- The image was not present in this repository during implementation. The hero
  shows a typographic fallback and skips the photo shatter until supplied.
- To enable it, add the clean original photo and set data-enabled="true" on the
  portrait image element in index.html.
- No generated face or substitute photo is used.

PROJECTS
- GYANI-AI, Smart-FIR, and CallTrace Pro are retained from existing portfolio
  content. Earlier illustrative application screenshot mockups were removed.
- No project screenshots, verified public demos, or source repository URLs were
  available in the project files; no such links are invented.

MOTION AND RESPONSIVE DESIGN
- GSAP ScrollTrigger pins the opening scene and scrubs its crack lines, 12 mobile
  / 24 desktop polygon shards, split world reveal, orange seam, and statement.
- The split becomes stacked on small screens. Scrolling backward reverses it.
- prefers-reduced-motion disables the pinned timeline and leaves content visible.
- Responsive breakpoints: 370px, 700px, 900px.

LICENSE
- GSAP terms are noted in assets/gsap-license.txt.
