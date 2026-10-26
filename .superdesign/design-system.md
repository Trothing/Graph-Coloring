# Design System — "Graph Coloring / Riso Lab"

## Product context
Interactive workbench for building graphs and comparing three graph-coloring algorithms (Greedy, Backtracking+MRV, Backtracking+Degree). One screen: a big interactive SVG canvas where the graph lives, controls to build/run, and live results (chromatic number χ, time, comparisons, colour distribution, log). Audience: students/teachers. All UI copy is ENGLISH.

## Visual direction: "Riso lab notebook"
A warm, printed-paper look instead of the generic dark-navy dashboard. The canvas is a sheet of graph paper; vertices are flat, riso-print pigment discs; UI is ink-black outlines and hard offset shadows. Confident, a little playful, still precise and readable.

## Colour
- Paper (canvas bg): #F3EEE3; paper-2 (panels): #FBF8F1; paper-3 (wells): #E9E2D3
- Ink (text/lines): #16141A; ink-2: #55505C; ink-3: #8D8795
- Grid lines on canvas: rgba(22,20,26,0.07), major every 5th line rgba(22,20,26,0.12)
- Accent (primary action): Riso Blue #2F3BFF with ink text outline; accent-soft #DDE0FF
- Status: success #0E8F5A, error #E5354B, warn #D98A00
- Vertex pigments (flat, 12 high-contrast riso inks, repeat via modulo): #2F3BFF blue, #FF5A36 vermilion, #FFC21A yellow, #00A86B green, #FF6FB5 pink, #7A3CFF violet, #00B8D9 aqua, #FF8A1F orange, #8BC34A lime, #C2185B magenta, #3D5A80 slate-blue, #A0522D sienna. Vertex = solid pigment fill, 2px ink outline, ink (or white on dark pigments) number.
- Uncoloured vertex: paper fill, 2px ink outline.
- Conflict edge: error red, 3px, dashed pulse.
- Edges: ink at 55% opacity, 1.75px.

## Typography
- Display / numbers: "Bricolage Grotesque" (700/800) for the title and the big χ figure.
- UI text: "Inter Tight" (400/500/600), 13–14px base, fluid via clamp().
- Mono (log, labels, counters): "JetBrains Mono" 400/500, uppercase 10–11px labels with 0.08em tracking.
- Big result figure: clamp(56px, 7vw, 120px), weight 800, tight tracking.

## Shape & depth
- Radius: 10px panels, 8px buttons, 999px pills. 
- Borders: 2px solid ink on panels/buttons. 
- Shadow: hard offset "print" shadow 4px 4px 0 ink (2px 2px on small controls); pressed state translates 2px and drops shadow. No blur shadows, no gradients.

## Layout (fully adaptive: small laptops 1280px → 4K monitors)
- The graph canvas fills the ENTIRE viewport behind everything (edge to edge, height 100dvh). It is never a fixed pixel size; the SVG measures itself and random graphs are generated in the real canvas bounds.
- Left floating **tool dock** (vertical pill): Vertex / Edge / Move tools as icon+label buttons, plus Undo-style Clear. Collapses to icons only under 1100px height-or-width constraints.
- Top-left: wordmark "Graph Coloring" + live counters (V / E) as pills.
- Right floating **instrument panel** (width clamp(300px, 24vw, 440px)): algorithm segmented tabs (Greedy / MRV / Degree) with one-line description, big Run button, Validate, secondary actions; below it results card (huge χ, time, comparisons, colour legend chips with counts); then random-graph controls (sliders) and JSON import/export in a collapsible "Tools" section.
- Bottom: slim log ticker strip (collapsible, shows last 3 lines, expands to a drawer), width clamp so it never overlaps the panels.
- Everything uses clamp()/vw/vh/container queries so spacing, font-size and panel widths scale smoothly; on ≥2000px wide screens the root font-size grows up to ~18px. No horizontal scrolling at any width ≥ 1024px.

## Motion
- 150ms ease-out for hover/press; vertices pop in with a small scale overshoot; chromatic number counts up; running state shows a stripe-animated progress bar on the Run button; conflict edges pulse.

## Components
- Button primary: Riso Blue fill, ink 2px border, white text, hard shadow. Secondary: paper-2 fill. Ghost: transparent, dashed ink border.
- Segmented control: ink border, active segment filled ink with paper text.
- Sliders: thick 6px ink track, round paper thumb with ink border.
- Legend chip: pigment dot + "Colour N" + count in mono.
- Log entry: mono, icon glyph (› ✓ ✕ !) coloured by type, timestamp muted.

## Copy (English)
Title "Graph Coloring". Tools: Vertex, Edge, Move. Algorithms: Greedy ("Fast"), Backtracking MRV ("Heuristic 1"), Backtracking Degree ("Heuristic 2"). Actions: Run algorithm, Validate coloring, Clear graph, Generate, Import, Export, Export + colors. Labels: Vertices, Edges, Density, Chromatic number (χ), Time (ms), Comparisons, Log, Clear. Hints: "Click to add a vertex", "Pick a source vertex" / "Pick a target vertex", "Drag to move · double-click to delete". Empty states: "Run an algorithm to see results", "Nothing here yet…".
