ADAVY — návrh webu (5 stránok)
================================

ŠTRUKTÚRA
  /index.html ................... rozcestník (domov)
  /chata-liptovsky-jan/ ......... Chata Adavy
  /apartmany-ilanovo/ ........... Apartmány Adavy
  /okolie/ ...................... okolie a výlety
  /kontakt/ ..................... formulár + adresy
  /style.css .................... spoločné štýly
  /rezervacia.js ................ rezervačný widget
  /menu.js ...................... mobilné menu (hamburger)

NASADENIE (Cloudflare Pages)
  1. Rozbaľ ZIP
  2. Cloudflare → Workers & Pages → Create → Pages → Upload assets
  3. Nahraj CELÝ priečinok (nie jednotlivé súbory)
  4. Custom domains → adavy.qvinz.sk
  Odkazy sú relatívne, takže web funguje z koreňa domény,
  z podpriečinka (GitHub Pages) aj po dvojkliku z disku.

PRED ODOSLANÍM MAJITEĽOVI
  [x] Kontakt v pracovnej lište doplnený
      0917 508 549 · adam.vitalis2016@gmail.com

PRED SPUSTENÍM OSTREJ VERZIE
  [ ] Zmaž <div class="draftbar"> zo všetkých 5 stránok
  [ ] Odstráň <meta name="robots" content="noindex,nofollow">
  [ ] Doplň fotografie namiesto blokov .ph
  [ ] Nahraď ukážkové ceny skutočnými
  [ ] Napoj rezervacia.js na REZERVA API (premenná BUSY)
  [ ] Napoj formulár na odosielanie (action + backend)
  [ ] Doplň mapu (Google Maps embed)

REZERVAČNÝ WIDGET
  Vloží sa cez <div id="booker" data-units="chata"></div>
  Hodnoty: "chata" alebo "apartmany"
  Ceny a jednotky sa nastavujú v CATALOG na začiatku rezervacia.js
  Obsadenosť je v premennej BUSY — nahradiť volaním na REZERVA
