/* Harina Clara: the shop's own settings, words and page behaviour. */
(function () {
  "use strict";
  var K = window.Kit, L = K.Lang;

  /* ---------- the shop: edit these lines for a real client ---------- */
  var OM_NUMBER = "[OM'S NUMBER]";
  var SHOP = window.SHOP = {
    id: "harina-clara",
    name: "Harina Clara",
    phone: OM_NUMBER,
    payments: true, /* false = order-only: customers pay at pickup, same screens */
    address: "28-17 30th Avenue, Astoria, NY 11102",
    /* minutes from midnight, Sunday first */
    hours: [[420, 900], [360, 1080], [360, 1080], [360, 1080], [360, 1080], [360, 1080], [360, 1080]]
  };
  /* bake times, minutes from midnight; Sunday has its own */
  var BAKES = {
    pan: { week: [390, 555, 795], sun: [450, 660] },
    pastelitos: { week: [435, 690], sun: [480] }
  };

  var SPREADS = [
    { id: "pan", name: { en: "Pan de agua", es: "Pan de agua" }, price: 1, unit: { en: "each", es: "c/u" }, img: "c-pan", bake: "pan",
      desc: { en: "A crust that crackles, a soft middle, still warm in the bag.", es: "Corteza que cruje, suavecito por dentro, calientito en la funda." } },
    { id: "pastelitos", name: { en: "Pastelitos de pollo", es: "Pastelitos de pollo" }, price: 3.5, img: "c-pastelitos", bake: "pastelitos",
      desc: { en: "Crimped by hand, fried to order, stewed chicken inside.", es: "Cerrados a mano, fritos al momento, con pollo guisado adentro." } },
    { id: "mangu", name: { en: "Mangú con los tres golpes", es: "Mangú con los tres golpes" }, price: 13, img: "c-mangu", morning: true,
      desc: { en: "Mashed green plantain, pickled red onion, fried salami, fried cheese and an egg. Until 11.", es: "Mangú con cebollita, salami frito, queso frito y su huevo. Hasta las 11." } },
    { id: "cortadito", name: { en: "Cortadito", es: "Cortadito" }, price: 3.25, img: "c-cortadito",
      desc: { en: "Espresso cut with steamed milk, sugar the way you take it.", es: "Expreso cortado con leche, con el azúcar como te gusta." } },
    { id: "guayaba", name: { en: "Pastelito de guayaba", es: "Pastelito de guayaba" }, price: 2.75, img: "c-guayaba",
      desc: { en: "Flaky layers, guava paste, a dusting of sugar.", es: "Hojaldre, pasta de guayaba y su azuquita por encima." } },
    { id: "morir", name: { en: "Morir soñando", es: "Morir soñando" }, price: 5.5, img: "c-morir",
      desc: { en: "Orange juice and cold milk over ice. Ask anyone.", es: "Jugo de naranja con leche bien fría. Pregúntale a cualquiera." } }
  ];
  var LIST = [
    { id: "cafecito", name: { en: "Cafecito", es: "Cafecito" }, price: 2, sub: { en: "Black, strong, sweet", es: "Negrito, fuerte y dulce" } },
    { id: "cafeleche", name: { en: "Café con leche", es: "Café con leche" }, price: 3 },
    { id: "chocolate", name: { en: "Chocolate caliente", es: "Chocolate caliente" }, price: 3.5, sub: { en: "With cinnamon and clove", es: "Con canela y clavo" } },
    { id: "avena", name: { en: "Avena caliente", es: "Avena caliente" }, price: 3.5, sub: { en: "Hot oats with milk and cinnamon", es: "Con leche y canela" } },
    { id: "empanada", name: { en: "Empanada de queso", es: "Empanada de queso" }, price: 3 },
    { id: "quipe", name: { en: "Quipe", es: "Quipe" }, price: 2.5, sub: { en: "Bulgur and beef, fried", es: "De res, frito" } },
    { id: "bizcocho", name: { en: "Bizcocho dominicano", es: "Bizcocho dominicano" }, price: 5, sub: { en: "A slice, pineapple filling, meringue", es: "La porción, relleno de piña, suspiro" } },
    { id: "chinola", name: { en: "Jugo de chinola", es: "Jugo de chinola" }, price: 4.5, sub: { en: "Passion fruit", es: "Natural" } }
  ];

  var DICT = {
    en: {
      kicker: "Dominican bakery and café, Astoria", menuTitle: "On the counter", menuSub: "Tap + to add it to your order. Pick it up warm.",
      counterTitle: "And the rest of the case", roomTitle: "Stay a while.", visitTitle: "Come by.",
      directions: "Directions", call: "Call", google: "Find us on Google", today: "today",
      capCounter: "The counter", capCase: "The case", capHands: "Hands in the dough", capCorner: "The corner table",
      add: "Add", orderPickup: "Order for pickup", review: "Review order", items: "{n} items", item: "1 item",
      gm: "Good morning.", ga: "Good afternoon.", ge: "Good evening.", phoneLabel: "Phone", scrubLabel: "See the room at", now: "Now", altCounter: "The mahogany counter with a frosted bizcocho and the brass register", altCase: "The glass case full of pastelitos and guava pastries", altHands: "Hands kneading dough on a floured table", altCorner: "The corner table by the window with a cafecito and a pastelito", stripAria: "Photos of the bakery", hoursAria: "Hours", foot: "Harina Clara, Dominican bakery and café. 28-17 30th Avenue, Astoria, NY 11102."
    },
    es: {
      kicker: "Panadería y café dominicano, Astoria", menuTitle: "En el mostrador", menuSub: "Toca + para añadirlo a tu pedido. Lo recoges calientito.",
      counterTitle: "Y lo demás de la vitrina", roomTitle: "Quédate un rato.", visitTitle: "Pasa por aquí.",
      directions: "Cómo llegar", call: "Llamar", google: "Búscanos en Google", today: "hoy",
      capCounter: "El mostrador", capCase: "La vitrina", capHands: "Manos en la masa", capCorner: "La mesita de la esquina",
      add: "Añadir", orderPickup: "Pide para recoger", review: "Ver pedido", items: "{n} cosas", item: "1 cosa",
      gm: "Buenos días.", ga: "Buenas tardes.", ge: "Buenas noches.", phoneLabel: "Teléfono", scrubLabel: "Mira el local a las", now: "Ahora", altCounter: "El mostrador de caoba con un bizcocho y la caja registradora", altCase: "La vitrina llena de pastelitos y pastelitos de guayaba", altHands: "Manos amasando en una mesa con harina", altCorner: "La mesita de la esquina con un cafecito y un pastelito", stripAria: "Fotos de la panadería", hoursAria: "Horario", foot: "Harina Clara, panadería y café dominicano. 28-17 30th Avenue, Astoria, NY 11102."
    }
  };

  var ORDER = {
    title: { en: "Order for pickup", es: "Pide para recoger" },
    steps: [{ id: "bag", type: "bag" }, { id: "pickup", type: "pickup" }, { id: "tip", type: "tip" }, { id: "sum", type: "summary" }, { id: "pay", type: "pay" }, { id: "done", type: "done" }],
    lead: 15, step: 15, tips: [0, 0.1, 0.15, 0.2], stripeTheme: "stripe"
  };

  /* ---------- light by the hour ---------- */
  function lightFor(d) { var h = d.getHours(); return h >= 5 && h < 12 ? "morning" : h >= 12 && h < 18 ? "afternoon" : "lamps"; }

  /* ---------- bake line ---------- */
  function bakeLine(key, d, rich) {
    var b = BAKES[key]; if (!b) return "";
    var list = d.getDay() === 0 ? b.sun : b.week, m = d.getHours() * 60 + d.getMinutes(), es = L.cur === "es";
    var t = function (mins) { var x = K.atMinutes(d, mins); return es ? K.esHour(x).replace(/ de la (mañana|tarde|noche)$/, "") : K.time(x, "en"); };
    var em = function (s) { return rich ? "<b>" + s + "</b>" : s; };
    var last = null, next = null;
    list.forEach(function (x) { if (x <= m) last = x; else if (next == null) next = x; });
    var open = K.status(SHOP.hours, d).open;
    if (last != null && m - last <= 75 && open) return es ? "Salió del horno a " + em(t(last)) + ". Todavía calientito." : "Out of the oven at " + em(t(last)) + ". Still warm.";
    if (next != null && open) return es ? "La próxima tanda sale a " + em(t(next)) + "." : "Next batch out of the oven at " + em(t(next)) + ".";
    if (last == null && next != null) return es ? "La primera tanda sale a " + em(t(next)) + "." : "First batch out of the oven at " + em(t(next)) + ".";
    var tomorrow = K.addDays(d, 1), tl = tomorrow.getDay() === 0 ? b.sun : b.week;
    return es ? "Vuelve al horno mañana a " + em(t(tl[0])) + "." : "Back in the oven tomorrow at " + em(t(tl[0])) + ".";
  }

  /* the big sentence under the greeting */
  function hourLine(d, open) {
    var b = BAKES.pan, list = d.getDay() === 0 ? b.sun : b.week, m = d.getHours() * 60 + d.getMinutes(), es = L.cur === "es";
    var t = function (mins) { var x = K.atMinutes(d, mins); return "<b>" + (es ? K.esHour(x).replace(/ de la (mañana|tarde|noche)$/, "") : K.time(x, "en")) + "</b>"; };
    var last = null, next = null;
    list.forEach(function (x) { if (x <= m) last = x; else if (next == null) next = x; });
    if (open && last != null && m - last <= 75) return es ? "El pan de agua salió del horno a " + t(last) + ". Todavía está calientito." : "The pan de agua came out of the oven at " + t(last) + ". It's still warm.";
    if (open && next != null) return es ? "La próxima tanda de pan de agua sale a " + t(next) + "." : "The next tray of pan de agua comes out at " + t(next) + ".";
    if (open && last != null && next == null) return es ? "La última tanda de hoy salió a " + t(last) + ". Mañana el primer pan sale a " + t((K.addDays(d, 1).getDay() === 0 ? b.sun : b.week)[0]) + "." : "Today's last tray came out at " + t(last) + ". Tomorrow the first comes out at " + t((K.addDays(d, 1).getDay() === 0 ? b.sun : b.week)[0]) + ".";
    if (next != null && last == null) return es ? "Ya se están prendiendo los hornos. El primer pan sale a " + t(next) + "." : "The ovens are warming up. The first pan de agua comes out at " + t(next) + ".";
    var tl = K.addDays(d, 1).getDay() === 0 ? b.sun : b.week;
    return es ? "Los hornos están descansando. Mañana el primer pan sale a " + t(tl[0]) + "." : "The ovens are resting. Tomorrow the first pan de agua comes out at " + t(tl[0]) + ".";
  }

  /* ---------- render ---------- */
  var plus = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5v14" stroke="currentColor" stroke-width="2" fill="none"/></svg>';
  function pic(name, sizes, alt, w, h) {
    return '<picture><source type="image/avif" srcset="img/' + name + '-480.avif 480w, img/' + name + '-828.avif 828w, img/' + name + '-' + w + '.avif ' + w + 'w" sizes="' + sizes + '">' +
      '<img src="img/' + name + '-828.webp" srcset="img/' + name + '-480.webp 480w, img/' + name + '-828.webp 828w, img/' + name + '-' + w + '.webp ' + w + 'w" sizes="' + sizes + '" width="' + w + '" height="' + h + '" alt="' + alt + '" loading="lazy" decoding="async"></picture>';
  }
  function renderSpreads() {
    var host = document.getElementById("spreads");
    host.innerHTML = SPREADS.map(function (it) {
      return '<article class="spread" id="item-' + it.id + '">' + pic(it.img, "(min-width: 900px) 50vw, 100vw", "", 944, 1680) +
        '<div class="spread-text"><p class="spread-bake" data-bake="' + (it.bake || "") + '"></p>' +
        '<h3>' + L.pick(it.name) + '</h3><p class="spread-desc">' + L.pick(it.desc) + '</p>' +
        '<div class="buy"><span class="price">' + K.money(it.price) + (it.unit ? "<small>" + L.pick(it.unit) + "</small>" : "") + '</span>' +
        '<button type="button" class="add" data-add="' + it.id + '">' + plus + '<span>' + L.t("add") + '</span><span class="n"></span></button></div></div></article>';
    }).join("");
    var list = document.getElementById("list");
    list.innerHTML = LIST.map(function (it) {
      return '<li class="rv"><span class="nm">' + L.pick(it.name) + (it.sub ? "<small>" + L.pick(it.sub) + "</small>" : "") + '</span><span class="lead" aria-hidden="true"></span><span class="pr">' + K.money(it.price) + '</span>' +
        '<button type="button" class="mini" data-add="' + it.id + '" aria-label="' + L.t("add") + " " + L.pick(it.name) + '">' + plus + '</button></li>';
    }).join("");
    observeSpreads();
    syncCart();
    K.reveal();
  }
  var spreadIO = null;
  function observeSpreads() {
    if (spreadIO) spreadIO.disconnect();
    var els = document.querySelectorAll(".spread");
    if (K.reduce || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    spreadIO = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) e.target.classList.add("in"); }); }, { threshold: 0.2 });
    els.forEach(function (e) { spreadIO.observe(e); });
  }

  function renderLive() {
    var d = K.now(), st = K.status(SHOP.hours, d), line = K.openLine(SHOP.hours, d);
    ["heroLive", "visitLive"].forEach(function (id) {
      var el = document.getElementById(id); el.classList.toggle("closed", !st.open); el.lastElementChild.textContent = line;
    });
    document.getElementById("clock").textContent = K.time(d) + ", " + K.dayName(d);
    document.querySelectorAll("[data-scrub]").forEach(function (b) {
      if (b.dataset.scrub === "now") return;
      var hm = b.dataset.scrub.split(":"), x = new Date(2026, 0, 4, +hm[0], +hm[1]); x.setMinutes(0);
      b.textContent = K.time(x);
    });
    var light = lightFor(d);
    if (document.documentElement.dataset.light !== light) { document.documentElement.dataset.light = light; startFrames(); }
    document.getElementById("greet").textContent = L.t(light === "morning" ? "gm" : light === "afternoon" ? "ga" : "ge");
    document.getElementById("bake").innerHTML = hourLine(d, st.open);
    document.querySelectorAll("[data-bake]").forEach(function (el) { el.textContent = el.dataset.bake ? bakeLine(el.dataset.bake, d) : ""; });
    var meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue("--ground").trim();
    var hrs = document.getElementById("hours");
    hrs.innerHTML = K.hoursRows(SHOP.hours).map(function (r) {
      return '<li' + (r.today ? ' class="today" aria-current="date"' : "") + '><span data-today="' + L.t("today") + '">' + r.label + "</span><span>" + r.text + "</span></li>";
    }).join("");
  }

  /* ---------- hero frames ---------- */
  var timer = null;
  var ORDERS = { morning: ["steam", "flour", "window"], afternoon: ["window", "flour", "steam-a"], lamps: ["night"] };
  function startFrames() {
    clearInterval(timer);
    var light = document.documentElement.dataset.light, keys = ORDERS[light], frames = keys.map(function (k) { return document.querySelector('.frame[data-key="' + k + '"]'); });
    document.querySelectorAll(".frame").forEach(function (f) { if (f !== frames[0]) f.classList.remove("live", "first"); });
    var i = 0;
    frames[0].classList.add("live");
    if (K.reduce || frames.length < 2) return;
    timer = setInterval(function () {
      var prev = frames[i]; i = (i + 1) % frames.length;
      var nx = frames[i], img = nx.querySelector("img");
      img.style.animation = "none"; void img.offsetWidth; img.style.animation = "";
      nx.classList.add("live");
      setTimeout(function () { prev.classList.remove("live"); }, 2400);
    }, 7000);
  }

  /* ---------- cart + bar ---------- */
  var C;
  function syncCart() {
    document.querySelectorAll("[data-add]").forEach(function (b) {
      var q = C.qty(b.dataset.add), n = b.querySelector(".n");
      b.classList.toggle("has", q > 0);
      if (b.classList.contains("mini")) b.innerHTML = q ? '<span class="n">' + q + "</span>" : plus;
      else if (n) n.textContent = q || "";
    });
    var c = C.count();
    document.getElementById("barLabel").textContent = c ? L.t("review") : L.t("orderPickup");
    document.getElementById("barSum").textContent = c ? (c === 1 ? L.t("item") : L.t("items", { n: c })) + ", " + K.money(C.subtotal()) : "";
    updateBar();
  }
  var pastHero = false;
  function updateBar() {
    var bar = document.getElementById("bar"), up = pastHero || C.count() > 0;
    bar.classList.toggle("up", up);
    document.body.style.paddingBottom = up ? "calc(env(safe-area-inset-bottom, 0px) + 80px)" : "";
  }

  function wire() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest("[data-add]");
      if (a) { C.add(a.dataset.add, 1); a.animate && !K.reduce && a.animate([{ transform: "scale(.94)" }, { transform: "scale(1)" }], { duration: 380, easing: "cubic-bezier(.2,.7,.2,1)" }); return; }
      if (e.target.closest("[data-lang-btn]")) { L.toggle(); return; }
      var at = e.target.closest("[data-scrub]");
      if (at) {
        document.querySelectorAll("[data-scrub]").forEach(function (x) { x.setAttribute("aria-pressed", x === at ? "true" : "false"); });
        if (at.dataset.scrub === "now") K.setPreview(null);
        else { var hm = at.dataset.scrub.split(":"), d = new Date(Date.now()); d.setHours(+hm[0], +hm[1], 0, 0); K.setPreview(d); }
        renderLive();
        return;
      }
    });
    document.getElementById("barBtn").addEventListener("click", function () {
      if (C.count()) Engine.order(ORDER);
      else document.getElementById("menu").scrollIntoView({ behavior: K.reduce ? "auto" : "smooth" });
    });
    var top = document.getElementById("top"), hero = document.getElementById("room");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { pastHero = !e.isIntersecting; top.classList.toggle("solid", pastHero); updateBar(); });
    }, { rootMargin: "-64px 0px 0px 0px" });
    io.observe(hero);
    document.getElementById("mapBtn").href = K.mapsUrl(SHOP.name, SHOP.address);
    document.getElementById("callBtn").href = K.telUrl(SHOP.phone);
    document.getElementById("googleLink").href = K.googleSearchUrl(SHOP.name + " " + SHOP.address);
  }

  function boot() {
    Engine.init(SHOP, SPREADS.concat(LIST));
    C = Engine.cart;
    C.on(syncCart);
    L.init(SHOP.id, DICT, (navigator.language || "").toLowerCase().indexOf("es") === 0 ? "es" : "en");
    L.on(function () { renderSpreads(); renderLive(); document.getElementById("phoneText").textContent = L.t("phoneLabel") + ": " + SHOP.phone; });
    renderSpreads(); renderLive();
    document.getElementById("phoneText").textContent = L.t("phoneLabel") + ": " + SHOP.phone;
    startFrames();
    wire();
    setInterval(renderLive, 30000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  /* film grain starts once the page has painted and settled */
  window.addEventListener("load", function () { setTimeout(function () { document.documentElement.classList.add("settled"); }, 900); });
})();
