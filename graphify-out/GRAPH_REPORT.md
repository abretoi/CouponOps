# Graph Report - /Users/abretoi/Desktop/CouponOps  (2026-07-20)

## Corpus Check
- 30 files · ~62,603 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 257 nodes · 353 edges · 16 communities (13 shown, 3 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.83)
- Token cost: 73,105 input · 6,800 output

## Community Hubs (Navigation)
- Architecture Decisions & Registries
- Express Server & API Routes
- Blue Design Token System
- Frontend Router & API Client
- Seed Data Generator
- Setup & Operations Runbook
- Package Manifest & Scripts
- Link Health Auditor
- Deal Card Anatomy
- AI Provider & Key Handling
- Filter Drill-Down UI
- Motion & Feedback
- Product Definition
- Coupon Access Surface
- Card Legibility Rules
- Install Script

## God Nodes (most connected - your core abstractions)
1. `esc()` - 12 edges
2. `Blue-Family Ramp (5 hues)` - 11 edges
3. `callModel()` - 8 edges
4. `readJson()` - 8 edges
5. `dealCard()` - 7 edges
6. `refreshMarket()` - 7 edges
7. `Deal Card` - 7 edges
8. `toast()` - 6 edges
9. `getMarkets()` - 6 edges
10. `getDeals()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `In-Browser Contrast Measurement Trap` --semantically_similar_to--> `Bot Walls Never Return 404`  [INFERRED] [semantically similar]
  MEMORY.md → CLAUDE.md
- `User Primary Markets (Austin and Raleigh-Durham)` --conceptually_related_to--> `abretoi Apple-Style Dashboard Design System`  [AMBIGUOUS]
  MEMORY.md → CLAUDE.md
- `Refresh Trusts But Verifies` --rationale_for--> `Per-Market Refresh Flow`  [EXTRACTED]
  MEMORY.md → CLAUDE.md
- `Seed Snapshot Data Freshness` --rationale_for--> `Per-Market Refresh Flow`  [EXTRACTED]
  MEMORY.md → CLAUDE.md
- `Supported AI Provider Roster` --references--> `Provider-Agnostic AI Adapter (aiAdapter.js)`  [EXTRACTED]
  README.md → CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Outbound URL Single-Source-of-Truth Pipeline** — claude_link_registry, claude_build_data_script, claude_check_links_script, claude_deal_card, claude_bot_wall_404_rule [EXTRACTED 1.00]
- **AI Refresh Trust Boundary** — claude_ai_adapter, claude_parse_json, claude_deal_refresh, claude_step_html_xss_hardening, claude_untrusted_ai_output, claude_per_market_refresh [EXTRACTED 1.00]
- **Blue Palette Enforcement Chain** — claude_blue_family_palette, claude_token_driven_css, claude_badge_tier_ramp, claude_contrast_ink_tokens, claude_build_data_script [INFERRED 0.85]
- **First-Run Setup Flow** — setup_node_requirement, setup_setup_script, setup_npm_start, docs_setup_guide_install [EXTRACTED 1.00]
- **In-Market Drill-Down Filters** — docs_setup_guide_market_pills, docs_setup_guide_category_chips, docs_setup_guide_store_chips [EXTRACTED 1.00]
- **Blue Ramp Token System** — public_index_turquoise, public_index_sky, public_index_ocean, public_index_blue, public_index_navy, public_index_fill_ink_split [EXTRACTED 1.00]
- **Coupon Access Surface On Card** — public_index_link_row, public_index_coupon_box, public_index_stack_tag_link, public_index_deal_link [EXTRACTED 1.00]
- **Filter Stack UI** — public_index_market_bar, public_index_store_bar, public_index_search_input, public_index_filter_label [EXTRACTED 1.00]

## Communities (16 total, 3 thin omitted)

### Community 0 - "Architecture Decisions & Registries"
Cohesion: 0.06
Nodes (44): Provider-Agnostic AI Adapter (aiAdapter.js), /api/deals Payload Contract (week/markets/sbg/badgeStyle), abretoi Apple-Style Dashboard Design System, BADGE_TIER and PILLAR_BY_BADGE Ramp Derivation, Blue-Family Palette (Five-Hue Hard Constraint), Bot Walls Never Return 404, scripts/build-data.js Seed Generator, CHAIN_MARKETS Regional Chain Scoping (+36 more)

### Community 1 - "Express Server & API Routes"
Cohesion: 0.13
Nodes (27): app, __dirname, router, router, router, activeSettings(), callModel(), CONFIG_PATH (+19 more)

### Community 2 - "Blue Design Token System"
Cohesion: 0.07
Nodes (32): Ask AI Bar, Blue Stop (loyalty-program tier), Blue-Family Ramp (5 hues), Conic-Gradient Brand Mark, Sticky Controls Bar, Eyebrow Chip With Pulsing Dot, Fill vs Ink Token Split, Filter Row Label (+24 more)

### Community 3 - "Frontend Router & API Client"
Cohesion: 0.15
Nodes (24): api, esc(), content, loadData(), navigate(), revealAll(), state, TITLES (+16 more)

### Community 4 - "Seed Data Generator"
Cohesion: 0.07
Nodes (25): ALL_IDS, BADGE_TIER, badgeStyle, BLUE, cats, CHAIN_MARKETS, core, DATA (+17 more)

### Community 5 - "Setup & Operations Runbook"
Cohesion: 0.09
Nodes (22): Ask AI (deal-grounded), Fixing A Broken Store Link, Projections Must Be Verified In Store, One-Time Installation, Refresh Week Flow, Revert To Seed Data, Where The Deals Come From, Starting and Stopping (+14 more)

### Community 6 - "Package Manifest & Scripts"
Cohesion: 0.13
Nodes (14): dependencies, express, description, engines, node, main, name, scripts (+6 more)

### Community 7 - "Link Health Auditor"
Cohesion: 0.17
Nodes (11): bad, DATA, __dirname, good, isWalled(), links, list, results (+3 more)

### Community 8 - "Deal Card Anatomy"
Cohesion: 0.24
Nodes (11): Deal Badge, Coupon Checklist Box, Deal Card, Deal Link Button, Card Link Row, Opaque Pill Surfaces, Pillar Tint (hairline + halo), 8pt Spacing Scale (+3 more)

### Community 9 - "AI Provider & Key Handling"
Cohesion: 0.29
Nodes (7): API Key Safety, AI Engine Configuration, Free Provider Routes (Groq, Gemini, Ollama), Free-Text Model Field, Claude Pro Is Not API Access, Provider / Key Source Table, Test Connection Check

### Community 10 - "Filter Drill-Down UI"
Cohesion: 0.50
Nodes (4): Category Chips, Market Pills, Left Sidebar Navigation, Store Chips (in-market drill-down)

### Community 11 - "Motion & Feedback"
Cohesion: 0.50
Nodes (4): prefers-reduced-motion Handling, Reveal-On-Scroll, Apple Spring Easing, Toast Notification

### Community 12 - "Product Definition"
Cohesion: 0.67
Nodes (3): Runs Entirely Locally, Stackable Deal (layered coupons), What CouponOps Is

## Ambiguous Edges - Review These
- `abretoi Apple-Style Dashboard Design System` → `User Primary Markets (Austin and Raleigh-Durham)`  [AMBIGUOUS]
  MEMORY.md · relation: conceptually_related_to

## Knowledge Gaps
- **88 isolated node(s):** `name`, `version`, `description`, `type`, `main` (+83 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `abretoi Apple-Style Dashboard Design System` and `User Primary Markets (Austin and Raleigh-Durham)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Blue-Family Ramp (5 hues)` connect `Blue Design Token System` to `Deal Card Anatomy`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _104 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Architecture Decisions & Registries` be split into smaller, more focused modules?**
  _Cohesion score 0.0613107822410148 - nodes in this community are weakly interconnected._
- **Should `Express Server & API Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.12773109243697478 - nodes in this community are weakly interconnected._
- **Should `Blue Design Token System` be split into smaller, more focused modules?**
  _Cohesion score 0.07258064516129033 - nodes in this community are weakly interconnected._
- **Should `Seed Data Generator` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._