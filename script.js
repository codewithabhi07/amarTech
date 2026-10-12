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
let currentTheme = "royal-gold";
let currentBorderStyle = "royal-filigree";
let currentTexture = "subtle";
let hasDiyaGlow = true;
let has3DShadow = true;
let shokakulItems = [...defaultData.shokakulList];
let isMarathiNumerals = true;
let currentGarlandType = "marigold";
let currentFeatherType = "none";
let showStudioBranding = false;

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
  loadDraftFromLocalStorage();
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
  debounceAutoSave();
}

// Remove Shokakul Item
function removeShokakulField(idx) {
  shokakulItems.splice(idx, 1);
  renderShokakulListInputs();
  debounceAutoSave();
}

// Handle Shokakul item input change
function handleShokakulItemChange(idx, val) {
  shokakulItems[idx] = val;
  renderShokakulCardGrid();
  debounceAutoSave();
}

// Render the 2-column grid inside the card
function renderShokakulCardGrid() {
  const grid = document.getElementById("card_shokakul_grid");
  if (!grid) return;
  grid.innerHTML = "";

  const namesSizeInput = document.getElementById("in_size_shokakul_names");
  const customFontSize = namesSizeInput ? namesSizeInput.value + "px" : "";

  shokakulItems.forEach((name, idx) => {
    if (!name.trim()) return;
    const entry = document.createElement("div");
    entry.className = "shokakul-entry";
    if (customFontSize) entry.style.fontSize = customFontSize;
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
      debounceAutoSave();
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

  update4UpClones();
  debounceAutoSave();
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
    { cardId: "card_death_date", inputId: "in_death_date" },
    { cardId: "card_death_day", inputId: "in_death_day" },
    { cardId: "card_death_time", inputId: "in_death_time" },
    { cardId: "card_deceased_age", inputId: "in_deceased_age" },
    { cardId: "card_dashkriya_info", inputId: "in_dashkriya_info" },
    { cardId: "card_uttarkarya_info", inputId: "in_uttarkarya_info" },
    { cardId: "card_rituals_place", inputId: "in_rituals_place" },
    { cardId: "card_shokakul_title", inputId: "in_shokakul_title" },
    { cardId: "card_family_footer", inputId: "in_family_footer" },
    { cardId: "card_studio_text", inputId: "in_studio_text" }
  ];

  syncPairs.forEach(pair => {
    const cardEl = document.getElementById(pair.cardId);
    const inputEl = document.getElementById(pair.inputId);
    if (cardEl && inputEl) {
      cardEl.addEventListener("input", () => {
        inputEl.value = cardEl.innerText.trim();
        update4UpClones();
        debounceAutoSave();
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

  update4UpClones();
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
  update4UpClones();
  debounceAutoSave();
}

function setPhotoFilter(filter) {
  photoFilter = filter;
  const container = document.getElementById("card_photo_container");
  if (!container) return;
  container.classList.remove("photo-filter-grayscale", "photo-filter-bright", "photo-filter-sepia");
  if (filter !== "none") {
    container.classList.add("photo-filter-" + filter);
  }
  update4UpClones();
  debounceAutoSave();
}

function toggleGarland(show) {
  showGarland = show;
  const garland = document.getElementById("card_photo_garland");
  if (garland) {
    if (show) garland.classList.remove("hidden");
    else garland.classList.add("hidden");
  }
  update4UpClones();
  debounceAutoSave();
}

// Garland Type Variants
const garlandVariants = {
  marigold: '<div class="garland-flower-center">🌼</div><div class="garland-leaves-left">🍃🌺</div><div class="garland-leaves-right">🌺🍃</div>',
  rose: '<div class="garland-flower-center">🌹</div><div class="garland-leaves-left">🌿🌹</div><div class="garland-leaves-right">🌹🌿</div>',
  jasmine: '<div class="garland-flower-center">🌸</div><div class="garland-leaves-left">🌱🌸</div><div class="garland-leaves-right">🌸🌱</div>',
  tulsi: '<div class="garland-flower-center">📿</div><div class="garland-leaves-left">🌿🌿</div><div class="garland-leaves-right">🌿🌿</div>'
};

function setGarlandType(type) {
  currentGarlandType = type;
  const garlandEl = document.getElementById("card_photo_garland");
  if (garlandEl && garlandVariants[type]) {
    garlandEl.innerHTML = garlandVariants[type];
  }
  const select = document.getElementById("in_garland_type");
  if (select && select.value !== type) select.value = type;
  update4UpClones();
  debounceAutoSave();
}

// Photo Feathering
function setPhotoFeather(type) {
  currentFeatherType = type;
  const container = document.getElementById("card_photo_container");
  if (!container) return;
  container.classList.remove("feather-soft", "feather-vignette");
  if (type === "soft") container.classList.add("feather-soft");
  if (type === "vignette") container.classList.add("feather-vignette");

  const sel = document.getElementById("in_photo_feather");
  if (sel && sel.value !== type) sel.value = type;
  update4UpClones();
  debounceAutoSave();
}

// Calligraphy Title Selector
function applyCalligraphyTitle(val) {
  const inBanner = document.getElementById("in_banner_title");
  if (inBanner) {
    inBanner.value = val;
    updateCard();
  }
  const select = document.getElementById("in_calligraphy_select");
  if (select && select.value !== val) select.value = val;
  debounceAutoSave();
}

// Studio Branding Watermark
function toggleStudioBranding(show) {
  showStudioBranding = show;
  const brandingEl = document.getElementById("cardStudioBranding");
  const groupEl = document.getElementById("group_studio_text");
  const checkEl = document.getElementById("in_show_branding");

  if (checkEl && checkEl.checked !== show) checkEl.checked = show;
  if (brandingEl) {
    if (show) brandingEl.classList.remove("hidden");
    else brandingEl.classList.add("hidden");
  }
  if (groupEl) {
    groupEl.style.display = show ? "block" : "none";
  }
  debounceAutoSave();
}

function updateStudioBrandingText(text) {
  const brandingTextEl = document.getElementById("card_studio_text");
  const inTextEl = document.getElementById("in_studio_text");
  if (brandingTextEl) brandingTextEl.innerText = text;
  if (inTextEl && inTextEl.value !== text) inTextEl.value = text;
  debounceAutoSave();
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

// Card Size Selection (Single Card or A4 4-in-1 Sheet)
function changeCardSize(sizeKey) {
  currentCardSize = sizeKey;
  const sheetWrapper = document.getElementById("a4SheetWrapper");
  const card = document.getElementById("shokCard");
  const select = document.getElementById("selectCardSize");
  const btn4Up = document.getElementById("btn4UpToggle");

  if (select && select.value !== sizeKey) select.value = sizeKey;
  if (!card || !sheetWrapper) return;

  if (sizeKey === "a4-4up") {
    sheetWrapper.classList.add("active-4up");
    card.classList.remove("size-portrait", "size-square", "size-a4");
    card.classList.add("size-landscape");
    if (btn4Up) btn4Up.classList.add("active");
    update4UpClones();
  } else {
    sheetWrapper.classList.remove("active-4up");
    if (btn4Up) btn4Up.classList.remove("active");
    card.classList.remove("size-landscape", "size-portrait", "size-square", "size-a4");
    card.classList.add("size-" + sizeKey);
  }

  // Recalculate zoom scale to fit the new aspect ratio
  setTimeout(autoScaleCard, 100);
  debounceAutoSave();
}

// Toggle between 1-Card and 4-on-A4 Sheet Mode
function toggle4UpSheetMode() {
  if (currentCardSize === "a4-4up") {
    changeCardSize("landscape");
  } else {
    changeCardSize("a4-4up");
  }
}

// Mirror Master Card to all 3 Clones in 4-up mode
function update4UpClones() {
  if (currentCardSize !== "a4-4up") return;
  const master = document.getElementById("shokCard");
  if (!master) return;

  for (let i = 1; i <= 3; i++) {
    const clone = document.getElementById("cloneCard" + i);
    if (clone) {
      clone.innerHTML = master.innerHTML;
      clone.className = master.className;
      clone.id = "cloneCard" + i;
      // remove duplicate ids inside clone to avoid DOM collisions
      const elsWithId = clone.querySelectorAll("[id]");
      elsWithId.forEach(el => el.removeAttribute("id"));
      // make non-editable so user edits master card
      const editables = clone.querySelectorAll("[contenteditable]");
      editables.forEach(el => el.setAttribute("contenteditable", "false"));
    }
  }
}

// State & Toggles for Scissor Cut Markers and Lines
let hideCutMarkers = false;
let hideCutLines = false;

function toggleCutMarkers(forcedState) {
  const sheetWrapper = document.getElementById("a4SheetWrapper");
  hideCutMarkers = (typeof forcedState === "boolean") ? forcedState : !hideCutMarkers;

  if (sheetWrapper) {
    if (hideCutMarkers) sheetWrapper.classList.add("hide-cut-markers");
    else sheetWrapper.classList.remove("hide-cut-markers");
  }

  const btn = document.getElementById("btnToggleCutMarkers");
  if (btn) {
    btn.innerHTML = hideCutMarkers
      ? '<i class="fa-solid fa-scissors"></i> कात्री आयकॉन दाखवा'
      : '<i class="fa-solid fa-scissors"></i> कात्री आयकॉन लपवा';
  }
  const chk = document.getElementById("chk_hide_cut_markers");
  if (chk && chk.checked !== hideCutMarkers) chk.checked = hideCutMarkers;
  debounceAutoSave();
}

// Backward compatibility alias
function toggleCutBadges(forcedState) {
  toggleCutMarkers(forcedState);
}

function toggleCutLines(forcedState) {
  const sheetWrapper = document.getElementById("a4SheetWrapper");
  hideCutLines = (typeof forcedState === "boolean") ? forcedState : !hideCutLines;

  if (sheetWrapper) {
    if (hideCutLines) sheetWrapper.classList.add("hide-cut-lines");
    else sheetWrapper.classList.remove("hide-cut-lines");
  }

  const btn = document.getElementById("btnToggleCutLines");
  if (btn) {
    btn.innerHTML = hideCutLines
      ? '<i class="fa-solid fa-grip-lines"></i> कटिंग रेषा दाखवा'
      : '<i class="fa-solid fa-border-none"></i> कटिंग रेषा लपवा';
  }
  const chk = document.getElementById("chk_hide_cut_lines");
  if (chk && chk.checked !== hideCutLines) chk.checked = hideCutLines;
  debounceAutoSave();
}

// Theme Switcher supporting 12 Rich Themes
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
  update4UpClones();
  debounceAutoSave();
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
  update4UpClones();
  debounceAutoSave();
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
  update4UpClones();
  debounceAutoSave();
}

// Diya Flame Glow
function toggleDiyaGlow(enabled) {
  hasDiyaGlow = enabled;
  const flames = document.querySelectorAll(".diya-flame");
  flames.forEach(flame => {
    if (enabled) flame.classList.add("glow");
    else flame.classList.remove("glow");
  });
  update4UpClones();
  debounceAutoSave();
}

// 3D Card Depth Shadow
function toggleCard3DShadow(enabled) {
  has3DShadow = enabled;
  const card = document.getElementById("shokCard");
  if (!card) return;
  if (enabled) card.classList.add("realistic-depth");
  else card.classList.remove("realistic-depth");
  update4UpClones();
  debounceAutoSave();
}

// Typography & Individual Field Font Size Controls
function changeFontFamily(font) {
  document.getElementById("shokCard").style.fontFamily = font;
  update4UpClones();
  debounceAutoSave();
}

// Step button increment/decrement helper
function stepFontSize(inputId, delta) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const current = parseFloat(input.value);
  const min = parseFloat(input.min) || 8;
  const max = parseFloat(input.max) || 60;
  const step = parseFloat(input.step) || 1;
  const newVal = Math.min(Math.max(min, current + (delta * step)), max);
  input.value = newVal;
  input.dispatchEvent(new Event("input"));
}

// 1. Banner Title Size
function changeBannerTitleSize(size) {
  const el = document.getElementById("card_banner_title");
  if (el) el.style.fontSize = size + "px";
  const val = document.getElementById("val_size_banner_title");
  if (val) val.innerText = size + "px";
  update4UpClones();
  debounceAutoSave();
}

// 2. Top Date Size
function changeTopDateSize(size) {
  const el = document.getElementById("card_date_top");
  if (el) el.style.fontSize = size + "px";
  const val = document.getElementById("val_size_top_date");
  if (val) val.innerText = size + "px";
  update4UpClones();
  debounceAutoSave();
}

// 3. Top Village and Om Shanti Size
function changeTopVillageSize(size) {
  const elVillage = document.getElementById("card_village_top");
  const elMantra = document.getElementById("card_om_shanti");
  if (elVillage) elVillage.style.fontSize = size + "px";
  if (elMantra) elMantra.style.fontSize = Math.max(12, Math.round(size * 0.65)) + "px";
  const val = document.getElementById("val_size_top_village");
  if (val) val.innerText = size + "px";
  update4UpClones();
  debounceAutoSave();
}

// 4. Venue Box Text Size
function changeVenueTextSize(size) {
  const lines = document.querySelectorAll("#card_venue_taluka, #card_venue_district");
  lines.forEach(l => l.style.fontSize = size + "px");
  const village = document.getElementById("card_venue_village");
  if (village) village.style.fontSize = (parseFloat(size) + 6) + "px";
  const val = document.getElementById("val_size_venue_text");
  if (val) val.innerText = size + "px";
  update4UpClones();
  debounceAutoSave();
}

// 5. Deceased Name Size
function changeNameSize(size) {
  const el = document.getElementById("card_deceased_name");
  if (el) el.style.fontSize = size + "px";
  const val = document.getElementById("val_size_name");
  if (val) val.innerText = size + "px";
  update4UpClones();
  debounceAutoSave();
}

// 6. Residence Size (रा. लासुर यांचे)
function changeResidenceSize(size) {
  const el = document.getElementById("card_deceased_residence");
  if (el) el.style.fontSize = size + "px";
  const val = document.getElementById("val_size_residence");
  if (val) val.innerText = size + "px";
  update4UpClones();
  debounceAutoSave();
}

// 7. Salutation 'श्री.रा.रा. ... यांना' Size
function changeShriraraSize(size) {
  const el = document.getElementById("card_shrirara");
  if (el) el.style.fontSize = size + "px";
  const val = document.getElementById("val_size_shrirara");
  if (val) val.innerText = size + "px";
  update4UpClones();
  debounceAutoSave();
}

// 8. Sender Line Size (कळविणारे)
function changeSenderLineSize(size) {
  const el = document.getElementById("card_sender_line");
  if (el) el.style.fontSize = size + "px";
  const val = document.getElementById("val_size_sender_line");
  if (val) val.innerText = size + "px";
  update4UpClones();
  debounceAutoSave();
}

// 9. Announcement and Rituals Body Size
function changeBodySize(size) {
  const el = document.getElementById("card_announcement_box");
  if (el) el.style.fontSize = size + "px";
  const val = document.getElementById("val_size_body");
  if (val) val.innerText = size + "px";
  update4UpClones();
  debounceAutoSave();
}

// 10. Shokakul Header Title Size
function changeShokakulTitleSize(size) {
  const el = document.getElementById("card_shokakul_title");
  if (el) el.style.fontSize = size + "px";
  const val = document.getElementById("val_size_shokakul_title");
  if (val) val.innerText = size + "px";
  update4UpClones();
  debounceAutoSave();
}

// 11. Shokakul Names List Size
function changeShokakulNamesSize(size) {
  const entries = document.querySelectorAll(".shokakul-entry, .shokakul-text");
  entries.forEach(e => e.style.fontSize = size + "px");
  const grid = document.getElementById("card_shokakul_grid");
  if (grid) grid.style.fontSize = size + "px";
  const val = document.getElementById("val_size_shokakul_names");
  if (val) val.innerText = size + "px";
  update4UpClones();
  debounceAutoSave();
}

// 12. Family Footer Size (समस्त परिवार)
function changeFamilyFooterSize(size) {
  const el = document.getElementById("card_family_footer");
  if (el) el.style.fontSize = size + "px";
  const val = document.getElementById("val_size_family_footer");
  if (val) val.innerText = size + "px";
  update4UpClones();
  debounceAutoSave();
}

// 13. Studio Branding Size
function changeStudioBrandingSize(size) {
  const el = document.getElementById("cardStudioBranding");
  if (el) el.style.fontSize = size + "px";
  const val = document.getElementById("val_size_studio");
  if (val) val.innerText = size + "px";
  update4UpClones();
  debounceAutoSave();
}

// Reset All Font Sizes to Default Perfect Balance
function resetAllFontSizes() {
  const defaults = {
    in_size_banner_title: 32,
    in_size_top_date: 22,
    in_size_top_village: 28,
    in_size_venue_text: 15,
    in_name_size: 28,
    in_size_residence: 20,
    in_size_shrirara: 19,
    in_size_sender_line: 16,
    in_body_size: 16,
    in_size_shokakul_title: 17,
    in_size_shokakul_names: 15,
    in_size_family_footer: 17,
    in_size_studio: 11.5
  };

  for (const [id, val] of Object.entries(defaults)) {
    const el = document.getElementById(id);
    if (el) {
      el.value = val;
      el.dispatchEvent(new Event("input"));
    }
  }
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

  if (currentCardSize === "a4-4up") {
    cardWidth = 2100;
    cardHeight = 1485;
  } else if (currentCardSize === "portrait") {
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
  resetAllFontSizes();
}

// Download Card as Crisp High-Resolution PNG Image
function downloadCard() {
  const is4Up = currentCardSize === "a4-4up";
  const targetEl = is4Up ? document.getElementById("a4SheetWrapper") : document.getElementById("shokCard");
  const scaler = document.getElementById("cardScaler");
  const btn = document.getElementById("btnDownload");

  if (!targetEl) return;

  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> तयार करत आहे...';
  btn.disabled = true;

  // Temporarily reset zoom scale for unblurred canvas export
  const originalTransform = scaler.style.transform;
  scaler.style.transform = "scale(1)";

  if (is4Up) update4UpClones();

  // For 4-up export: ensure guide bar header never appears in exported PNG
  const guideBar = document.getElementById("a4SheetGuideBar");
  const origGuideDisplay = guideBar ? guideBar.style.display : "";

  if (is4Up && guideBar) {
    guideBar.style.display = "none";
  }

  const restoreState = () => {
    scaler.style.transform = originalTransform;
    btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> फोटो डाउनलोड (PNG)';
    btn.disabled = false;
    if (is4Up && guideBar) {
      guideBar.style.display = origGuideDisplay;
    }
  };

  html2canvas(targetEl, {
    scale: is4Up ? 1.5 : 2, // 1.5x on 2100x1485 creates 3150x2227 ultra-sharp print PNG
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false
  }).then(canvas => {
    restoreState();

    // Trigger download
    const link = document.createElement("a");
    const name = (getValue("in_deceased_name") || "shok_sandesh").replace(/[^a-zA-Z0-9\u0900-\u097F]/g, "_");
    link.download = is4Up ? `${name}_A4_4_Copies_Cut_Sheet.png` : `${name}_${currentCardSize}_patrika.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }).catch(err => {
    console.error("Download error:", err);
    restoreState();
    alert("फोटो डाउनलोड करताना अडचण आली, कृपया पुन्हा प्रयत्न करा किंवा प्रिंट पर्याय वापरा.");
  });
}

// ==========================================================================
// PRESET EVENT TEMPLATES (दशक्रिया, श्रद्धांजली, पुण्यस्मरण, तेरवी)
// ==========================================================================
const eventPresets = {
  dashkriya: {
    bannerTitle: "शोक संदेश",
    calligraphy: "॥ शोक संदेश ॥",
    senderLine: "श्री.वासुदेव नारायण माळी व भगवान नारायण माळी यांच्या कडून कळविण्यास अत्यंत दुःख होते की, यांचे वडील नामे:",
    dashkriyaInfo: "दि. ११/०९/२०२६ वार शुक्रवार रोजी",
    uttarkaryaInfo: "दि. १२/०९/२०२६ वार शनिवार रोजी सकाळी ११ वाजता",
    ritualsPlace: "माळी समाज मंगल कार्यालय येथे करण्याचे योजिले आहे."
  },
  shradhanjali: {
    bannerTitle: "भावपूर्ण श्रद्धांजली",
    calligraphy: "॥ भावपूर्ण श्रद्धांजली ॥",
    senderLine: "अत्यंत दुःखद अंतःकरणाने कळविण्यात येते की, आमचे आदरणीय कुटुंबप्रमुख व आधारस्तंभ:",
    dashkriyaInfo: "स्मृती सुगंध व प्रार्थना सभा: दि. ०५/०९/२०२६ रोजी सायंकाळी ५ वाजता",
    uttarkaryaInfo: "श्रद्धांजली सभा: निवासस्थानी आयोजित केली आहे.",
    ritualsPlace: "निवासस्थान, लासुर, ता. चोपडा, जि. जळगाव येथे."
  },
  punyasmaran: {
    bannerTitle: "प्रथम पुण्यस्मरण",
    calligraphy: "॥ प्रथम पुण्यस्मरण ॥",
    senderLine: "आपल्या पवित्र स्मृतींचा सुगंध आजही मनात दरवळत आहे. आमचे परम आदरणीय:",
    dashkriyaInfo: "पुण्यस्मरण विधी व भजन: दि. ०२/०९/२०२६ रोजी सकाळी ९ वाजता",
    uttarkaryaInfo: "महाप्रसाद वाटप: दुपारी १२:३० वाजता",
    ritualsPlace: "श्री सिद्धेश्वर मंदिर परिसर, लासुर येथे."
  },
  teravi: {
    bannerTitle: "तेरवी व गंधमुक्ती",
    calligraphy: "॥ दुःखद निधन ॥",
    senderLine: "कळविण्यास अत्यंत दुःख होते की, आमचे वडील कै. नारायण उखा माळी यांचे निधन झाले असून:",
    dashkriyaInfo: "दशक्रिया विधी: दि. ११/०९/२०२६ वार शुक्रवार रोजी",
    uttarkaryaInfo: "तेरवी व गंधमुक्ती कार्यक्रम: दि. १४/०९/२०२६ रोजी सकाळी १०:३० वाजता",
    ritualsPlace: "माळी समाज मंगल कार्यालय, लासुर येथे."
  }
};

function loadEventPreset(type) {
  const preset = eventPresets[type];
  if (!preset) return;

  // Set active pill
  document.querySelectorAll(".preset-pill").forEach(p => p.classList.remove("active"));
  const activePill = document.getElementById("pill_" + type);
  if (activePill) activePill.classList.add("active");

  // Apply texts to form
  const inBanner = document.getElementById("in_banner_title");
  const inCalligraphy = document.getElementById("in_calligraphy_select");
  const inSender = document.getElementById("in_sender_line");
  const inDashkriya = document.getElementById("in_dashkriya_info");
  const inUttarkarya = document.getElementById("in_uttarkarya_info");
  const inRituals = document.getElementById("in_rituals_place");

  if (inBanner) inBanner.value = preset.bannerTitle;
  if (inCalligraphy) inCalligraphy.value = preset.calligraphy;
  if (inSender) inSender.value = preset.senderLine;
  if (inDashkriya) inDashkriya.value = preset.dashkriyaInfo;
  if (inUttarkarya) inUttarkarya.value = preset.uttarkaryaInfo;
  if (inRituals) inRituals.value = preset.ritualsPlace;

  updateCard();
  debounceAutoSave();
}

// ==========================================================================
// MARATHI / ENGLISH NUMERALS CONVERTER (123 <-> १२३)
// ==========================================================================
const engToMarDigits = {
  "0": "०", "1": "१", "2": "२", "3": "३", "4": "४",
  "5": "५", "6": "६", "7": "७", "8": "८", "9": "९"
};
const marToEngDigits = {
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
  "५": "5", "६": "6", "७": "7", "८": "8", "९": "9"
};

function convertNumbersInString(str, toMarathi) {
  if (!str) return "";
  if (toMarathi) {
    return str.replace(/[0-9]/g, d => engToMarDigits[d] || d);
  } else {
    return str.replace(/[०-९]/g, d => marToEngDigits[d] || d);
  }
}

function toggleMarathiNumerals() {
  isMarathiNumerals = !isMarathiNumerals;
  const label = document.getElementById("numConvertLabel");
  if (label) {
    label.innerText = isMarathiNumerals ? "इंग्रजी अंक करा (१२३ ➔ 123)" : "मराठी अंक करा (123 ➔ १२३)";
  }

  const fieldIds = [
    "in_date_top", "in_death_date", "in_death_time", "in_deceased_age",
    "in_dashkriya_info", "in_uttarkarya_info", "in_shrirara"
  ];

  fieldIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = convertNumbersInString(el.value, isMarathiNumerals);
  });

  // Convert numbers in shokakul list too
  shokakulItems = shokakulItems.map(item => convertNumbersInString(item, isMarathiNumerals));
  renderShokakulListInputs();
  updateCard();
  debounceAutoSave();
}

// ==========================================================================
// WHATSAPP INSTANT SHARE
// ==========================================================================
function shareOnWhatsApp() {
  const banner = getValue("in_banner_title") || "शोक संदेश";
  const name = getValue("in_deceased_name") || "कै.";
  const residence = getValue("in_deceased_residence") || "";
  const deathDate = getValue("in_death_date") || "";
  const deathDay = getValue("in_death_day") || "";
  const deathTime = getValue("in_death_time") || "";
  const age = getValue("in_deceased_age") || "";
  const dashkriya = getValue("in_dashkriya_info") || "";
  const uttarkarya = getValue("in_uttarkarya_info") || "";
  const ritualsPlace = getValue("in_rituals_place") || "";
  const family = getValue("in_family_footer") || "";

  let msg = `॥ ${banner} ॥\n\n`;
  msg += `अत्यंत दुःखद अंतःकरणाने कळविण्यात येते की,\n`;
  msg += `*${name}* (${residence})\n`;
  if (deathDate) msg += `यांचे ${deathDate} (${deathDay}) रोजी ${deathTime} ${age} दुःखद निधन झाले आहे.\n\n`;
  if (dashkriya) msg += `🕊️ *दशक्रिया विधी:* ${dashkriya}\n`;
  if (uttarkarya) msg += `🪔 *उत्तर कार्य:* ${uttarkarya}\n`;
  if (ritualsPlace) msg += `📍 *स्थळ:* ${ritualsPlace}\n\n`;
  if (family) msg += `*शोकाकुल:* ${family}\n`;

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

// ==========================================================================
// LOCAL STORAGE AUTO-SAVE & DRAFT RECOVERY
// ==========================================================================
let autoSaveTimer = null;

function debounceAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    saveDraftToLocalStorage();
  }, 600);
}

function saveDraftToLocalStorage() {
  try {
    const draft = {
      bannerTitle: getValue("in_banner_title"),
      dateTop: getValue("in_date_top"),
      villageTop: getValue("in_village_top"),
      omShanti: getValue("in_om_shanti"),
      venueVillage: getValue("in_venue_village"),
      venueTaluka: getValue("in_venue_taluka"),
      venueDistrict: getValue("in_venue_district"),
      shrirara: getValue("in_shrirara"),
      senderLine: getValue("in_sender_line"),
      deceasedName: getValue("in_deceased_name"),
      deceasedResidence: getValue("in_deceased_residence"),
      deathDate: getValue("in_death_date"),
      deathDay: getValue("in_death_day"),
      deathTime: getValue("in_death_time"),
      deceasedAge: getValue("in_deceased_age"),
      dashkriyaInfo: getValue("in_dashkriya_info"),
      uttarkaryaInfo: getValue("in_uttarkarya_info"),
      ritualsPlace: getValue("in_rituals_place"),
      shokakulTitle: getValue("in_shokakul_title"),
      familyFooter: getValue("in_family_footer"),
      shokakulList: shokakulItems,
      currentCardSize,
      currentTheme,
      currentBorderStyle,
      currentTexture,
      hasDiyaGlow,
      has3DShadow,
      photoScale,
      photoX,
      photoY,
      photoRotate,
      frameShape,
      photoFilter,
      currentFeatherType,
      currentGarlandType,
      showGarland,
      showStudioBranding,
      studioText: getValue("in_studio_text"),
      isMarathiNumerals,
      fontSizeBannerTitle: getValue("in_size_banner_title"),
      fontSizeTopDate: getValue("in_size_top_date"),
      fontSizeTopVillage: getValue("in_size_top_village"),
      fontSizeVenueText: getValue("in_size_venue_text"),
      fontSizeName: getValue("in_name_size"),
      fontSizeResidence: getValue("in_size_residence"),
      fontSizeShrirara: getValue("in_size_shrirara"),
      fontSizeSenderLine: getValue("in_size_sender_line"),
      fontSizeBody: getValue("in_body_size"),
      fontSizeShokakulTitle: getValue("in_size_shokakul_title"),
      fontSizeShokakulNames: getValue("in_size_shokakul_names"),
      fontSizeFamilyFooter: getValue("in_size_family_footer"),
      fontSizeStudio: getValue("in_size_studio"),
      hideCutMarkers,
      hideCutLines
    };
    localStorage.setItem("shok_sandesh_draft", JSON.stringify(draft));
    flashAutoSaveIndicator("✓ सेव्ह झाले");
  } catch (err) {
    console.warn("Auto-save warning:", err);
  }
}

function saveDraftManually() {
  saveDraftToLocalStorage();
  flashAutoSaveIndicator("✓ ड्राफ्ट सेव्ह झाला!");
}

function flashAutoSaveIndicator(text) {
  const tag = document.getElementById("autoSaveTag");
  if (!tag) return;
  tag.innerHTML = `<i class="fa-solid fa-check"></i> ${text}`;
  tag.style.opacity = "1";
  tag.style.background = "#dcfce7";
  tag.style.borderColor = "#86efac";
  tag.style.color = "#15803d";
  setTimeout(() => {
    if (tag) tag.style.opacity = "0.75";
  }, 2000);
}

function loadDraftFromLocalStorage() {
  try {
    const raw = localStorage.getItem("shok_sandesh_draft");
    if (!raw) return;
    const draft = JSON.parse(raw);

    if (draft.bannerTitle !== undefined) {
      const el = document.getElementById("in_banner_title");
      if (el) el.value = draft.bannerTitle;
    }
    if (draft.dateTop !== undefined) {
      const el = document.getElementById("in_date_top");
      if (el) el.value = draft.dateTop;
    }
    if (draft.villageTop !== undefined) {
      const el = document.getElementById("in_village_top");
      if (el) el.value = draft.villageTop;
    }
    if (draft.omShanti !== undefined) {
      const el = document.getElementById("in_om_shanti");
      if (el) el.value = draft.omShanti;
    }
    if (draft.venueVillage !== undefined) {
      const el = document.getElementById("in_venue_village");
      if (el) el.value = draft.venueVillage;
    }
    if (draft.venueTaluka !== undefined) {
      const el = document.getElementById("in_venue_taluka");
      if (el) el.value = draft.venueTaluka;
    }
    if (draft.venueDistrict !== undefined) {
      const el = document.getElementById("in_venue_district");
      if (el) el.value = draft.venueDistrict;
    }
    if (draft.shrirara !== undefined) {
      const el = document.getElementById("in_shrirara");
      if (el) el.value = draft.shrirara;
    }
    if (draft.senderLine !== undefined) {
      const el = document.getElementById("in_sender_line");
      if (el) el.value = draft.senderLine;
    }
    if (draft.deceasedName !== undefined) {
      const el = document.getElementById("in_deceased_name");
      if (el) el.value = draft.deceasedName;
    }
    if (draft.deceasedResidence !== undefined) {
      const el = document.getElementById("in_deceased_residence");
      if (el) el.value = draft.deceasedResidence;
    }
    if (draft.deathDate !== undefined) {
      const el = document.getElementById("in_death_date");
      if (el) el.value = draft.deathDate;
    }
    if (draft.deathDay !== undefined) {
      const el = document.getElementById("in_death_day");
      if (el) el.value = draft.deathDay;
    }
    if (draft.deathTime !== undefined) {
      const el = document.getElementById("in_death_time");
      if (el) el.value = draft.deathTime;
    }
    if (draft.deceasedAge !== undefined) {
      const el = document.getElementById("in_deceased_age");
      if (el) el.value = draft.deceasedAge;
    }
    if (draft.dashkriyaInfo !== undefined) {
      const el = document.getElementById("in_dashkriya_info");
      if (el) el.value = draft.dashkriyaInfo;
    }
    if (draft.uttarkaryaInfo !== undefined) {
      const el = document.getElementById("in_uttarkarya_info");
      if (el) el.value = draft.uttarkaryaInfo;
    }
    if (draft.ritualsPlace !== undefined) {
      const el = document.getElementById("in_rituals_place");
      if (el) el.value = draft.ritualsPlace;
    }
    if (draft.shokakulTitle !== undefined) {
      const el = document.getElementById("in_shokakul_title");
      if (el) el.value = draft.shokakulTitle;
    }
    if (draft.familyFooter !== undefined) {
      const el = document.getElementById("in_family_footer");
      if (el) el.value = draft.familyFooter;
    }
    if (draft.studioText !== undefined) {
      const inStudio = document.getElementById("in_studio_text");
      if (inStudio) inStudio.value = draft.studioText;
      updateStudioBrandingText(draft.studioText);
    }

    if (Array.isArray(draft.shokakulList)) {
      shokakulItems = [...draft.shokakulList];
      renderShokakulListInputs();
    }

    if (draft.currentCardSize) changeCardSize(draft.currentCardSize);
    if (draft.currentTheme) setCardTheme(draft.currentTheme);
    if (draft.currentBorderStyle) setBorderDesign(draft.currentBorderStyle);
    if (draft.currentTexture) setPaperTexture(draft.currentTexture);
    if (draft.hasDiyaGlow !== undefined) {
      const diyaCheck = document.getElementById("in_diya_glow");
      if (diyaCheck) diyaCheck.checked = draft.hasDiyaGlow;
      toggleDiyaGlow(draft.hasDiyaGlow);
    }
    if (draft.has3DShadow !== undefined) {
      const shadowCheck = document.getElementById("in_card_3d_shadow");
      if (shadowCheck) shadowCheck.checked = draft.has3DShadow;
      toggleCard3DShadow(draft.has3DShadow);
    }
    if (draft.photoScale !== undefined) photoScale = draft.photoScale;
    if (draft.photoX !== undefined) photoX = draft.photoX;
    if (draft.photoY !== undefined) photoY = draft.photoY;
    if (draft.photoRotate !== undefined) photoRotate = draft.photoRotate;
    applyPhotoTransform();

    if (draft.frameShape) {
      const shapeSelect = document.getElementById("in_frame_shape");
      if (shapeSelect) shapeSelect.value = draft.frameShape;
      setFrameShape(draft.frameShape);
    }
    if (draft.photoFilter) {
      const filterSelect = document.getElementById("in_photo_filter");
      if (filterSelect) filterSelect.value = draft.photoFilter;
      setPhotoFilter(draft.photoFilter);
    }
    if (draft.currentFeatherType) setPhotoFeather(draft.currentFeatherType);
    if (draft.currentGarlandType) setGarlandType(draft.currentGarlandType);
    if (draft.showGarland !== undefined) {
      const gCheck = document.getElementById("in_show_garland");
      if (gCheck) gCheck.checked = draft.showGarland;
      toggleGarland(draft.showGarland);
    }
    if (draft.showStudioBranding !== undefined) {
      toggleStudioBranding(draft.showStudioBranding);
    }

    if (draft.isMarathiNumerals !== undefined) {
      isMarathiNumerals = draft.isMarathiNumerals;
      const label = document.getElementById("numConvertLabel");
      if (label) {
        label.innerText = isMarathiNumerals ? "इंग्रजी अंक करा (१२३ ➔ 123)" : "मराठी अंक करा (123 ➔ १२३)";
      }
    }

    // Restore Customized Text Sizes for All Fields
    const fontFields = [
      { key: "fontSizeBannerTitle", id: "in_size_banner_title", fn: changeBannerTitleSize },
      { key: "fontSizeTopDate", id: "in_size_top_date", fn: changeTopDateSize },
      { key: "fontSizeTopVillage", id: "in_size_top_village", fn: changeTopVillageSize },
      { key: "fontSizeVenueText", id: "in_size_venue_text", fn: changeVenueTextSize },
      { key: "fontSizeName", id: "in_name_size", fn: changeNameSize },
      { key: "fontSizeResidence", id: "in_size_residence", fn: changeResidenceSize },
      { key: "fontSizeShrirara", id: "in_size_shrirara", fn: changeShriraraSize },
      { key: "fontSizeSenderLine", id: "in_size_sender_line", fn: changeSenderLineSize },
      { key: "fontSizeBody", id: "in_body_size", fn: changeBodySize },
      { key: "fontSizeShokakulTitle", id: "in_size_shokakul_title", fn: changeShokakulTitleSize },
      { key: "fontSizeShokakulNames", id: "in_size_shokakul_names", fn: changeShokakulNamesSize },
      { key: "fontSizeFamilyFooter", id: "in_size_family_footer", fn: changeFamilyFooterSize },
      { key: "fontSizeStudio", id: "in_size_studio", fn: changeStudioBrandingSize }
    ];

    fontFields.forEach(ff => {
      if (draft[ff.key] !== undefined && draft[ff.key] !== "") {
        const inp = document.getElementById(ff.id);
        if (inp) inp.value = draft[ff.key];
        ff.fn(draft[ff.key]);
      }
    });

    if (draft.hideCutMarkers !== undefined) {
      toggleCutMarkers(draft.hideCutMarkers);
    } else if (draft.hideCutBadges !== undefined) {
      toggleCutMarkers(draft.hideCutBadges);
    }
    if (draft.hideCutLines !== undefined) {
      toggleCutLines(draft.hideCutLines);
    }

    updateCard();
  } catch (err) {
    console.warn("Could not restore draft:", err);
  }
}
