# Operating Guide — CouponOps & LLM Agents

Go-forward operational guide for **this project and any LLM agent working in it**. Adapted from the Alexecutive Career Ops / Content & Partner Operations operating guide (the persistent-knowledge pattern, memory-system lessons, and shared engineering conventions). Read it before acting. `CLAUDE.md` wins on specifics; this guide governs everything it doesn't say.

---

## 1. How to work (agent behavior)

- **Act decisively; don't stall.** When you have enough to proceed, proceed. State your assumption and move.
- **Plan big, verify at the end.** Sketch the steps, execute, then *verify against reality* — open the page at `localhost:4747`, hit the API with curl, count the deals — before declaring done.
- **Report faithfully.** If a refresh call fails, say so with the error. State "done and verified" only when it is.
- **Autonomous execution is expected** on routine work. Confirm only for irreversible or outward-facing actions (deletes, publishing, anything leaving the machine).
- **Delegate breadth.** Reading across many files? Fan out subagents; keep conclusions, not file dumps.

## 2. Knowledge is a durable artifact

- **Capture as you go.** Non-obvious learnings — a chain's coupon-policy quirk, a provider API oddity, a data-shape requirement — go in `CLAUDE.md` (Known Gotchas / QA Fix Log) *now*, dated.
- **Worth capturing:** decisions (why), preferences (how the user wants it), failures (what broke), insights (non-obvious), procedures (recipes).
- **Retrieve before you answer.** Search `CLAUDE.md`/`MEMORY.md`/docs first; don't re-derive. "Not documented yet" + a note to capture it is a correct answer.
- **Date and cite claims.** Deal mechanics and provider APIs drift; an undated figure is a landmine.
- **Never silently overwrite a durable fact.** New info contradicting an established decision → surface the conflict for a human call.

## 3. Engineering conventions

### Deliverable shape
- **Local-first web app** — Express + static `public/`, no bundler, no framework, no CDN. ES modules only.
- **Generator, not hand-edits.** `data/deals.json` comes from `scripts/build-data.js`. Change the script, re-run, never patch the artifact.
- **Token-driven CSS.** Every value resolves to a `:root` variable; light/dark via `[data-theme]` + `localStorage`; `color-scheme` set so native controls match.
- **Idempotent builds.** `npm run build-data` overwrites cleanly every run.

### Data
- **Deal schema is canonical** — defined once in `dealRefresh.js` (`DEAL_SCHEMA`) and honored by seed and AI paths alike. Don't fork the shape.
- **Market scoping via `CHAIN_MARKETS`** — a chain appears only in metros where it operates. Never scope a regional chain to `"all"`.
- **AI output is untrusted input.** Parse defensively (`parseJson`), normalize every field, escape at render.

### Security & credentials (non-negotiable)
- **Never hardcode a secret** into any tracked file, log, or doc. Keys live only in `data/config.json` (gitignored), are masked on read, and mask-values are filtered on write.
- Describe credential handling abstractly in docs — never reproduce values.
- Model output/logs must be scrubbed of keys before persistence.

## 4. Definition of done

- [ ] Change made in the **source** (script/tokens/services), not a generated artifact.
- [ ] Build re-run where relevant; output **verified in the browser or via curl**.
- [ ] No secrets introduced; credential handling stayed abstract.
- [ ] Non-obvious learnings **captured** in `CLAUDE.md`, dated.
- [ ] Docs (`README`/`SETUP`/Setup Guide) updated if structure or workflow changed.

---

*Why this exists:* an agent that rebuilds context from scratch every session wastes the user's time and repeats old mistakes. Captured, cited, focused knowledge makes each session compound on the last.
