<div align="left">
<img width="120" height="47" alt="FRAZIYM TECH & AI" src="logo-mark.svg" />
</div>

# FRAZIYM TECH & AI — Official Website

The official website of **FRAZIYM TECH & AI**, a local-first autonomous AI company founded by Akik Faraji (19, Dhaka, Bangladesh). Built as a pure static site — HTML, CSS, and JavaScript. No frameworks. No build tools. No dependencies.

---

## What's inside

### The Company
FRAZIYM builds original AI systems — not GPT wrappers, not fine-tuned models, not chatbots. Two products are currently in active development:

- **ZARX Framework** — A from-scratch sparse adaptive LLM architecture. HASS attention blocks, disk-sharded Mixture-of-Experts, Latent Chain-of-Thought. 277M total parameters, 26M active per token, 90% inference sparsity. The research project that founded FRAZIYM.
- **AXONIX-ZERO** — A fully autonomous AI coding agent that runs entirely on your local machine. 8+ LLM backends, 20+ agent tools, autonomous loop engine (Plan → Execute → Verify → Replan), and a real-time web dashboard. Standalone `.exe` for Windows. Zero cloud. Zero data leaving your device.

### The Team
- **Akik Faraji** — Founder & CTO. 19 years old. Self-taught. Built both ZARX and AXONIX-ZERO alone on a laptop CPU.
- **Sakibul Hassan** — Director & CEO. Leads strategy, operations, and business development.
- **Yasir Arafat** — Co-founder & CCO. Leads brand, design, and creative direction.

---

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Home — full overview, live terminals, product teasers, team section, fundraiser CTA |
| `product.html` | AXONIX-ZERO deep dive — architecture layers, all backends, tool layer, web dashboard |
| `zarx.html` | ZARX Framework — HASS architecture, sparse routing, L-CoT, variant table, verification output |
| `projects.html` | Full project portfolio — active, roadmap, and future products |
| `team.html` | Team overview — leadership cards, future hires, join section |
| `founder.html` | Akik Faraji profile — full story, why he built ZARX, timeline |
| `sakibul.html` | Sakibul Hassan profile — CEO role, responsibilities, vision |
| `yasir.html` | Yasir Arafat profile — CCO role, creative direction, philosophy |
| `about.html` | Company story, mission, principles |
| `stage.html` | Transparent company stage — what's done, in progress, and next |
| `pricing.html` | Pricing tiers for AXONIX-ZERO |
| `contact.html` | Contact + demo request form |
| `fundraiser.html` | Community fundraiser for ZARX GPU training — $8K goal, full transparency |

---

## Tech stack

- **Pure HTML/CSS/JS** — no React, no Vue, no build step
- **Fonts** — Outfit, JetBrains Mono, Playfair Display (Google Fonts)
- **Animations** — CSS keyframes + vanilla JS canvas particles, ambient orbs, live terminal typewriter engine, glitch effects, 3D card tilt
- **Terminal engine** — custom JS that parses `.t-line` markup and re-animates it as a live typewriter with boot sequence, typos, backspace, blinking cursor, and CRT scanline overlay
- **No external JS libraries** — everything is written from scratch in `script.js`

---

## Running locally

No build step needed. Just open any `.html` file directly in a browser, or serve with any static file server:

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

Then visit `http://localhost:8080`.

---

## Status

| System | Status |
|--------|--------|
| AXONIX-ZERO | Beta · ~90% complete · Active debugging |
| ZARX Architecture | Done · Verified · Awaiting GPU training |
| ZARX Training | Blocked on GPU · Community fundraiser active |
| Website | Live · v3.0.0 |

---

## Links

- **Fundraiser** → [fundraiser.html](./fundraiser.html) — Help fund the ZARX GPU training run
- **AXONIX GitHub** → [github.com/Akik-Forazi/AXONIX](https://github.com/Akik-Forazi/AXONIX)
- **Contact** → akikfaraji@gmail.com

---

*© 2026 FRAZIYM TECH & AI · Akik Faraji · Dhaka, Bangladesh*
