/* ==========================================================
   ADAVY — rezervačný widget
   Použitie: na stránke stačí <div id="booker" data-units="chata">
   Povolené hodnoty data-units: "chata" | "apartmany"
   V ostrej verzii sa BUSY nahradí volaním na REZERVA API
   (iCal feed z Booking.com a Airbnb → JSON obsadených dní).
   ========================================================== */
(function () {
  "use strict";

  var host = document.getElementById("booker");
  if (!host) { return; }

  var MES = ["Január","Február","Marec","Apríl","Máj","Jún","Júl","August",
             "September","Október","November","December"];
  var TAX = 1.50;            // daň z ubytovania, € / osoba / noc
  var CLEAN_CHATA = 25;      // záverečné upratovanie
  var CLEAN_AP = 20;

  /* --- katalóg jednotiek --- */
  var CATALOG = {
    chata: [
      { id:"chata", nazov:"Chata Adavy", popis:"Liptovský Ján · 5 os.",
        cena:95, max:5, upratovanie:CLEAN_CHATA }
    ],
    apartmany: [
      { id:"ap1",  nazov:"Apartmán 1–2", popis:"Iľanovo · 4 os.",
        cena:60, max:4, upratovanie:CLEAN_AP },
      { id:"ap3",  nazov:"Apartmán 3–4", popis:"Iľanovo · 4 os.",
        cena:60, max:4, upratovanie:CLEAN_AP },
      { id:"cely", nazov:"Celý objekt",  popis:"4 apartmány · 16 os.",
        cena:210, max:16, upratovanie:60 }
    ]
  };

  /* --- ukážková obsadenosť --- */
  var BUSY = {
    chata:["2026-09-04","2026-09-05","2026-09-06","2026-09-18","2026-09-19","2026-09-20",
           "2026-09-26","2026-09-27","2026-10-02","2026-10-03","2026-10-04","2026-10-30","2026-10-31"],
    ap1:  ["2026-09-11","2026-09-12","2026-09-13","2026-09-25","2026-09-26","2026-09-27",
           "2026-10-09","2026-10-10","2026-10-11"],
    ap3:  ["2026-09-05","2026-09-06","2026-09-19","2026-09-20","2026-09-21","2026-09-22",
           "2026-10-16","2026-10-17","2026-10-18","2026-10-23","2026-10-24"],
    cely: ["2026-09-05","2026-09-06","2026-09-11","2026-09-12","2026-09-13","2026-09-19",
           "2026-09-20","2026-09-21","2026-09-22","2026-09-25","2026-09-26","2026-09-27",
           "2026-10-09","2026-10-10","2026-10-11","2026-10-16","2026-10-17","2026-10-18",
           "2026-10-23","2026-10-24"]
  };

  var units = CATALOG[host.getAttribute("data-units")] || CATALOG.chata;
  var unit = units[0];
  var guests = 2;
  var view = new Date(2026, 8, 1);
  var inD = null, outD = null;

  /* ---------- vykreslenie kostry ---------- */
  var tlacidla = "";
  if (units.length > 1) {
    var i;
    for (i = 0; i < units.length; i++) {
      tlacidla += '<button type="button" class="' + (i === 0 ? "sel" : "") + '" data-i="' + i + '">' +
                  units[i].nazov + '<span>' + units[i].popis + '</span></button>';
    }
    tlacidla = '<div class="unit-pick" id="units">' + tlacidla + '</div>';
  }

  host.className = "booker";
  host.innerHTML =
    '<div class="cal-side">' + tlacidla +
      '<div class="cal-nav">' +
        '<button type="button" id="cprev" aria-label="Predchádzajúci mesiac">&lsaquo;</button>' +
        '<strong id="mlabel"></strong>' +
        '<button type="button" id="cnext" aria-label="Nasledujúci mesiac">&rsaquo;</button>' +
      '</div>' +
      '<div class="dow"><div>Po</div><div>Ut</div><div>St</div><div>Št</div><div>Pi</div><div>So</div><div>Ne</div></div>' +
      '<div class="cal-grid" id="cgrid"></div>' +
      '<div class="legend">' +
        '<span><i style="background:rgba(233,237,236,.12)"></i>Obsadené</span>' +
        '<span><i style="background:var(--drevo)"></i>Váš pobyt</span>' +
        '<span><i style="border:1px solid rgba(233,237,236,.3)"></i>Voľné</span>' +
      '</div>' +
    '</div>' +
    '<div class="sum-side">' +
      '<h4>Váš pobyt</h4>' +
      '<div class="row"><span>Objekt</span><span id="s-unit"></span></div>' +
      '<div class="row"><span>Príchod</span><span id="s-in">—</span></div>' +
      '<div class="row"><span>Odchod</span><span id="s-out">—</span></div>' +
      '<div class="row"><span>Nocí</span><span id="s-n">—</span></div>' +
      '<div class="guests"><span>Hostia</span><div class="stepper">' +
        '<button type="button" id="gm" aria-label="Menej hostí">&minus;</button>' +
        '<b id="g">2</b>' +
        '<button type="button" id="gp" aria-label="Viac hostí">+</button>' +
      '</div></div>' +
      '<div class="row"><span>Ubytovanie</span><span id="s-base">—</span></div>' +
      '<div class="row"><span>Upratovanie</span><span id="s-clean">—</span></div>' +
      '<div class="row"><span>Daň z ubytovania</span><span id="s-tax">—</span></div>' +
      '<div class="row tot"><span>Spolu</span><span id="s-tot">—</span></div>' +
      '<a href="/kontakt/" class="btn btn-primary" id="cta">Vyberte termín</a>' +
      '<div class="hint">Nezáväzná rezervácia · potvrdenie do 12 hodín<br>Platba prevodom, záloha 30 %</div>' +
    '</div>';

  var $ = function (id) { return document.getElementById(id); };

  function key(d) {
    var m = String(d.getMonth() + 1); if (m.length < 2) { m = "0" + m; }
    var day = String(d.getDate());    if (day.length < 2) { day = "0" + day; }
    return d.getFullYear() + "-" + m + "-" + day;
  }
  function fmt(d) { return d.getDate() + ". " + (d.getMonth() + 1) + ". " + d.getFullYear(); }
  function busy(d) { return (BUSY[unit.id] || []).indexOf(key(d)) > -1; }
  function nights() { return (inD && outD) ? Math.round((outD - inD) / 86400000) : 0; }

  function draw() {
    $("mlabel").textContent = MES[view.getMonth()] + " " + view.getFullYear();
    var g = $("cgrid");
    g.innerHTML = "";
    var offset = (new Date(view.getFullYear(), view.getMonth(), 1).getDay() + 6) % 7;
    var total = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    var i, el, d;
    for (i = 0; i < offset; i++) {
      el = document.createElement("div"); el.className = "day pad"; g.appendChild(el);
    }
    for (i = 1; i <= total; i++) {
      d = new Date(view.getFullYear(), view.getMonth(), i);
      el = document.createElement("div");
      el.textContent = i;
      if (busy(d)) {
        el.className = "day busy";
        el.setAttribute("aria-disabled", "true");
      } else {
        el.className = "day free";
        if (inD && d.getTime() === inD.getTime()) { el.className += " sel-edge"; }
        else if (outD && d.getTime() === outD.getTime()) { el.className += " sel-edge"; }
        else if (inD && outD && d > inD && d < outD) { el.className += " in-range"; }
        (function (dd) { el.addEventListener("click", function () { pick(dd); }); })(d);
      }
      g.appendChild(el);
    }
  }

  function pick(d) {
    if (!inD || outD) { inD = d; outD = null; }
    else if (d <= inD) { inD = d; }
    else {
      var c = new Date(inD.getTime()), ok = true;
      while (c < d) { if (busy(c)) { ok = false; break; } c = new Date(c.getTime() + 86400000); }
      if (ok) { outD = d; } else { inD = d; outD = null; }
    }
    draw(); sum();
  }

  function sum() {
    var n = nights();
    $("s-unit").textContent = unit.nazov;
    $("s-in").textContent  = inD  ? fmt(inD)  : "—";
    $("s-out").textContent = outD ? fmt(outD) : "—";
    $("s-n").textContent   = n ? n : "—";
    if (n > 0) {
      var base = n * unit.cena;
      var tax  = n * guests * TAX;
      $("s-base").textContent  = base.toFixed(0) + " €";
      $("s-clean").textContent = unit.upratovanie.toFixed(0) + " €";
      $("s-tax").textContent   = tax.toFixed(2) + " €";
      $("s-tot").textContent   = (base + unit.upratovanie + tax).toFixed(2) + " €";
      $("cta").textContent     = "Odoslať nezáväznú rezerváciu";
    } else {
      $("s-base").textContent = "—";
      $("s-clean").textContent = "—";
      $("s-tax").textContent  = "—";
      $("s-tot").textContent  = "—";
      $("cta").textContent    = "Vyberte termín";
    }
  }

  $("cprev").addEventListener("click", function () {
    view = new Date(view.getFullYear(), view.getMonth() - 1, 1); draw();
  });
  $("cnext").addEventListener("click", function () {
    view = new Date(view.getFullYear(), view.getMonth() + 1, 1); draw();
  });
  $("gp").addEventListener("click", function () {
    if (guests < unit.max) { guests++; $("g").textContent = guests; sum(); }
  });
  $("gm").addEventListener("click", function () {
    if (guests > 1) { guests--; $("g").textContent = guests; sum(); }
  });

  if (units.length > 1) {
    var btns = host.querySelectorAll("#units button");
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(btns, function (x) { x.className = ""; });
        b.className = "sel";
        unit = units[parseInt(b.getAttribute("data-i"), 10)];
        if (guests > unit.max) { guests = unit.max; $("g").textContent = guests; }
        inD = null; outD = null;
        draw(); sum();
      });
    });
  }

  draw(); sum();
})();
