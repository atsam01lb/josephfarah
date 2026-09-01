/* =========================================================
   JOSEPH FARAH - booking.js  (Booking page only)
   Custom calendar (Sunday-aware), dynamic time slots,
   validation, WhatsApp submission + thank-you popup.
   ========================================================= */
(function () {
  "use strict";
  var form = document.querySelector("#bookingForm");
  if (!form) return;

  var WHATSAPP_NUMBER = "9613293637";
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var DOW = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  var FULL_DOW = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  var calInput = document.querySelector("#dateDisplay");
  var calHidden = document.querySelector("#dateValue");
  var calendar = document.querySelector("#calendar");
  var calHead = document.querySelector("#calHead");
  var calDays = document.querySelector("#calDays");
  var prevBtn = document.querySelector("#calPrev");
  var nextBtn = document.querySelector("#calNext");

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth();
  var selectedDate = null;

  function renderCalendar() {
    calHead.textContent = MONTHS[viewMonth] + " " + viewYear;
    calDays.innerHTML = "";
    var firstDay = new Date(viewYear, viewMonth, 1).getDay();
    var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (var i = 0; i < firstDay; i++) {
      var empty = document.createElement("div");
      empty.className = "cal-day empty";
      calDays.appendChild(empty);
    }
    for (var d = 1; d <= daysInMonth; d++) {
      var cell = document.createElement("div");
      var thisDate = new Date(viewYear, viewMonth, d);
      var isPast = thisDate < today;
      var isSunday = thisDate.getDay() === 0;
      cell.className = "cal-day" + (isPast ? " disabled" : "") + (isSunday ? " sunday" : "");
      cell.textContent = d;
      if (selectedDate && thisDate.getTime() === selectedDate.getTime()) cell.classList.add("selected");
      if (!isPast) {
        cell.addEventListener("click", function () {
          var y = viewYear, m = viewMonth, day = parseInt(this.textContent, 10);
          selectedDate = new Date(y, m, day);
          onDateSelected(selectedDate);
          renderCalendar();
          calendar.classList.remove("open");
        });
      }
      calDays.appendChild(cell);
    }
  }

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function onDateSelected(dateObj) {
    var label = FULL_DOW[dateObj.getDay()] + ", " + MONTHS[dateObj.getMonth()] + " " + dateObj.getDate() + ", " + dateObj.getFullYear();
    calInput.value = label;
    calHidden.value = dateObj.getFullYear() + "-" + pad(dateObj.getMonth() + 1) + "-" + pad(dateObj.getDate());
    updateTimeSlots(dateObj.getDay() === 0);
    clearFieldError("date");
  }

  function updateTimeSlots(isSunday) {
    var allSlots = document.querySelectorAll(".time-slot");
    var sundayNote = document.querySelector("#sundayNote");
    allSlots.forEach(function (slot) {
      var sundayOnly = slot.hasAttribute("data-sunday");
      var hideForSunday = isSunday && !sundayOnly;
      slot.style.display = hideForSunday ? "none" : "";
      if (hideForSunday) {
        var input = slot.querySelector("input");
        if (input.checked) { input.checked = false; slot.classList.remove("checked"); }
      }
    });
    if (sundayNote) sundayNote.style.display = isSunday ? "block" : "none";
  }

  if (calInput) {
    calInput.addEventListener("click", function () { calendar.classList.toggle("open"); });
    document.addEventListener("click", function (e) {
      if (!calendar.contains(e.target) && e.target !== calInput) calendar.classList.remove("open");
    });
  }
  if (prevBtn) prevBtn.addEventListener("click", function () {
    viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  if (nextBtn) nextBtn.addEventListener("click", function () {
    viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });
  renderCalendar();

  /* ---------- Validation helpers ---------- */
  function setFieldError(key, msg) {
    var el = document.querySelector('[data-error="' + key + '"]');
    if (el) el.textContent = msg;
  }
  function clearFieldError(key) { setFieldError(key, ""); }

  /* ---------- Submit ---------- */
  var successModal = document.querySelector("#bookingSuccess");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = true;

    var name = document.querySelector("#clientName").value.trim();
    if (!name) { setFieldError("name", "Please enter your name."); valid = false; } else clearFieldError("name");

    var phone = document.querySelector("#clientPhone").value.trim();
    if (!phone) { setFieldError("phone", "Please enter your phone number."); valid = false; } else clearFieldError("phone");

    var clientType = document.querySelector('input[name="clientType"]:checked');
    if (!clientType) { setFieldError("type", "Please select one option."); valid = false; } else clearFieldError("type");

    var services = document.querySelectorAll('input[name="services"]:checked');
    if (!services.length) { setFieldError("services", "Please select at least one service."); valid = false; } else clearFieldError("services");

    if (!calHidden.value) { setFieldError("date", "Please choose a date."); valid = false; } else clearFieldError("date");

    var visibleTimeChecked = document.querySelector('input[name="preferredTime"]:checked');
    if (!visibleTimeChecked) { setFieldError("time", "Please choose a preferred time."); valid = false; } else clearFieldError("time");

    if (!valid) return;

    var serviceNames = Array.prototype.map.call(services, function (s) { return s.value; }).join(", ");
    var lines = [
      "New booking request - Joseph Farah",
      "",
      "Client name: " + name,
      "Phone: " + phone,
      "Client type: " + clientType.value,
      "Services: " + serviceNames,
      "Date: " + calInput.value,
      "Preferred time: " + visibleTimeChecked.value,
    ];
    var text = encodeURIComponent(lines.join("\n"));
    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;
    window.open(url, "_blank");

    if (successModal) {
      successModal.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    form.reset();
    document.querySelectorAll(".choice, .time-slot").forEach(function (c) { c.classList.remove("checked"); });
    calInput.value = "";
    calHidden.value = "";
    selectedDate = null;
    renderCalendar();
    updateTimeSlots(false);
  });

  var successClose = document.querySelector("#bookingSuccessClose");
  if (successClose) {
    successClose.addEventListener("click", function () {
      successModal.classList.remove("open");
      document.body.style.overflow = "";
    });
  }
  if (successModal) {
    successModal.addEventListener("click", function (e) {
      if (e.target === successModal) {
        successModal.classList.remove("open");
        document.body.style.overflow = "";
      }
    });
  }
})();
