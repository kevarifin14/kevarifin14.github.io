# Data/WebGL Production Pattern

Use this when the sim is a map, atlas, real dataset explorer, large generated HTML artifact, or WebGL scene with layers and camera controls.

## Fog City Atlas Lessons

Local reference repo:
- Source: `/tmp/fog-city-atlas`
- Public artifact: `/tmp/fog-city-atlas-site`
- Key files: `template.html`, `build.js`, `build-atlas.js`, `coastside/build-coastside.js`, `sf.html`

What worked:
- One shared engine (`template.html`) serves several regions by injecting `META` and compressed data.
- Data is fetched and built ahead of time; the runtime HTML has no network dependency.
- Public facts and fictions are separated. Real layers cite public datasets; procedural lit windows and schedule-simulated vehicles are called out.
- Layers are toggles, not separate pages: streets, buildings, transit, bike lanes, fog, labels, tints, sea level, time of day.
- Navigation feels like a map app: grab-to-pan, cursor-anchored zoom, right-drag/shift-drag orbit, double-click zoom, reset heading.
- Debug hooks such as `window.__sf` let verification scripts set time, camera, fog, and speed.
- Screenshot harnesses verify canonical views instead of relying on memory.

## Build Pipeline Shape

For data-heavy sims, use:

```text
raw data -> fetch script -> clean/project/aggregate -> quantize -> compress -> inject into template -> generated html
```

Rules:
- Keep fetch scripts idempotent and documented.
- Keep raw data out of git if it is huge or licensed awkwardly.
- Commit generated HTML when it is the deployable product.
- If a binary format changes, update every build script and every decoder together.
- If using public data, record source URLs, dataset IDs, refresh dates, and known missingness.

## Runtime Architecture

Separate:
- `META`: names, bounds, source labels, layer config, legends, UI text.
- `DATA`: compressed geometry, timeseries, grids, or records.
- `decode`: pure data loading and typed-array construction.
- `model`: camera, time, selected layer, hover target, simulation parameters.
- `render`: WebGL/canvas/SVG draw passes.
- `interaction`: pointer, wheel, keyboard, UI controls.
- `debug`: `window.__sim` hooks for tests.

## Interaction Standard

- Pan should keep the world point under the cursor stable.
- Zoom should anchor at the cursor, not the center of the screen.
- 3D/orbit views need a home/reset control.
- Layer toggles should update immediately.
- Hover should identify the thing under the pointer without requiring a click.
- Time controls should include pause, speed, scrubber, and a readable clock.
- Long loads need progress and visible stages.

## Verification Hooks

Expose only what tests need:

```js
window.__sim = {
  state,
  cam,
  setTime(minutes) { state.time = minutes; },
  setLayer(id, enabled) { document.getElementById(id).checked = enabled; },
  setPreset(name) { applyPreset(name); }
};
```

Then write a harness that:
- opens the generated HTML through a local server or `file://` if supported,
- waits for the load overlay to disappear,
- captures at least one wide and one close screenshot,
- toggles a layer,
- moves time or a main parameter,
- asserts no console errors.

## When Not To Use This Pattern

- A simple pedagogical model with one canvas and three sliders.
- A concept where the dataset distracts from the relationship being taught.
- A sim that can be clearer as SVG or Canvas without a build step.
