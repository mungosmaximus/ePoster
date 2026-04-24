function ukloniEkstenziju(naziv) {
  return naziv.replace(/\.[^/.]+$/, "");
}

/* ===== FORMATIRANJE NAZIVA (INDEX + VIEWER) ===== */
function formatirajNaziv(nazivFajla) {
  // ukloni ekstenziju
  let naziv = nazivFajla.replace(/\.[^/.]+$/, "");

  // ukloni vodeći broj + tačku + razmake (npr. "01. ", "1. ")
  naziv = naziv.replace(/^\d+\.\s*/, "");

  return naziv;
}

/* ================= SESSION CACHE (INDEX) ================= */

function getCachedImage(key) {
  return sessionStorage.getItem(key);
}

function setCachedImage(key, dataUrl) {
  try {
    sessionStorage.setItem(key, dataUrl);
  } catch (e) {}
}

/* ================= INDEX ================= */

function ucitajListu() {
  const grid = document.getElementById("grid");
  if (!grid || !window.MATERIJALI) return;

  grid.innerHTML = "";

  window.MATERIJALI.forEach((fajl, i) => {
    const cacheKey = "thumb_" + fajl;

    const card = document.createElement("a");
    card.className = "material-card";
    card.href = `viewer.html?i=${i}`;

    const wrap = document.createElement("div");
    wrap.className = "thumbnail-wrap";

    const img = document.createElement("img");
    img.className = "thumbnail-media";
    img.alt = formatirajNaziv(fajl);

    const cached = getCachedImage(cacheKey);
    if (cached) {
      img.src = cached;
    } else {
      img.src = "materijal/" + fajl;
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext("2d").drawImage(img, 0, 0);
          setCachedImage(cacheKey, canvas.toDataURL("image/jpeg", 0.85));
        } catch (e) {}
      };
    }

    wrap.appendChild(img);

    const title = document.createElement("div");
    title.className = "material-title";
    title.textContent = formatirajNaziv(fajl);

    card.appendChild(wrap);
    card.appendChild(title);
    grid.appendChild(card);
  });
}

/* ================= VIEWER ================= */

function ucitajViewer() {
  if (!window.MATERIJALI) return;

  const params = new URLSearchParams(window.location.search);
  let idx = parseInt(params.get("i"), 10);
  if (isNaN(idx)) idx = 0;

  const container = document.getElementById("viewer-container");
  const headerTitle = document.getElementById("nav-title");
  const navPosterTitle = document.getElementById("nav-poster-title");

  function prikazi(i) {
    if (i < 0 || i >= window.MATERIJALI.length) return;
    idx = i;

    const fajl = window.MATERIJALI[idx];
    const cistNaziv = formatirajNaziv(fajl);

    // Naslov u headeru (ako postoji)
    if (headerTitle) headerTitle.textContent = cistNaziv;

    // Naziv desno u navigaciji
    if (navPosterTitle) navPosterTitle.textContent = cistNaziv;

    container.innerHTML = "";

    const img = document.createElement("img");
    img.src = "materijal/" + fajl;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "contain";

    container.appendChild(img);
  }

  // Dugmad + tastatura + miš (Ver.2.5)
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
      else if (e.deltaY < 0) prikazi(idx - 1);

      scrollLock = true;
      setTimeout(() => (scrollLock = false), 400);
    },
    { passive: false }
  );

  prikazi(idx);
}
``