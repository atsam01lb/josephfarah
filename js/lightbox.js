/* =========================================================
   JOSEPH FARAH - lightbox.js
   Lightweight lightbox for Gallery + Certificates, plus the
   category filter used on the Gallery page.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Build lightbox shell once ---------- */
  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML =
    '<button class="lightbox-close" aria-label="Close">&times;</button>' +
    '<div class="lightbox-inner">' +
    '<div class="ph-media" id="lbMedia"></div>' +
    '<p class="lightbox-caption" id="lbCaption"></p>' +
    "</div>";
  document.body.appendChild(lb);
  var lbMedia = lb.querySelector("#lbMedia");
  var lbCaption = lb.querySelector("#lbCaption");

  function openLightbox(html, caption) {
    lbMedia.innerHTML = html;
    lbCaption.textContent = caption || "";
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  }
  lb.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLightbox(); });

  /* ---------- Wire up any .g-item / .cert-card on the page ---------- */
  document.querySelectorAll("[data-lightbox]").forEach(function (el) {
    el.addEventListener("click", function () {
      var media = el.querySelector(".ph-media");
      var caption = el.getAttribute("data-caption") || "";
      openLightbox(media ? media.innerHTML : "", caption);
    });
  });

  /* ---------- Gallery filter ---------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var items = document.querySelectorAll("[data-cat]");
  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var cat = btn.getAttribute("data-filter");
        items.forEach(function (item) {
          var show = cat === "all" || item.getAttribute("data-cat") === cat;
          item.style.display = show ? "" : "none";
        });
      });
    });
  }
})();
