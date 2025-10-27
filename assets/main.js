import { symbolMap } from "./symbols.js";

// === Element References ===
const els = {
  shape: document.getElementById("shape"),
  shapeSearch: document.getElementById("shapeSearch"),
  affiliation: document.getElementById("affiliation"),
  color: document.getElementById("color"),
  label: document.getElementById("label"),
  quantity: document.getElementById("quantity"),
  higherFormation: document.getElementById("higherFormation"),
  status: document.getElementById("status"),
  echelon: document.getElementById("echelon"),
  mobility: document.getElementById("mobility"),
  hq: document.getElementById("hq"),
  reinforcedReduced: document.getElementById("reinforcedReduced"),
  direction: document.getElementById("direction"),
  hideText: document.getElementById("hideText"),
  preview: document.getElementById("symbolPreview"),
  saveSvg: document.getElementById("saveSvg"),
  reset: document.getElementById("resetSymbol")
};

// === Populate symbol dropdown with optional search filter ===
function populateDropdown(filter = "") {
  const current = els.shape.value;
  els.shape.innerHTML = "";

  for (const [sidc, name] of Object.entries(symbolMap)) {
    if (filter && !name.toLowerCase().includes(filter.toLowerCase())) continue;
    const option = document.createElement("option");
    option.value = sidc;
    option.textContent = name;
    els.shape.appendChild(option);
  }

  if ([...els.shape.options].some(opt => opt.value === current)) {
    els.shape.value = current;
  } else if (els.shape.options.length) {
    els.shape.selectedIndex = 0;
  }
}

// === Update symbol preview ===
function updateSymbol() {
  let sidc = els.shape.value;
  if (!sidc) return;

  const chars = sidc.split("");

  // Encode dropdowns that modify SIDC directly
  chars[1]  = els.affiliation.value || chars[1];   // Affiliation
  chars[3]  = els.status.value || chars[3];       // Status
  chars[10] = els.echelon.value || "-";           // Echelon
  chars[11] = els.mobility.value || "-";          // Mobility

  // Join SIDC after encoding
  sidc = chars.join("");

  try {
    const symbol = new ms.Symbol(sidc, {
      size: 130,
      monoColor: els.color.value,
      direction: parseFloat(els.direction.value) || 0,
      svg: true,
      uniqueDesignation: els.hideText.checked ? "" : els.label.value,
      quantity: els.hideText.checked ? "" : els.quantity.value,
      higherFormation: els.hideText.checked ? "" : els.higherFormation.value,
      infoFields: !els.hideText.checked,
      headquartersElement: els.hq.value || undefined,       // FIXED HQ / Staff
      reinforcedReduced: els.reinforcedReduced.value || undefined  // FIXED Reinforced/Reduced
    });

    els.preview.innerHTML = "";
    els.preview.appendChild(symbol.asDOM());
  } catch (e) {
    els.preview.innerHTML = `⚠️ Invalid symbol: ${e.message}`;
  }
}


// === Event Listeners ===

// Symbol search filters the dropdown without updating the symbol
els.shapeSearch.addEventListener("input", () => {
  populateDropdown(els.shapeSearch.value);
});

// Symbol dropdown change updates the symbol
els.shape.addEventListener("change", updateSymbol);

// Other controls update symbol in real time
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

// Save SVG
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

// Reset all controls
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
