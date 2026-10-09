# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Working assumption, pending confirmation: Spanish-speaking engineers and technical peers looking for practical depth in software systems, infrastructure, security, and operations.
- Secondary audience: technical leaders and recruiters evaluating the author's experience and judgment.

## Product Purpose

A personal site for publishing technical articles, presenting selected projects, and making the author's experience and engineering judgment legible. Success means a reader can quickly understand the author's areas of practice, inspect real work, and find useful technical writing.

## Positioning

An engineer's first-person account of building and operating software systems across application code, infrastructure, security, and reliability, grounded in the author's projects and explicit trade-offs rather than broad marketing claims.

## Operating Context

- Visitors arrive to read advanced articles, inspect project work, understand the author's background, or make professional contact.
- The site currently uses a Next.js static export with a Go API for content and administration.
- The site has Spanish-language content today. Future language coverage is undecided.
- The `7.gestion_de_conocimiento` Obsidian project and its Drive source are outside the current product scope.

## Capabilities and Constraints

- Public routes include home, about, portfolio, blog, and developer tools.
- Articles and portfolio entries are managed through the backend and admin interface; article detail pages are generated at build time.
- The frontend uses Next.js Pages Router, React, TypeScript, and Tailwind CSS.
- The public custom domain currently displays a hosting 404; the Firebase project URL has served an older published build.
- Do not imply that a project is deployed, production-ready, customer-used, or measured unless the repository or user confirms it.

## Brand Commitments

- The author describes himself as an experienced engineer working across software, infrastructure, technology, and systems.
- The voice and presentation should be discreet, direct, and grounded. Avoid hype, noise, inflated claims, and sales-heavy language.
- Technical writing should be advanced where the topic warrants it, especially in infrastructure and information security.

## Evidence on Hand

- Source repositories in the workspace document work in platform engineering, Kubernetes, observability, resilience, infrastructure as code, security tooling, backend services, and frontend development.
- The current site includes a blog CMS, portfolio entries, skills, and developer tools.
- No verified testimonials, customer list, quantified impact statements, or external awards were found in the inspected project material.

## Product Principles

- Show working artifacts and decisions before making claims about expertise.
- Explain trade-offs and operational consequences, not only tools and implementation steps.
- Make technical depth easy to find without turning the site into a dense résumé.
- Keep the author's voice modest and precise.

## Accessibility & Inclusion

- Preserve keyboard access, visible focus, responsive layouts, and reduced-motion support across the public site.

## Open Decisions

- Confirm whether the primary audience is technical peers, hiring decision-makers, or both.
- Confirm whether Spanish remains the primary language and whether the site should become fully bilingual.
- Confirm whether reading, project exploration, or professional contact is the primary visitor action.
