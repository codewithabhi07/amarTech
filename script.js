/**
 * शोक संदेश पत्रिका संपादक (Shok Sandesh Card Generator) - JavaScript Logic
 */

// Initial Sample Data (matching reference cards)
const defaultData = {
  bannerTitle: "शोक संदेश",
  dateTop: "दि. ०२/०९/२०२६",
  villageTop: "लासुर",
  omShanti: "ओम: शांती शांती..",
  shrirara: "श्री.रा. रा. ________________________ यांना",
  senderLine: "श्री.वासुदेव नारायण माळी व भगवान नारायण माळी यांच्या कडून कळविण्यास अत्यंत दुःख होते की, यांचे वडील नामे:",
  deceasedName: "कै.नारायण उखा माळी .",
  deceasedResidence: "रा. लासुर यांचे",
  deathDate: "दि.०२/०९/२०२६",
  deathDay: "बुधवार",
  deathTime: "सायंकाळी ६ : ३० वाजता",
  deceasedAge: "वयाच्या ८६ व्या वर्षी",
  dashkriyaInfo: "दि. ११/०९/२०२६ वार शुक्रवार रोजी",
  uttarkaryaInfo: "दि. १२/०९/२०२६ वार शनिवार रोजी सकाळी ११ वाजता",
  ritualsPlace: "माळी समाज मंगल कार्यालय येथे करण्याचे योजिले आहे.",
  venueVillage: "लासुर",
  venueTaluka: "तालुका चोपडा",
  venueDistrict: "जिल्हा जळगाव",
  shokakulTitle: "शोकाकुल",
  shokakulList: [
    "श्री. वासुदेव नारायण माळी",
    "श्री. योगराज गंगाराम माळी",
    "श्री. भगवान नारायण माळी",
    "श्री. प्रविण प्रकाश माळी",
    "श्री. भास्करराव मयाराम माळी"
  ],
  familyFooter: "समस्त पवार परिवार लासुर"
};

let currentScale = 1;
let currentCardSize = "landscape";
let shokakulItems = [...defaultData.shokakulList];

// Photo Adjustments State
let photoScale = 100;
let photoX = 0;
let photoY = 0;
let photoRotate = 0;
let photoFilter = "none";
let frameShape = "arch";
let showGarland = true;

// Initialize on Load
document.addEventListener("DOMContentLoaded", () => {
  renderShokakulListInputs();
  updateCard();
  setupContentEditableSync();
  setupPhotoInteractiveDrag();
  applyPhotoTransform();
  toggleDiyaGlow(true);
  toggleCard3DShadow(true);
  autoScaleCard();
  window.addEventListener("resize", autoScaleCard);
});

// Render Shokakul Inputs in Editor Panel
function renderShokakulListInputs() {
  const container = document.getElementById("shokakulNamesContainer");
  if (!container) return;
  container.innerHTML = "";

  shokakulItems.forEach((name, idx) => {
    const row = document.createElement("div");
    row.className = "shokakul-item-row";
    row.innerHTML = `
      <input type="text" value="${escapeHtml(name)}" data-index="${idx}" oninput="handleShokakulItemChange(${idx}, this.value)">
      <button type="button" class="btn-remove-row" title="काढून टाका" onclick="removeShokakulField(${idx})">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    container.appendChild(row);
  });

  renderShokakulCardGrid();
}

// Add New Shokakul Item
function addShokakulField(val = "") {
  shokakulItems.push(val || "श्री. ");
  renderShokakulListInputs();
}

// Remove Shokakul Item
function removeShokakulField(idx) {
  shokakulItems.splice(idx, 1);
  renderShokakulListInputs();
}

// Handle Shokakul item input change
function handleShokakulItemChange(idx, val) {
  shokakulItems[idx] = val;
  renderShokakulCardGrid();
}

// Render the 2-column grid inside the card
function renderShokakulCardGrid() {
  const grid = document.getElementById("card_shokakul_grid");
  if (!grid) return;
  grid.innerHTML = "";

  shokakulItems.forEach((name, idx) => {
    if (!name.trim()) return;
    const entry = document.createElement("div");
    entry.className = "shokakul-entry";
    entry.contentEditable = "true";
    entry.dataset.index = idx;
    entry.innerHTML = `<span class="bullet-dot"></span> <span class="shokakul-text">${escapeHtml(name)}</span>`;
    
    // Live two-way sync from card to input
    entry.addEventListener("input", (e) => {
      const textElem = entry.querySelector(".shokakul-text");
      const text = textElem ? textElem.innerText.trim() : entry.innerText.trim();
      shokakulItems[idx] = text;
      const input = document.querySelector(`.shokakul-item-row input[data-index="${idx}"]`);
      if (input) input.value = text;
    });

    grid.appendChild(entry);
  });
}

// Update Card From Left Form Inputs
function updateCard() {
  // Header
  setText("card_banner_title", getValue("in_banner_title"));
  setText("card_date_top", getValue("in_date_top"));
  setText("card_village_top", getValue("in_village_top"));
  setText("card_om_shanti", getValue("in_om_shanti"));

  // Venue
  setText("card_venue_village", getValue("in_venue_village"));
  setText("card_venue_taluka", getValue("in_venue_taluka"));
  setText("card_venue_district", getValue("in_venue_district"));

  // Main body
  setText("card_shrirara", getValue("in_shrirara"));
  setText("card_sender_line", getValue("in_sender_line"));
  setText("card_deceased_name", getValue("in_deceased_name"));
  setText("card_deceased_residence", getValue("in_deceased_residence"));

  setText("card_death_date", getValue("in_death_date"));
  setText("card_death_day", getValue("in_death_day"));
  setText("card_death_time", getValue("in_death_time"));
  setText("card_deceased_age", getValue("in_deceased_age"));

  setText("card_dashkriya_info", getValue("in_dashkriya_info"));
  setText("card_uttarkarya_info", getValue("in_uttarkarya_info"));
  setText("card_rituals_place", getValue("in_rituals_place"));

  // Shokakul
  setText("card_shokakul_title", getValue("in_shokakul_title"));
  setText("card_family_footer", getValue("in_family_footer"));
}

// Sync edits made directly in Card Preview back to left input form
function setupContentEditableSync() {
  const syncPairs = [
    { cardId: "card_banner_title", inputId: "in_banner_title" },
    { cardId: "card_date_top", inputId: "in_date_top" },
    { cardId: "card_village_top", inputId: "in_village_top" },
    { cardId: "card_om_shanti", inputId: "in_om_shanti" },
    { cardId: "card_venue_village", inputId: "in_venue_village" },
    { cardId: "card_venue_taluka", inputId: "in_venue_taluka" },
    { cardId: "card_venue_district", inputId: "in_venue_district" },
    { cardId: "card_shrirara", inputId: "in_shrirara" },
    { cardId: "card_sender_line", inputId: "in_sender_line" },
    { cardId: "card_deceased_name", inputId: "in_deceased_name" },
    { cardId: "card_deceased_residence", inputId: "in_deceased_residence" },
    { cardId: "card_shokakul_title", inputId: "in_shokakul_title" },
    { cardId: "card_family_footer", inputId: "in_family_footer" }
  ];

  syncPairs.forEach(pair => {
    const cardEl = document.getElementById(pair.cardId);
    const inputEl = document.getElementById(pair.inputId);
    if (cardEl && inputEl) {
      cardEl.addEventListener("input", () => {
        inputEl.value = cardEl.innerText.trim();
      });
    }
  });
}

// Helper Get & Set
function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[m]);
}

// Photo Upload Handler
function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const imgEl = document.getElementById("card_photo_img");
    if (imgEl) {
      imgEl.src = e.target.result;
      resetPhotoAdjustments();
    }
  };
  reader.readAsDataURL(file);
}

// Photo Transform Engine
function applyPhotoTransform() {
  const img = document.getElementById("card_photo_img");
  if (!img) return;
  img.style.transform = `translate(${photoX}px, ${photoY}px) scale(${photoScale / 100}) rotate(${photoRotate}deg)`;
  
  // Update value displays
  const valScale = document.getElementById("val_photo_scale");
  const valX = document.getElementById("val_photo_x");
  const valY = document.getElementById("val_photo_y");
  if (valScale) valScale.innerText = photoScale + "%";
  if (valX) valX.innerText = photoX + "px";
  if (valY) valY.innerText = photoY + "px";

  // Update input sliders
  const inScale = document.getElementById("in_photo_scale");
  const inX = document.getElementById("in_photo_x");
  const inY = document.getElementById("in_photo_y");
  if (inScale && inScale.value != photoScale) inScale.value = photoScale;
  if (inX && inX.value != photoX) inX.value = photoX;
  if (inY && inY.value != photoY) inY.value = photoY;
}

function setPhotoScale(val) {
  photoScale = parseInt(val, 10);
  applyPhotoTransform();
}

function adjustPhotoZoom(delta) {
  photoScale = Math.min(Math.max(50, photoScale + delta), 250);
  applyPhotoTransform();
}

function setPhotoX(val) {
  photoX = parseInt(val, 10);
  applyPhotoTransform();
}

function setPhotoY(val) {
  photoY = parseInt(val, 10);
  applyPhotoTransform();
}

function setPhotoRotate(deg) {
  photoRotate = parseInt(deg, 10);
  applyPhotoTransform();
}

function rotatePhoto(delta) {
  photoRotate = (photoRotate + delta) % 360;
  if (photoRotate < 0) photoRotate += 360;
  applyPhotoTransform();
}

function resetPhotoAdjustments() {
  photoScale = 100;
  photoX = 0;
  photoY = 0;
  photoRotate = 0;
  applyPhotoTransform();
}

function setFrameShape(shape) {
  frameShape = shape;
  const frame = document.getElementById("card_photo_frame");
  if (!frame) return;
  frame.classList.remove("shape-arch", "shape-oval", "shape-rounded", "shape-rect");
  frame.classList.add("shape-" + shape);
}

function setPhotoFilter(filter) {
  photoFilter = filter;
  const container = document.getElementById("card_photo_container");
  if (!container) return;
  container.classList.remove("photo-filter-grayscale", "photo-filter-bright", "photo-filter-sepia");
  if (filter !== "none") {
    container.classList.add("photo-filter-" + filter);
  }
}

function toggleGarland(show) {
  showGarland = show;
  const garland = document.getElementById("card_photo_garland");
  if (garland) {
    if (show) garland.classList.remove("hidden");
    else garland.classList.add("hidden");
  }
}

// Interactive Mouse / Touch Dragging & Wheel Zoom on Photo inside frame
function setupPhotoInteractiveDrag() {
  const container = document.getElementById("card_photo_container");
  if (!container) return;

  let isDragging = false;
  let startMouseX = 0;
  let startMouseY = 0;
  let startPhotoX = 0;
  let startPhotoY = 0;

  container.addEventListener("mousedown", (e) => {
    isDragging = true;
    startMouseX = e.clientX;
    startMouseY = e.clientY;
    startPhotoX = photoX;
    startPhotoY = photoY;
    container.style.cursor = "grabbing";
    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const deltaX = (e.clientX - startMouseX) / (currentScale || 1);
    const deltaY = (e.clientY - startMouseY) / (currentScale || 1);
    photoX = Math.round(Math.min(Math.max(-150, startPhotoX + deltaX), 150));
    photoY = Math.round(Math.min(Math.max(-150, startPhotoY + deltaY), 150));
    applyPhotoTransform();
  });

  window.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      if (container) container.style.cursor = "grab";
    }
  });

  // Wheel to zoom directly over photo
  container.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 5 : -5;
    adjustPhotoZoom(delta);
  }, { passive: false });
}

// Card Size Selection
function changeCardSize(sizeKey) {
  currentCardSize = sizeKey;
  const card = document.getElementById("shokCard");
  const select = document.getElementById("selectCardSize");
  if (select && select.value !== sizeKey) select.value = sizeKey;
  if (!card) return;

  card.classList.remove("size-landscape", "size-portrait", "size-square", "size-a4");
  card.classList.add("size-" + sizeKey);

  // Recalculate zoom scale to fit the new aspect ratio
  setTimeout(autoScaleCard, 100);
}

// Theme Switcher supporting 6 Rich Themes
function setCardTheme(theme) {
  // Support legacy 'color' argument as 'royal-gold'
  if (theme === "color") theme = "royal-gold";
  currentTheme = theme;

  const card = document.getElementById("shokCard");
  if (!card) return;

  const allThemes = [
    "theme-royal-gold", "theme-color", "theme-bw",
    "theme-white-serene", "theme-saffron",
    "theme-vintage-parchment", "theme-navy-gold",
    "theme-pink-lotus", "theme-emerald-chandan",
    "theme-midnight-gold", "theme-ganga-moksha",
    "theme-terracotta-autumn", "theme-rudraksha-maroon"
  ];
  card.classList.remove(...allThemes);
  card.classList.add("theme-" + theme);

  // Sync Dropdown
  const select = document.getElementById("selectCardTheme");
  if (select && select.value !== theme) select.value = theme;

  // Sync Swatch Buttons
  document.querySelectorAll(".theme-swatch").forEach(swatch => {
    swatch.classList.remove("active");
  });
  const activeSwatch = document.getElementById("swatch_" + theme);
  if (activeSwatch) activeSwatch.classList.add("active");
}

// Border Design Switcher
function setBorderDesign(style) {
  currentBorderStyle = style;
  const card = document.getElementById("shokCard");
  if (!card) return;

  const allBorders = [
    "border-royal-filigree",
    "border-vintage-floral",
    "border-double-classic",
    "border-minimal"
  ];
  card.classList.remove(...allBorders);
  card.classList.add("border-" + style);

  // Sync header and accordion selects
  const selHeader = document.getElementById("selectBorderStyle");
  const selAccordion = document.getElementById("in_border_style");
  if (selHeader && selHeader.value !== style) selHeader.value = style;
  if (selAccordion && selAccordion.value !== style) selAccordion.value = style;
}

// Paper Texture Switcher
function setPaperTexture(texture) {
  currentTexture = texture;
  const overlay = document.getElementById("cardTextureOverlay");
  if (!overlay) return;

  overlay.classList.remove("texture-subtle", "texture-canvas", "texture-smooth");
  overlay.classList.add("texture-" + texture);

  const sel = document.getElementById("in_paper_texture");
  if (sel && sel.value !== texture) sel.value = texture;
}

// Diya Flame Glow
function toggleDiyaGlow(enabled) {
  hasDiyaGlow = enabled;
  const flames = document.querySelectorAll(".diya-flame");
  flames.forEach(flame => {
    if (enabled) flame.classList.add("glow");
    else flame.classList.remove("glow");
  });
}

// 3D Card Depth Shadow
function toggleCard3DShadow(enabled) {
  has3DShadow = enabled;
  const card = document.getElementById("shokCard");
  if (!card) return;
  if (enabled) card.classList.add("realistic-depth");
  else card.classList.remove("realistic-depth");
}

// Typography Controls
function changeFontFamily(font) {
  document.getElementById("shokCard").style.fontFamily = font;
}

function changeNameSize(size) {
  const el = document.getElementById("card_deceased_name");
  if (el) el.style.fontSize = size + "px";
}

function changeBodySize(size) {
  const el = document.getElementById("card_announcement_box");
  if (el) el.style.fontSize = size + "px";
}

// Zoom Controls
function zoomCard(delta) {
  currentScale = Math.min(Math.max(0.4, currentScale + delta), 1.8);
  applyScale();
}

function resetZoom() {
  currentScale = 1;
  applyScale();
}

function applyScale() {
  const scaler = document.getElementById("cardScaler");
  const text = document.getElementById("zoomLevelText");
  if (scaler) scaler.style.transform = `scale(${currentScale})`;
  if (text) text.innerText = Math.round(currentScale * 100) + "%";
}

// Auto Fit Card into Viewport initially or on resize
function autoScaleCard() {
  const viewport = document.getElementById("previewViewport");
  const card = document.getElementById("shokCard");
  if (!viewport || !card) return;

  const padding = 50;
  const availableWidth = viewport.clientWidth - padding;
  const availableHeight = viewport.clientHeight - padding;
  
  let cardWidth = 1000;
  let cardHeight = 640;

  if (currentCardSize === "portrait") {
    cardWidth = 720;
    cardHeight = 980;
  } else if (currentCardSize === "square") {
    cardWidth = 850;
    cardHeight = 850;
  } else if (currentCardSize === "a4") {
    cardWidth = 1120;
    cardHeight = 790;
  }

  const scaleX = availableWidth / cardWidth;
  const scaleY = availableHeight / cardHeight;
  const fitScale = Math.min(scaleX, scaleY, 1.05);

  currentScale = Math.max(0.4, Number(fitScale.toFixed(2)));
  applyScale();
}

// Reset to Sample Template Data
function resetToSample() {
  if (!confirm("सर्व माहिती नमुना डेटानुसार रिसेट करायची आहे का? (Reset to sample?)")) return;

  document.getElementById("in_banner_title").value = defaultData.bannerTitle;
  document.getElementById("in_date_top").value = defaultData.dateTop;
  document.getElementById("in_village_top").value = defaultData.villageTop;
  document.getElementById("in_om_shanti").value = defaultData.omShanti;
  document.getElementById("in_venue_village").value = defaultData.venueVillage;
  document.getElementById("in_venue_taluka").value = defaultData.venueTaluka;
  document.getElementById("in_venue_district").value = defaultData.venueDistrict;
  document.getElementById("in_shrirara").value = defaultData.shrirara;
  document.getElementById("in_sender_line").value = defaultData.senderLine;
  document.getElementById("in_deceased_name").value = defaultData.deceasedName;
  document.getElementById("in_deceased_residence").value = defaultData.deceasedResidence;
  document.getElementById("in_death_date").value = defaultData.deathDate;
  document.getElementById("in_death_day").value = defaultData.deathDay;
  document.getElementById("in_death_time").value = defaultData.deathTime;
  document.getElementById("in_deceased_age").value = defaultData.deceasedAge;
  document.getElementById("in_dashkriya_info").value = defaultData.dashkriyaInfo;
  document.getElementById("in_uttarkarya_info").value = defaultData.uttarkaryaInfo;
  document.getElementById("in_rituals_place").value = defaultData.ritualsPlace;
  document.getElementById("in_shokakul_title").value = defaultData.shokakulTitle;
  document.getElementById("in_family_footer").value = defaultData.familyFooter;

  shokakulItems = [...defaultData.shokakulList];
  renderShokakulListInputs();
  updateCard();
  resetPhotoAdjustments();
}

// Download Card as Crisp High-Resolution PNG Image
function downloadCard() {
  const card = document.getElementById("shokCard");
  const scaler = document.getElementById("cardScaler");
  const btn = document.getElementById("btnDownload");

  if (!card) return;

  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> तयार करत आहे...';
  btn.disabled = true;

  // Temporarily reset zoom scale for unblurred canvas export
  const originalTransform = scaler.style.transform;
  scaler.style.transform = "scale(1)";

  html2canvas(card, {
    scale: 2, // High resolution (2x retina quality)
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false
  }).then(canvas => {
    // Restore preview transform
    scaler.style.transform = originalTransform;
    btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> फोटो डाउनलोड (PNG)';
    btn.disabled = false;

    // Trigger download
    const link = document.createElement("a");
    const name = (getValue("in_deceased_name") || "shok_sandesh").replace(/[^a-zA-Z0-9\u0900-\u097F]/g, "_");
    link.download = `${name}_${currentCardSize}_patrika.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }).catch(err => {
    console.error("Download error:", err);
    scaler.style.transform = originalTransform;
    btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> फोटो डाउनलोड (PNG)';
    btn.disabled = false;
    alert("फोटो डाउनलोड करताना अडचण आली, कृपया पुन्हा प्रयत्न करा किंवा प्रिंट पर्याय वापरा.");
  });
}
