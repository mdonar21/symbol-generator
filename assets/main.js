import { symbolMap } from "./symbols.js";

// === Element References ===
const els = {
  shape: document.getElementById("shape"),
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

// === Populate Symbol Dropdown ===
function populateDropdown() {
  els.shape.innerHTML = "";
  for (const [sidc, name] of Object.entries(symbolMap)) {
    const option = document.createElement("option");
    option.textContent = name;
    option.value = sidc;
    els.shape.appendChild(option);
  }
  if (els.shape.options.length > 0) els.shape.value = Object.keys(symbolMap)[0];
}

// === Update Symbol Preview ===
function updateSymbol() {
  const sidc = els.shape.value;
  const opts = {
    size: 130,
    monoColor: els.color.value,
    direction: parseFloat(els.direction.value) || 0,
    svg: true,
    uniqueDesignation: els.hideText.checked ? "" : els.label.value,
    quantity: els.hideText.checked ? "" : els.quantity.value,
    higherFormation: els.hideText.checked ? "" : els.higherFormation.value,
    reinforcedReduced: els.reinforcedReduced.value,
    echelon: els.echelon.value,
    mobility: els.mobility.value,
    headquartersElement: els.hq.value === "A" ? "A" : "",
    infoFields: !els.hideText.checked
  };

  try {
    const symbol = new ms.Symbol(sidc, opts);
    els.preview.innerHTML = "";
    els.preview.appendChild(symbol.asDOM());
  } catch (e) {
    els.preview.innerHTML = `⚠️ Invalid symbol: ${e.message}`;
  }
}

// === Save as SVG ===
function saveAsSVG() {
  const svg = els.preview.querySelector("svg");
  if (!svg) return alert("⚠️ No symbol to save!");
  const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  const name = els.shape.options[els.shape.selectedIndex].textContent.replace(/ /g, "_") || "milsymbol";
  link.download = `${name}.svg`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// === Reset Symbol Settings ===
function resetSymbol() {
  if (!confirm("Reset all symbol settings?")) return;
  els.shape.selectedIndex = 0;
  els.affiliation.value = "F";
  els.color.value = "#00aaff";
  els.label.value = "";
  els.quantity.value = "";
  els.higherFormation.value = "";
  els.status.value = "P";
  els.echelon.value = "";
  els.mobility.value = "";
  els.hq.value = "";
  els.reinforcedReduced.value = "";
  els.direction.value = "45";
  els.hideText.checked = false;
  updateSymbol();
}

// === Event Listeners ===
Object.values(els).forEach(el => {
  if (el && el.tagName) el.addEventListener("input", updateSymbol);
});
els.saveSvg.addEventListener("click", saveAsSVG);
els.reset.addEventListener("click", resetSymbol);

// === Initialize ===
populateDropdown();
updateSymbol();
