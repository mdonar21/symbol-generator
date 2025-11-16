import { symbolMap } from "./symbols.js";


// ============================================================
// assets/main.js
//
// Purpose: Small UI glue code for choosing and rendering a
// military symbol (SIDC). It maps HTML controls to SIDC
// character positions, configures the renderer, and shows an
// SVG preview that can be downloaded.
//
// Contract (short):
// - Inputs: values from the page controls (dropdowns, text inputs,
//   checkboxes) referenced in `els` below.
// - Output: an SVG node appended to `els.preview` (or an error
//   message shown there if rendering fails).
// - Errors: invalid SIDC or renderer failures are shown to the user
//   rather than throwing uncaught exceptions.
//
// Quick SIDC notes for newcomers:
// - A SIDC is treated here as a fixed-length string of characters.
// - We edit specific zero-based character positions to reflect
//   user choices (e.g., affiliation at index 1, status at index 3).
// ============================================================

// === Element References ===
// Collect DOM references once so the rest of the code can use
// short names (els.*) rather than repeatedly calling
// document.getElementById.
const els = {
  shape: document.getElementById("shape"), // main SIDC dropdown
  shapeSearch: document.getElementById("shapeSearch"), // text filter for dropdown
  affiliation: document.getElementById("affiliation"), // alters SIDC index 1
  color: document.getElementById("color"), // visual color override
  label: document.getElementById("label"), // unique designation text
  quantity: document.getElementById("quantity"), // quantity text field
  higherFormation: document.getElementById("higherFormation"), // higher formation text
  status: document.getElementById("status"), // alters SIDC index 3
  echelon: document.getElementById("echelon"), // alters SIDC index 10
  mobility: document.getElementById("mobility"), // alters SIDC index 11
  hq: document.getElementById("hq"), // optional HQ/staff modifier
  reinforcedReduced: document.getElementById("reinforcedReduced"), // optional modifier
  direction: document.getElementById("direction"), // rotation in degrees
  hideText: document.getElementById("hideText"), // when checked, hides text fields
  preview: document.getElementById("symbolPreview"), // where SVG is placed
  saveSvg: document.getElementById("saveSvg"), // download button
  reset: document.getElementById("resetSymbol") // reset to defaults
};

// === Populate symbol dropdown with optional search filter ===
// Fill the `shape` dropdown using `symbolMap` (SIDC -> friendly name).
// If a `filter` is provided, only symbols whose friendly name
// contains the filter text (case-insensitive) are included.
function populateDropdown(filter = "") {
  const current = els.shape.value; // try to preserve selection
  els.shape.innerHTML = ""; // clear existing options

  for (const [sidc, name] of Object.entries(symbolMap)) {
    if (filter && !name.toLowerCase().includes(filter.toLowerCase())) continue;
    const option = document.createElement("option");
    option.value = sidc;
    option.textContent = name;
    els.shape.appendChild(option);
  }

  // Keep the previously selected SIDC selected if it's still present.
  if ([...els.shape.options].some(opt => opt.value === current)) {
    els.shape.value = current;
  } else if (els.shape.options.length) {
    // Otherwise select the first option so there's a valid SIDC.
    els.shape.selectedIndex = 0;
  }
}

// === Update symbol preview ===
// Read the current UI controls, encode the SIDC string accordingly,
// and ask the ms.Symbol renderer to create an SVG which we place in
// the preview area. Errors are caught and shown to the user.
function updateSymbol() {
  let sidc = els.shape.value;
  if (!sidc) return; // nothing selected yet

  // Work with the SIDC as an array of characters so we can replace
  // individual positions easily.
  const chars = sidc.split("");

  // The following indexes correspond to standard SIDC fields.
  // We only overwrite them if the UI control provides a value;
  // otherwise we keep the original character (or use a '-' where
  // the renderer expects an explicit blank).
  chars[1]  = els.affiliation.value || chars[1];   // Affiliation (index 1)
  chars[3]  = els.status.value || chars[3];       // Status (index 3)
  chars[10] = els.echelon.value || "-";          // Echelon (index 10)
  chars[11] = els.mobility.value || "-";         // Mobility (index 11)

  // Reconstruct the SIDC string after modifications.
  sidc = chars.join("");

  try {
    // Create the symbol renderer object. The options below are
    // pulled directly from the UI controls.
    const symbol = new ms.Symbol(sidc, {
      size: 130,
      monoColor: els.color.value,
      direction: parseFloat(els.direction.value) || 0,
      svg: true,
      uniqueDesignation: els.hideText.checked ? "" : els.label.value,
      quantity: els.hideText.checked ? "" : els.quantity.value,
      higherFormation: els.hideText.checked ? "" : els.higherFormation.value,
      // If hideText is checked we don't render the info fields.
      infoFields: !els.hideText.checked,
      // Optional modifiers; pass `undefined` if not set so the
      // renderer uses its defaults.
      headquartersElement: els.hq.value || undefined,
      reinforcedReduced: els.reinforcedReduced.value || undefined
    });

    // Put the resulting SVG into the preview element.
    els.preview.innerHTML = "";
    els.preview.appendChild(symbol.asDOM());
  } catch (e) {
    // Rendering failed (bad SIDC/options). Show a friendly message.
    els.preview.innerHTML = `⚠️ Invalid symbol: ${e.message}`;
  }
}


// === Event Listeners ===

// Typing into the search box filters the dropdown but does not
// immediately update the preview (so typing won't cause flicker).
els.shapeSearch.addEventListener("input", () => {
  populateDropdown(els.shapeSearch.value);
});

// When the user picks a shape, refresh the preview.
els.shape.addEventListener("change", updateSymbol);

// Controls that should trigger an immediate preview update.
[ 
  els.affiliation,
  els.status,
  els.echelon,
  els.mobility,
  els.hq,
  els.reinforcedReduced,
  els.color,
  els.label,
  els.quantity,
  els.higherFormation,
  els.direction,
  els.hideText
].forEach(el => el.addEventListener("input", updateSymbol));

// Save the currently-rendered SVG to a downloadable file.
els.saveSvg.addEventListener("click", () => {
  const svg = els.preview.querySelector("svg");
  if (!svg) return alert("⚠️ No symbol to save!");
  const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${els.shape.options[els.shape.selectedIndex].textContent.replace(/ /g, "_")}.svg`;
  link.click();
  URL.revokeObjectURL(link.href);
});

// Reset UI controls back to sensible defaults and refresh the UI.
els.reset.addEventListener("click", () => {
  if (!confirm("Reset all symbol settings?")) return;

  els.shapeSearch.value = "";
  els.shape.selectedIndex = 0;
  els.affiliation.value = "F";
  els.status.value = "P";
  els.echelon.value = "";
  els.mobility.value = "";
  els.hq.value = "";
  els.reinforcedReduced.value = "";
  els.color.value = "#00aaff";
  els.label.value = "";
  els.quantity.value = "";
  els.higherFormation.value = "";
  els.direction.value = "45";
  els.hideText.checked = false;

  populateDropdown();
  updateSymbol();
});

// === Initialize ===
populateDropdown();
updateSymbol();
