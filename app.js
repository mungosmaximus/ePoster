/* =====================================================
   HELPERS
   ===================================================== */

function normalizeID(id) {
  if (!id) return null;
  const n = parseInt(id, 10);
  return isNaN(n) ? null : String(n);
}

function extractIDFromFilename(filename) {
  const m = filename.match(/^(\d+)/);
  return m ? normalizeID(m[1]) : null;
}

function cleanFilename(filename) {
  let name = filename.replace(/\.[^/.]+$/, "");
  name = name.replace(/^\d+\.\s*/, "");
  return name;
}

/* =====================================================
   INDEX (UNCHANGED)
   ===================================================== */

function ucitajListu() {
  const grid = document.getElementById("grid");
  if (!grid || !window.MATERIJALI) return;

  const hasTitles =
    typeof window.TITLES === "object" && window.TITLES !== null;

  grid.innerHTML = "";

  window.MATERIJALI.forEach((filename, index) => {
    const id = extractIDFromFilename(filename);
    const meta = hasTitles && id ? window.TITLES[id] : null;

    const card = document.createElement("a");
    card.className = "material-card";
    card.href = `viewer.html?i=${index}`;

    const wrap = document.createElement("div");
    wrap.className = "thumbnail-wrap";

    const img = document.createElement("img");
    img.className = "thumbnail-media";
    img.src = "materijal/" + filename;
    img.alt = meta ? meta.name : cleanFilename(filename);

    wrap.appendChild(img);

    const metaBox = document.createElement("div");
    metaBox.className = "poster-meta";

    if (meta) {
      const author = document.createElement("div");
      author.className = "poster-author";
      author.textContent = meta.name;

      const title = document.createElement("div");
      title.className = "poster-title";
      title.textContent = meta.title.toUpperCase();

      metaBox.appendChild(author);
      metaBox.appendChild(title);
    } else {
      const fallback = document.createElement("div");
      fallback.className = "material-title";
      fallback.textContent = cleanFilename(filename);
      metaBox.appendChild(fallback);
    }

    card.appendChild(wrap);
    card.appendChild(metaBox);
    grid.appendChild(card);
  });
}

/* =====================================================
   VIEWER (UPDATED TITLES)
   ===================================================== */

function ucitajViewer() {
  if (!window.MATERIJALI) return;

  const params = new URLSearchParams(window.location.search);
  let idx = parseInt(params.get("i"), 10);
  if (isNaN(idx)) idx = 0;

  const container = document.getElementById("viewer-container");
  const headerTitle = document.getElementById("nav-title");
  const navPosterTitle = document.getElementById("nav-poster-title");

  const hasTitles =
    typeof window.TITLES === "object" && window.TITLES !== null;

  function prikazi(i) {
    if (i < 0 || i >= window.MATERIJALI.length) return;
    idx = i;

    const filename = window.MATERIJALI[idx];
    const id = extractIDFromFilename(filename);
    const meta = hasTitles && id ? window.TITLES[id] : null;

    // HEADER: POSTER TITLE
    headerTitle.textContent = meta
      ? meta.title
      : cleanFilename(filename);

    // NAV RIGHT: AUTHOR NAME
    navPosterTitle.textContent = meta
      ? meta.name
      : cleanFilename(filename);

    container.innerHTML = "";

    const img = document.createElement("img");
    img.src = "materijal/" + filename;
    img.className = "viewer-image";

    container.appendChild(img);
  }

  window.prev = () => prikazi(idx - 1);
  window.next = () => prikazi(idx + 1);

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prikazi(idx - 1);
    if (e.key === "ArrowRight") prikazi(idx + 1);
  });

  let scrollLock = false;
  document.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      if (scrollLock) return;

      if (e.deltaY > 0) prikazi(idx + 1);
      else prikazi(idx - 1);

      scrollLock = true;
      setTimeout(() => (scrollLock = false), 400);
    },
    { passive: false }
  );

  prikazi(idx);
}
``