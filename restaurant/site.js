/* Desvelo: the shop's own settings, words and page behaviour. */
(function () {
  "use strict";
  var K = window.Kit, L = K.Lang;
  function $(s) { return document.querySelector(s); }

  /* ---------- the shop: edit these lines for a real client ---------- */
  var OM_NUMBER = "[OM'S NUMBER]";
  /* the plate of the day: change this one line */
  var PLATO_DEL_DIA = { es: "Chivo guisado con moro de guandules", en: "Stewed goat with rice and pigeon peas", price: 21 };
  var SHOP = window.SHOP = {
    id: "desvelo",
    name: "Desvelo",
    phone: OM_NUMBER,
    payments: true, /* false = no deposits and pay at pickup: same screens */
    address: "33-07 Ditmars Boulevard, Astoria, NY 11105",
    /* minutes from midnight, Sunday first; past 1440 means after midnight */
    hours: [[780, 1620], [960, 1620], [960, 1620], [960, 1620], [960, 1620], [960, 1680], [780, 1680]]
  };
  var KITCHEN = [[780, 1620], [960, 1620], [960, 1620], [960, 1620], [960, 1620], [960, 1620], [780, 1620]];
  var HAPPY = [null, [960, 1140], [960, 1140], [960, 1140], [960, 1140], [960, 1140], null];

  /* what's on, by night (0 = Sunday) */
  var NIGHTS = [
    { big: { es: "Sancocho", en: "Sancocho" }, sub: { es: "Sancocho desde la 1 de la tarde, hasta que se acabe el caldero.", en: "Sancocho from 1 PM until the pot runs out." } },
    { big: { es: "Pelota", en: "Baseball" }, sub: { es: "La pelota invernal en todas las pantallas.", en: "Dominican winter ball on every screen." } },
    { big: { es: "2 × 1", en: "2 for 1" }, sub: { es: "Martes de hookah: la segunda va a mitad de precio.", en: "Hookah Tuesday: the second one is half price." } },
    { big: { es: "Dominó", en: "Dominoes" }, sub: { es: "Mesas de dominó desde las 8. Trae tu pareja.", en: "Domino tables from 8. Bring your partner." } },
    { big: { es: "Karaoke", en: "Karaoke" }, sub: { es: "Karaoke desde las 10. Bachata, merengue y lo que te atrevas.", en: "Karaoke from 10. Bachata, merengue, whatever you dare." } },
    { big: { es: "Bachata", en: "Bachata" }, sub: { es: "Bachata desde las 10 de la noche. Mesas para grupos.", en: "Bachata from 10 PM. Tables for groups." } },
    { big: { es: "DJ", en: "DJ" }, sub: { es: "DJ toda la noche, desde las 10. La cocina sigue hasta las 3.", en: "DJ all night from 10. The kitchen keeps going until 3." } }
  ];

  var DISHES = [
    { id: "chicharron", img: "r-chicharron", name: { es: "Chicharrón", en: "Chicharrón" }, price: 22, desc: { es: "Cerdo frito con su cuerito que cruje, tostones y limón.", en: "Fried pork belly with crackling skin, tostones and lime." } },
    { id: "pollo", img: "r-pollo", name: { es: "Pollo guisado", en: "Pollo guisado" }, price: 18, desc: { es: "Guisado como en la casa, con arroz blanco y habichuelas.", en: "Stewed the way it's done at home, with white rice and beans." } },
    { id: "mofongo", img: "r-mofongo", name: { es: "Mofongo", en: "Mofongo" }, price: 19, desc: { es: "Plátano verde majado en pilón con ajo y chicharrón. Caldito al lado.", en: "Green plantain mashed in the pilón with garlic and pork crackling. Broth on the side." } },
    { id: "bandera", img: "r-bandera", name: { es: "La bandera", en: "La bandera" }, price: 17, desc: { es: "Arroz, habichuelas, carne guisada, ensalada y tostones.", en: "Rice, red beans, stewed beef, salad and tostones." } },
    { id: "sancocho", img: "r-sancocho", name: { es: "Sancocho", en: "Sancocho" }, price: 16, sundays: true, desc: { es: "Siete carnes, víveres y su aguacate. Solo los domingos.", en: "Seven meats, root vegetables, avocado on the side. Sundays only." } }
  ];
  var DRINKS = [
    { id: "presi", name: { es: "Cerveza bien fría", en: "Ice-cold beer" }, price: 7, sub: { es: "Vestida de novia", en: "Frosted bottle" } },
    { id: "ron", name: { es: "Ron dominicano, a la roca", en: "Dominican rum, on the rock" }, price: 11 },
    { id: "mama", name: { es: "Mamajuana", en: "Mamajuana" }, price: 8, sub: { es: "El trago de la casa", en: "The house shot" } },
    { id: "santo", name: { es: "Santo libre", en: "Santo libre" }, price: 11, sub: { es: "Ron, limón y soda de limón", en: "Rum, lime, lemon-lime soda" } },
    { id: "mojito", name: { es: "Mojito de chinola", en: "Passion fruit mojito" }, price: 13 },
    { id: "morir", name: { es: "Morir soñando", en: "Morir soñando" }, price: 6, sub: { es: "Sin alcohol", en: "No alcohol" } },
    { id: "jugo", name: { es: "Jugo de chinola", en: "Passion fruit juice" }, price: 6, sub: { es: "Natural", en: "Fresh" } }
  ];
  var FLAVORS = [
    { es: "Menta", en: "Mint" }, { es: "Uva con menta", en: "Grape mint" }, { es: "Sandía", en: "Watermelon" }, { es: "Chinola", en: "Passion fruit" },
    { es: "Guayaba", en: "Guava" }, { es: "Doble manzana", en: "Double apple" }, { es: "Blueberry con hielo", en: "Blueberry ice" }, { es: "La de la casa", en: "House mix", sub: { es: "Pregúntale al bartender", en: "Ask the bartender" } }
  ];

  var DICT = {
    es: {
      kicker: "Restaurante y bar dominicano, Ditmars", filmTitle: "La carta", filmSub: "Toca + y lo pides para recoger. La cocina no cierra hasta las 3.",
      drinksTitle: "Pa' tomar", hookahLead: "En el lounge del fondo, hasta que cierre el bar. Carbón natural, manguera nueva cada vez.",
      roomTitle: "El local", capTable: "La mesa de diez", capPour: "La barra", capDom: "El dominó de los miércoles", capStreet: "Ditmars, a la 1 de la mañana",
      altTable: "Una mesa para diez con bizcocho y bengalas", altPour: "Sirviendo ron en la barra", altDom: "Una partida de dominó", altStreet: "La vitrina iluminada desde la acera de Ditmars",
      owner: "Mi abuela cocinaba para treinta en Baní con un caldero y un fogón. El sancocho del domingo es el de ella, sin cambiarle nada. Lo demás lo aprendí en su cocina, mirando.",
      visitTitle: "Ven esta noche", directions: "Cómo llegar", call: "Llamar", google: "Búscanos en Google", today: "hoy", phoneLabel: "Teléfono",
      reserve: "Reservar", pickup: "Pide para recoger", yourOrder: "Tu pedido", add: "Añadir", weekAria: "Ver otra noche", stripAria: "Fotos del local",
      tonight: "Esta noche es", tonightLate: "Todavía es", plate: "Plato del día", happy: "Happy hour", happyText: "2 × 1 en cervezas y tragos de la casa",
      happyOn: "Ahora mismo, hasta las 7. Quedan {m}.", happyLater: "Hoy de 4 a 7 de la tarde.", happyDone: "Hoy fue de 4 a 7. Mañana otra vez.", happyDoneMon: "Hoy fue de 4 a 7. Vuelve el lunes.", happyNone: "De lunes a viernes, de 4 a 7.",
      hoursAria: "Horario", foot: "Desvelo, restaurante y bar. 33-07 Ditmars Boulevard, Astoria, NY 11105.", kitchen: "Cocina", hookahPrice: "<b>$35</b> la hookah", hookahRefill: "<b>$15</b> el refill", age: "Solo mayores de 21"
    },
    en: {
      kicker: "Dominican restaurant and bar, Ditmars", filmTitle: "The menu", filmSub: "Tap + to order it for pickup. The kitchen stays open until 3.",
      drinksTitle: "To drink", hookahLead: "In the back lounge until the bar closes. Natural coals, a new hose every time.",
      roomTitle: "The room", capTable: "The table for ten", capPour: "The bar", capDom: "Wednesday dominoes", capStreet: "Ditmars at 1 AM",
      altTable: "A table for ten with a cake and sparklers", altPour: "Rum being poured at the bar", altDom: "A game of dominoes", altStreet: "The lit window seen from the Ditmars sidewalk",
      owner: "My grandmother cooked for thirty in Baní with one pot and one fire. The Sunday sancocho is hers, nothing changed. The rest I learned in her kitchen, watching.",
      visitTitle: "Come tonight", directions: "Directions", call: "Call", google: "Find us on Google", today: "today", phoneLabel: "Phone",
      reserve: "Reserve", pickup: "Order pickup", yourOrder: "Your order", add: "Add", weekAria: "See another night", stripAria: "Photos of the room",
      tonight: "Tonight is", tonightLate: "It's still", plate: "Plate of the day", happy: "Happy hour", happyText: "2 for 1 on beer and house drinks",
      happyOn: "On now until 7. {m} left.", happyLater: "Today from 4 to 7 PM.", happyDone: "Today was 4 to 7. Again tomorrow.", happyDoneMon: "Today was 4 to 7. Back on Monday.", happyNone: "Monday to Friday, 4 to 7.",
      hoursAria: "Hours", foot: "Desvelo, restaurant and bar. 33-07 Ditmars Boulevard, Astoria, NY 11105.", kitchen: "Kitchen", hookahPrice: "<b>$35</b> a hookah", hookahRefill: "<b>$15</b> a refill", age: "21 and over only"
    }
  };

  /* ---------- live lines ---------- */
  function kitchenLine(d) {
    var es = L.cur === "es", st = K.status(SHOP.hours, d), kt = K.status(KITCHEN, d);
    if (kt.open) return { on: true, text: es ? "Cocina abierta hasta " + K.esHour(kt.closesAt) : "Kitchen open until " + K.time(kt.closesAt, "en") };
    if (st.open) return { on: true, text: es ? "La cocina cerró. El bar sigue hasta " + K.esHour(st.closesAt) + "." : "Kitchen's closed. The bar keeps going until " + K.time(st.closesAt, "en") + "." };
    return { on: false, text: K.openLine(SHOP.hours, d) };
  }
  var shownNight = null;
  function renderNoche(d) {
    var es = L.cur === "es", op = K.operatingDow(SHOP.hours, d), night = shownNight == null ? op : shownNight, n = NIGHTS[night];
    var late = d.getDay() !== op && shownNight == null;
    var dayWord = K.dayName(new Date(2026, 0, 4 + night));
    $("#nocheKicker").textContent = shownNight == null ? (late ? L.t("tonightLate") : L.t("tonight")) : (es ? "La noche del" : "On");
    $("#nocheDay").textContent = dayWord.charAt(0).toUpperCase() + dayWord.slice(1);
    $("#nocheBig").textContent = L.pick(n.big);
    $("#nocheSub").textContent = L.pick(n.sub);
    var rows = [];
    var h = HAPPY[night], hs;
    if (!h) hs = L.t("happyNone");
    else if (shownNight != null && shownNight !== op) hs = es ? "De 4 a 7 de la tarde." : "From 4 to 7 PM.";
    else {
      var m = d.getHours() * 60 + d.getMinutes();
      if (d.getDay() === night && m >= h[0] && m < h[1]) { var left = h[1] - m; hs = L.t("happyOn", { m: Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0") }); }
      else if (d.getDay() === night && m < h[0]) hs = L.t("happyLater");
      else hs = HAPPY[(night + 1) % 7] ? L.t("happyDone") : L.t("happyDoneMon");
    }
    rows.push([L.t("happy"), L.t("happyText"), hs]);
    rows.push([L.t("plate"), L.pick(PLATO_DEL_DIA), K.money(PLATO_DEL_DIA.price)]);
    var kl = kitchenLine(d);
    if (shownNight == null) rows.push([L.t("kitchen"), kl.text, ""]);
    $("#nocheRow").innerHTML = rows.map(function (r) { return '<div><dt class="k">' + r[0] + '</dt><dd class="v" style="margin:0">' + r[1] + "</dd>" + (r[2] ? '<dd class="s" style="margin:0">' + r[2] + "</dd>" : "") + "</div>"; }).join("");
    var order = [1, 2, 3, 4, 5, 6, 0];
    $("#week").innerHTML = order.map(function (dw) {
      var pressed = dw === night;
      return '<button type="button" data-night="' + dw + '" aria-pressed="' + pressed + '">' + K.dayShort(new Date(2026, 0, 4 + dw)) + "</button>";
    }).join("");
  }
  function renderLive() {
    var d = K.now(), kl = kitchenLine(d);
    ["#heroLive", "#visitLive"].forEach(function (s) { var el = $(s); el.textContent = kl.text; el.classList.toggle("off", !kl.on); });
    renderNoche(d);
    $("#hours").innerHTML = K.hoursRows(SHOP.hours).map(function (r) {
      return "<li" + (r.today ? ' class="today" aria-current="date"' : "") + '><span data-today="' + L.t("today") + '">' + r.label + "</span><span>" + r.text + "</span></li>";
    }).join("");
  }

  /* ---------- menu ---------- */
  var plus = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5v14" stroke="currentColor" stroke-width="2.2" fill="none"/></svg>';
  function renderMenu() {
    var sunday = K.operatingDow(SHOP.hours, K.now()) === 0;
    var list = DISHES.slice();
    if (sunday) { list = [DISHES[4]].concat(DISHES.slice(0, 4)); }
    $("#films").innerHTML = list.map(function (it) {
      return '<article class="frame-dish" id="dish-' + it.id + '"><picture><source type="image/avif" srcset="img/' + it.img + '-480.avif 480w, img/' + it.img + '-828.avif 828w, img/' + it.img + '-944.avif 944w" sizes="(min-width: 900px) 50vw, 100vw">' +
        '<img src="img/' + it.img + '-828.webp" width="944" height="1680" alt="" loading="lazy" decoding="async"></picture>' +
        '<div class="dish"><h3 class="cond">' + L.pick(it.name) + "</h3><p>" + L.pick(it.desc) + '</p><div class="buy"><span class="price">' + K.money(it.price) + "</span>" +
        '<button type="button" class="add" data-add="' + it.id + '">' + plus + "<span>" + L.t("add") + '</span><span class="n"></span></button></div></div></article>';
    }).join("");
    $("#drinkList").innerHTML = DRINKS.map(function (it) {
      return '<li><span class="nm">' + L.pick(it.name) + (it.sub ? "<small>" + L.pick(it.sub) + "</small>" : "") + '</span><span class="ld" aria-hidden="true"></span><span class="pr">' + K.money(it.price) + "</span>" +
        '<button type="button" class="mini" data-add="' + it.id + '" aria-label="' + L.t("add") + " " + L.pick(it.name) + '">' + plus + "</button></li>";
    }).join("");
    $("#flavors").innerHTML = FLAVORS.map(function (f) { return "<li>" + L.pick(f) + (f.sub ? "<small>" + L.pick(f.sub) + "</small>" : "") + "</li>"; }).join("");
    $("#hookahTerms").innerHTML = "<span>" + L.t("hookahPrice") + "</span><span>" + L.t("hookahRefill") + "</span><span>" + L.t("age") + "</span>";
    observe(); syncCart(); K.reveal();
  }
  var io = null;
  function observe() {
    if (io) io.disconnect();
    var els = document.querySelectorAll(".frame-dish");
    if (K.reduce || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) e.target.classList.add("in"); }); }, { threshold: 0.2 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- engines ---------- */
  var C;
  function syncCart() {
    document.querySelectorAll("[data-add]").forEach(function (b) {
      var q = C.qty(b.dataset.add);
      b.classList.toggle("has", q > 0);
      if (b.classList.contains("mini")) b.innerHTML = q ? String(q) : plus;
      else { var n = b.querySelector(".n"); if (n) n.textContent = q || ""; }
    });
    var c = C.count();
    $("#orderLabel").textContent = c ? L.t("yourOrder") : L.t("pickup");
    $("#orderCount").textContent = c ? K.money(C.subtotal()) : "";
  }
  var ORDER = {
    title: { es: "Pide para recoger", en: "Order for pickup" },
    steps: [{ id: "bag", type: "bag" }, { id: "pickup", type: "pickup" }, { id: "tip", type: "tip" }, { id: "sum", type: "summary" }, { id: "pay", type: "pay" }, { id: "done", type: "done" }],
    lead: 25, step: 15, tips: [0, 0.15, 0.18, 0.2], pickupHours: KITCHEN, stripeTheme: "night"
  };
  var OCCASIONS = [
    { id: "cena", label: { es: "Cenar", en: "Dinner" }, sub: { es: "Una mesa y la carta", en: "A table and the menu" } },
    { id: "cumple", label: { es: "Cumpleaños", en: "Birthday" }, sub: { es: "Le sacamos el bizcocho con bengalas", en: "We bring out the cake with sparklers" } },
    { id: "happy", label: { es: "Happy hour", en: "Happy hour" }, sub: { es: "De lunes a viernes, de 4 a 7", en: "Monday to Friday, 4 to 7" } },
    { id: "juego", label: { es: "Ver el juego", en: "Watch the game" }, sub: { es: "Mesa frente a las pantallas", en: "A table facing the screens" } },
    { id: "hookah", label: { es: "Noche de hookah", en: "Hookah night" }, sub: { es: "En el lounge del fondo", en: "In the back lounge" } },
    { id: "grupo", label: { es: "Grupo o empresa", en: "Group or work party" }, sub: { es: "Diez o más, con menú para compartir", en: "Ten or more, family-style" } }
  ];
  var SIZES = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20];
  function deposit(d) { var n = +d.party || 2; return (n >= 8 || d.occasion === "cumple" || d.occasion === "grupo") ? Math.max(50, n * 10) : 0; }
  var RESERVE = {
    title: { es: "Reservar mesa", en: "Reserve a table" },
    refPrefix: "DSV",
    summaryTitle: { es: "Tu reserva", en: "Your reservation" },
    doneTitle: { es: "¡Listo! Tu mesa está apartada.", en: "Your table is set." },
    steps: [
      { id: "party", type: "pick", title: { es: "¿Cuántos son?", en: "How many of you?" }, compact: true,
        options: function () { return SIZES.map(function (n) { return { id: String(n), label: L.cur === "es" ? n + (n === 20 ? " o más" : "") + " personas" : n + (n === 20 ? " or more" : "") + " people", sub: n >= 8 ? (L.cur === "es" ? "Mesa larga, con depósito" : "Long table, deposit held") : null }; }); } },
      { id: "occasion", type: "pick", title: { es: "¿Qué celebramos?", en: "What's the occasion?" }, options: OCCASIONS },
      { id: "day", type: "day", title: { es: "¿Qué día?", en: "Which day?" }, days: 21 },
      { id: "time", type: "time", title: { es: "¿A qué hora?", en: "What time?" } },
      { id: "sum", type: "summary" }, { id: "pay", type: "pay" }, { id: "done", type: "done" }
    ],
    step: 30, lead: 60,
    window: function (day) { var h = SHOP.hours[day.getDay()]; return h ? [h[0], 1500] : null; },
    taken: function (t, d) { return (+d.party >= 8) && K.hash("t" + t.toISOString().slice(0, 16)) % 100 < 35; },
    price: function (d) { return deposit(d); },
    payOptions: function (d, t, payments) {
      var es = L.cur === "es", dep = deposit(d);
      if (!dep || !payments) return [{ id: "hold", amount: 0, label: es ? "Apartar la mesa" : "Hold the table", sub: es ? "Sin depósito. Pagas la cuenta aquí." : "No deposit. Pay the bill here." }];
      var why = +d.party >= 8 ? (es ? "Para mesas de 8 o más." : "For tables of 8 or more.") : (es ? "Para cumpleaños y grupos." : "For birthdays and groups.");
      return [{ id: "deposit", amount: dep, locked: true, label: es ? "Depósito " + K.money(dep) : "Deposit " + K.money(dep), sub: why + (es ? " Se descuenta de la cuenta." : " Comes off the bill.") }];
    },
    holdLabel: { es: "Apartar la mesa", en: "Hold the table" },
    receipt: function (d) {
      var es = L.cur === "es", occ = OCCASIONS.filter(function (o) { return o.id === d.occasion; })[0], dep = deposit(d);
      var rows = [
        [es ? "Mesa para" : "Table for", d.party + (es ? " personas" : " people")],
        [es ? "Ocasión" : "Occasion", occ ? L.pick(occ.label) : ""],
        [es ? "Día" : "Day", K.dateShort(d.time)],
        [es ? "Hora" : "Time", K.time(d.time)],
        "rule",
        [es ? "Depósito" : "Deposit", dep ? K.money(dep) : (es ? "No hace falta" : "Not needed"), "strong"]
      ];
      return rows;
    },
    sms: function (d, paid) {
      var es = L.cur === "es", occ = OCCASIONS.filter(function (o) { return o.id === d.occasion; })[0];
      return [
        (es ? "Reserva en Desvelo " : "Desvelo reservation ") + d.ref,
        K.dateShort(d.time) + ", " + K.time(d.time),
        (es ? "Mesa para " : "Table for ") + d.party + (occ ? ", " + L.pick(occ.label) : ""),
        paid, (es ? "Nombre: " : "Name: ") + d.name
      ].join("\n");
    },
    calendar: function (d) {
      return { uid: d.ref + "@desvelo.demo", start: d.time, end: new Date(d.time.getTime() + 150 * 60000),
        title: (L.cur === "es" ? "Desvelo: mesa para " : "Desvelo: table for ") + d.party, location: "Desvelo, " + SHOP.address, description: (L.cur === "es" ? "Referencia " : "Reference ") + d.ref };
    }
  };

  /* ---------- hero frames ---------- */
  function startFrames() {
    var frames = Array.prototype.slice.call(document.querySelectorAll(".frame")), i = 0;
    if (K.reduce) return;
    setInterval(function () {
      var prev = frames[i]; i = (i + 1) % frames.length;
      var nx = frames[i], img = nx.querySelector("img");
      img.style.animation = "none"; void img.offsetWidth; img.style.animation = "";
      nx.classList.add("live"); setTimeout(function () { prev.classList.remove("live"); }, 1400);
    }, 5200);
  }

  function boot() {
    Engine.init(SHOP, DISHES.concat(DRINKS).concat([{ id: "plato", name: { es: PLATO_DEL_DIA.es, en: PLATO_DEL_DIA.en }, price: PLATO_DEL_DIA.price }]));
    C = Engine.cart; C.on(syncCart);
    L.init(SHOP.id, DICT, "es");
    var phone = function () { $("#phoneText").textContent = L.t("phoneLabel") + ": " + SHOP.phone; };
    L.on(function () { renderMenu(); renderLive(); phone(); });
    renderMenu(); renderLive(); phone(); startFrames();
    $("#mapBtn").href = K.mapsUrl(SHOP.name, SHOP.address);
    $("#callBtn").href = K.telUrl(SHOP.phone);
    $("#googleLink").href = K.googleSearchUrl(SHOP.name + " " + SHOP.address);
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-lang-btn]")) { L.toggle(); return; }
      var a = e.target.closest("[data-add]"); if (a) { C.add(a.dataset.add, 1); return; }
      var nt = e.target.closest("[data-night]");
      if (nt) { var v = +nt.dataset.night; shownNight = v === K.operatingDow(SHOP.hours, K.now()) ? null : v; renderNoche(K.now()); return; }
      if (e.target.closest("#reserveBtn")) { Engine.book(RESERVE); return; }
      if (e.target.closest("#orderBtn")) { if (C.count()) Engine.order(ORDER); else $("#menu").scrollIntoView({ behavior: K.reduce ? "auto" : "smooth" }); return; }
    });
    var top = $("#top");
    new IntersectionObserver(function (es) { top.classList.toggle("solid", !es[0].isIntersecting); }, { rootMargin: "-64px 0px 0px 0px" }).observe($("#hero"));
    var hk = document.querySelector(".hookah");
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { hk.classList.toggle("seen", es[0].isIntersecting); }).observe(hk);
    setInterval(renderLive, 30000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  /* film grain starts once the page has painted and settled */
  window.addEventListener("load", function () { setTimeout(function () { document.documentElement.classList.add("settled"); }, 900); });
})();
