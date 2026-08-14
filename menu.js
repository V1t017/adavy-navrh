/* ==========================================================
   ADAVY — mobilné menu
   Ovláda hamburger v hlavičke. Na desktope je tlačidlo skryté
   cez CSS a zoznam odkazov sa zobrazuje normálne.
   ========================================================== */
(function () {
  "use strict";

  var btn = document.getElementById("navToggle");
  var list = document.getElementById("navLinks");
  if (!btn || !list) { return; }

  function close() {
    list.classList.remove("open");
    btn.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Otvoriť menu");
  }

  function open() {
    list.classList.add("open");
    btn.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "Zavrieť menu");
  }

  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (list.classList.contains("open")) { close(); } else { open(); }
  });

  /* klik na odkaz menu zavrie */
  Array.prototype.forEach.call(list.querySelectorAll("a"), function (a) {
    a.addEventListener("click", close);
  });

  /* klik mimo menu zavrie */
  document.addEventListener("click", function (e) {
    if (!list.classList.contains("open")) { return; }
    if (!list.contains(e.target) && e.target !== btn) { close(); }
  });

  /* Esc zavrie a vráti fokus na tlačidlo */
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Escape" || e.keyCode === 27) && list.classList.contains("open")) {
      close();
      btn.focus();
    }
  });

  /* po zväčšení okna nad breakpoint upratať stav */
  window.addEventListener("resize", function () {
    if (window.innerWidth > 980 && list.classList.contains("open")) { close(); }
  });
})();
