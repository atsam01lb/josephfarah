/* =========================================================
   JOSEPH FARAH - cart.js  (Shop page only)
   localStorage cart + drawer + mandatory pickup/delivery
   checkout that hands the finished order to WhatsApp.
   ========================================================= */
(function () {
  "use strict";
  if (!document.querySelector(".shop-grid")) return; // only run on shop page

  var WHATSAPP_NUMBER = "9613293637";
  var STORAGE_KEY = "jf_cart";

  function getCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch (e) { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    window.jfUpdateCartBadge && window.jfUpdateCartBadge();
  }

  /* ---------- Add to cart buttons ---------- */
  document.querySelectorAll(".add-cart-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cart = getCart();
      var id = btn.getAttribute("data-id");
      var existing = cart.find(function (i) { return i.id === id; });
      if (existing) existing.qty += 1;
      else {
        cart.push({
          id: id,
          name: btn.getAttribute("data-name"),
          cat: btn.getAttribute("data-cat"),
          price: parseFloat(btn.getAttribute("data-price")),
          icon: btn.getAttribute("data-icon") || "",
          qty: 1,
        });
      }
      saveCart(cart);
      renderCart();
      btn.classList.add("added");
      setTimeout(function () { btn.classList.remove("added"); }, 900);
      window.jfToast && window.jfToast(btn.getAttribute("data-name") + " added to basket");
    });
  });

  /* ---------- Drawer elements ---------- */
  var overlay = document.querySelector(".cart-overlay");
  var drawer = document.querySelector(".cart-drawer");
  var itemsWrap = document.querySelector(".cart-items");
  var totalEl = document.querySelector(".cart-total-amount");
  var cartTriggers = document.querySelectorAll("[data-cart-open]");
  var cartClose = document.querySelector(".cart-close");
  var checkoutBtn = document.querySelector(".cart-checkout-btn");

  function openDrawer() {
    overlay.classList.add("open");
    drawer.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    overlay.classList.remove("open");
    drawer.classList.remove("open");
    document.body.style.overflow = "";
  }
  cartTriggers.forEach(function (t) { t.addEventListener("click", function (e) { e.preventDefault(); openDrawer(); }); });
  if (cartClose) cartClose.addEventListener("click", closeDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);

  function iconSvg(name) {
    var icons = {
      makeup: '<circle cx="12" cy="8" r="3"/><path d="M12 11v9M9 20h6"/>',
      skincare: '<path d="M12 3c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10Z"/>',
      hair: '<path d="M4 20c4-10 6-15 8-15s4 5 8 15"/><path d="M8 20c2-6 3-9 4-9s2 3 4 9"/>',
      nails: '<rect x="9" y="3" width="6" height="14" rx="3"/><path d="M9 17h6v4H9z"/>',
    };
    return icons[name] || icons.skincare;
  }

  function renderCart() {
    var cart = getCart();
    itemsWrap.innerHTML = "";
    if (!cart.length) {
      itemsWrap.innerHTML = '<div class="cart-empty">Your basket is empty.<br>Discover our products above.</div>';
    } else {
      cart.forEach(function (item) {
        var row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML =
          '<div class="ph-media"><svg viewBox="0 0 24 24" stroke-width="1.3">' + iconSvg(item.icon) + "</svg></div>" +
          '<div class="cart-item-info">' +
          "<h5>" + item.name + "</h5>" +
          '<div class="cat">' + item.cat + "</div>" +
          '<div class="qty-row">' +
          '<button data-act="dec">&minus;</button><span>' + item.qty + "</span>" +
          '<button data-act="inc">+</button>' +
          '<span class="cart-item-remove" data-act="rm">Remove</span>' +
          "</div></div>" +
          '<div class="cart-item-price">$' + (item.price * item.qty).toFixed(2) + "</div>";
        row.querySelector('[data-act="inc"]').addEventListener("click", function () {
          item.qty += 1; saveCart(cart); renderCart();
        });
        row.querySelector('[data-act="dec"]').addEventListener("click", function () {
          item.qty -= 1;
          var newCart = cart.filter(function (i) { return !(i.id === item.id && item.qty <= 0); });
          saveCart(newCart); renderCart();
        });
        row.querySelector('[data-act="rm"]').addEventListener("click", function () {
          var newCart = cart.filter(function (i) { return i.id !== item.id; });
          saveCart(newCart); renderCart();
        });
        itemsWrap.appendChild(row);
      });
    }
    var total = cart.reduce(function (n, i) { return n + i.price * i.qty; }, 0);
    if (totalEl) totalEl.textContent = "$" + total.toFixed(2);
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;
  }
  renderCart();

  /* ---------- Checkout modal ---------- */
  var checkoutModal = document.querySelector(".checkout-modal");
  var checkoutClose = checkoutModal ? checkoutModal.querySelector(".modal-close") : null;
  var checkoutForm = document.querySelector("#checkoutForm");
  var fulfillRadios = document.querySelectorAll('input[name="fulfillment"]');
  var deliveryFields = document.querySelector(".delivery-fields");
  var addressInput = document.querySelector("#deliveryAddress");

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      if (getCart().length === 0) return;
      closeDrawer();
      checkoutModal.classList.add("open");
    });
  }
  if (checkoutClose) checkoutClose.addEventListener("click", function () { checkoutModal.classList.remove("open"); });
  if (checkoutModal) checkoutModal.addEventListener("click", function (e) { if (e.target === checkoutModal) checkoutModal.classList.remove("open"); });

  fulfillRadios.forEach(function (r) {
    r.addEventListener("change", function () {
      var isDelivery = r.value === "Delivery" && r.checked;
      if (r.checked) {
        deliveryFields.classList.toggle("show", r.value === "Delivery");
        addressInput.required = r.value === "Delivery";
      }
    });
  });

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var cart = getCart();
      if (!cart.length) return;

      var name = document.querySelector("#custName").value.trim();
      var phone = document.querySelector("#custPhone").value.trim();
      var fulfillment = document.querySelector('input[name="fulfillment"]:checked');
      if (!fulfillment) { window.jfToast("Please choose Pickup or Delivery"); return; }
      var address = addressInput.value.trim();
      if (fulfillment.value === "Delivery" && !address) {
        window.jfToast("Please add a delivery address");
        addressInput.focus();
        return;
      }

      var lines = [];
      lines.push("Hello Joseph Farah, I'd like to order:");
      lines.push("");
      cart.forEach(function (i) {
        lines.push("• " + i.name + "  x" + i.qty + "  ($" + (i.price * i.qty).toFixed(2) + ")");
      });
      var total = cart.reduce(function (n, i) { return n + i.price * i.qty; }, 0);
      lines.push("");
      lines.push("Total: $" + total.toFixed(2));
      lines.push("");
      lines.push("Name: " + name);
      lines.push("Phone: " + phone);
      lines.push("Fulfillment: " + fulfillment.value);
      if (fulfillment.value === "Delivery") lines.push("Delivery address: " + address);
      else lines.push("Pickup at: Zahle Boulevard, Centre Maalouf");

      var text = encodeURIComponent(lines.join("\n"));
      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;

      saveCart([]);
      renderCart();
      checkoutModal.classList.remove("open");
      window.open(url, "_blank");
    });
  }
})();
