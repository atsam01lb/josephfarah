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
  var currentSourceVideo = null;

  function openLightbox(html, caption, sourceVideo) {
    lbMedia.innerHTML = html;
    lbCaption.textContent = caption || "";
    currentSourceVideo = sourceVideo || null;

    /* Grid videos autoplay muted/looped with no controls; give the
       lightbox copy real controls and sound now that the person has
       deliberately opened it. */
    var lbVideo = lbMedia.querySelector("video");
    if (lbVideo) {
      lbVideo.muted = false;
      lbVideo.controls = true;
      lbVideo.loop = false;
      lbVideo.currentTime = 0;
      lbVideo.play().catch(function () {});
    }

    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    var lbVideo = lbMedia.querySelector("video");
    if (lbVideo) lbVideo.pause();
    lb.classList.remove("open");
    document.body.style.overflow = "";

    /* Resume the grid tile's muted autoplay if it's still on screen. */
    if (currentSourceVideo) {
      var r = currentSourceVideo.getBoundingClientRect();
      var visible = r.top < window.innerHeight && r.bottom > 0;
      if (visible) currentSourceVideo.play().catch(function () {});
      currentSourceVideo = null;
    }
  }
  lb.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLightbox(); });

  /* ---------- Wire up any .g-item / .cert-card on the page ---------- */
  document.querySelectorAll("[data-lightbox]").forEach(function (el) {
    el.addEventListener("click", function () {
      var media = el.querySelector(".ph-media");
      var caption = el.getAttribute("data-caption") || "";
      var srcVideo = media ? media.querySelector("video") : null;
      if (srcVideo) srcVideo.pause();
      openLightbox(media ? media.innerHTML : "", caption, srcVideo);
    });
  });

  /* ---------- Scroll-triggered autoplay for grid videos (Gallery) ----------
     Each tile plays (muted/looped) while it's in view and pauses once it
     scrolls off, so nothing plays audio or burns bandwidth off-screen. */
  var gridVideos = document.querySelectorAll(".g-item video");
  if (gridVideos.length && "IntersectionObserver" in window) {
    var vio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var vid = entry.target;
          if (entry.isIntersecting) {
            vid.play().catch(function () {});
          } else {
            vid.pause();
          }
        });
      },
      { threshold: 0.5 }
    );
    gridVideos.forEach(function (v) { vio.observe(v); });
  }
})();
