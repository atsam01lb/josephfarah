/* =========================================================
   JOSEPH FARAH - main.js
   Shared behaviour for every page: preloader, header state,
   mobile nav, scroll-reveal, testimonials, cart badge, toast.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Preloader ---------- */
  window.addEventListener("load", function () {
    var pre = document.getElementById("preloader");
    if (pre) {
      setTimeout(function () { pre.classList.add("done"); }, 350);
    }
  });

  /* ---------- Header scroll state ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var burger = document.querySelector(".burger");
  var mobileNav = document.querySelector(".mobile-nav");
  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      burger.classList.toggle("active");
      mobileNav.classList.toggle("open");
      document.body.style.overflow = mobileNav.classList.contains("open") ? "hidden" : "";
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        burger.classList.remove("active");
        mobileNav.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Active nav link ---------- */
  (function setActive() {
    var path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-desktop a, .mobile-nav a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href) return;
      if (href === path || (path === "" && href === "index.html")) {
        a.classList.add("active");
      }
    });
  })();

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Scroll reveal ----------
     Wrapped in try/catch: if anything here throws, every [data-reveal]
     element is immediately revealed rather than staying invisible. */
  var revealEls = document.querySelectorAll("[data-reveal]");
  try {
    if ("IntersectionObserver" in window && revealEls.length) {
      // stagger within a shared group
      var groups = {};
      revealEls.forEach(function (el) {
        var group = el.getAttribute("data-group") || "default-" + Math.random();
        groups[group] = groups[group] || [];
        groups[group].push(el);
      });
      Object.keys(groups).forEach(function (g) {
        groups[g].forEach(function (el, i) {
          el.style.setProperty("--rd", Math.min(i * 0.1, 0.6) + "s");
        });
      });

      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
      );
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("in"); });
    }
  } catch (e) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Testimonial carousel ---------- */
  var slides = document.querySelectorAll(".review-slide");
  var dotsWrap = document.querySelector(".review-dots");
  if (slides.length && dotsWrap) {
    var current = 0;
    var timer;
    slides.forEach(function (s, i) {
      var b = document.createElement("button");
      if (i === 0) b.classList.add("active");
      b.setAttribute("aria-label", "Show review " + (i + 1));
      b.addEventListener("click", function () { show(i); reset(); });
      dotsWrap.appendChild(b);
    });
    var dots = dotsWrap.querySelectorAll("button");
    function show(i) {
      slides[current].classList.remove("active");
      dots[current].classList.remove("active");
      current = (i + slides.length) % slides.length;
      slides[current].classList.add("active");
      dots[current].classList.add("active");
    }
    function reset() {
      clearInterval(timer);
      timer = setInterval(function () { show(current + 1); }, 5500);
    }
    reset();
  }

  /* ---------- Toast ---------- */
  window.jfToast = function (msg) {
    var t = document.querySelector(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  };

  /* ---------- Cart badge sync (every page shows count) ---------- */
  function cartCount() {
    try {
      var cart = JSON.parse(localStorage.getItem("jf_cart") || "[]");
      return cart.reduce(function (n, i) { return n + i.qty; }, 0);
    } catch (e) { return 0; }
  }
  window.jfUpdateCartBadge = function () {
    var badge = document.querySelector(".cart-count");
    if (!badge) return;
    var n = cartCount();
    badge.textContent = n;
    badge.classList.toggle("show", n > 0);
  };
  window.jfUpdateCartBadge();

  /* ---------- Generic checked-state styling for radio/checkbox "choice" tiles ---------- */
  document.querySelectorAll(".choice input, .time-slot input, .toggle-opt input").forEach(function (input) {
    var wrap = input.closest(".choice, .time-slot, .toggle-opt");
    function sync() {
      if (input.type === "radio") {
        var name = input.name;
        document.querySelectorAll('input[name="' + name + '"]').forEach(function (r) {
          var w = r.closest(".choice, .time-slot, .toggle-opt");
          if (w) w.classList.toggle("checked", r.checked);
        });
      } else {
        wrap.classList.toggle("checked", input.checked);
      }
    }
    input.addEventListener("change", sync);
    sync();
  });
})();
