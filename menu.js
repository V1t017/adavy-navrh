/* ==========================================================
   ADAVY — doplnok k mobilnému menu
   Menu funguje aj BEZ tohto súboru (je postavené na CSS).
   Toto pridáva len drobnosti: zatvorenie po kliknutí na odkaz,
   klikom mimo menu a klávesou Esc.
   ========================================================== */
(function () {
  "use strict";

  var chk = document.getElementById("navtoggle");
  var list = document.getElementById("navLinks");
  if (!chk || !list) { return; }

  function close() { chk.checked = false; }

  /* klik na odkaz v menu ho zavrie (dôležité pri kotvách na tej istej stránke) */
  Array.prototype.forEach.call(list.querySelectorAll("a"), function (a) {
    a.addEventListener("click", close);
  });

  /* klik mimo menu ho zavrie */
  document.addEventListener("click", function (e) {
    if (!chk.checked) { return; }
    if (list.contains(e.target)) { return; }
    if (e.target.closest && e.target.closest(".nav-toggle")) { return; }
    close();
  });

  /* Esc zavrie */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.keyCode === 27) { close(); }
  });

  /* po zväčšení okna nad breakpoint upratať stav */
  window.addEventListener("resize", function () {
    if (window.innerWidth > 980) { close(); }
  });
})();
