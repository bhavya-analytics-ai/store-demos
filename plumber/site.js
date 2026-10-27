/* Ferrule: the company's own settings, words and page behaviour. */
(function () {
  "use strict";
  var K = window.Kit, L = K.Lang;
  function $(s) { return document.querySelector(s); }

  /* ---------- the company: edit these lines for a real client ---------- */
  var OM_NUMBER = "(718) 555-0142"; /* 555-01xx: a number reserved for fiction */
  var SHOP = window.SHOP = {
    id: "ferrule",
    name: "Ferrule",
    phone: OM_NUMBER,
    payments: true, /* false = nothing taken online: every visit is paid when the job is done */
    visitFee: 95,
    address: "24-07 31st Street, Astoria, NY 11102",
    /* booked visits, minutes from midnight, Sunday first. The phone itself is 24/7. */
    hours: [[540, 1020], [420, 1200], [420, 1200], [420, 1200], [420, 1200], [420, 1200], [480, 1200]]
  };

  /* three shifts, one phone: who answers depends on the clock */
  var CREW = [
    { id: "theo", label: "Theo", img: "f-theo", from: 7, to: 15, role: { en: "Master plumber, owner. Boilers and the old pipes nobody else will touch.", es: "Plomero maestro, dueño. Calderas y las tuberías viejas que nadie más toca." } },
    { id: "kasia", label: "Kasia", img: "f-kasia", from: 15, to: 23, role: { en: "Water heaters, gas lines, bathrooms done right.", es: "Calentadores, líneas de gas, baños bien hechos." } },
    { id: "luis", label: "Luis", img: "f-luis", from: 23, to: 7, role: { en: "Nights. Leaks, floods and no-heat calls.", es: "Noches. Fugas, inundaciones y casas sin calefacción." } }
  ];
  function onCall(d) {
    var h = d.getHours();
    return CREW.filter(function (c) { return c.from < c.to ? (h >= c.from && h < c.to) : (h >= c.from || h < c.to); })[0];
  }

  var JOBS = [
    { id: "visit", label: { en: "Visit and diagnosis", es: "Visita y diagnóstico" }, price: 95, from: false, mins: 60, sub: { en: "Credited to the repair if you go ahead", es: "Se descuenta de la reparación si sigues" } },
    { id: "drain", label: { en: "Clear a drain", es: "Destapar un desagüe" }, price: 175, from: true, mins: 60, sub: { en: "Kitchen, bath or tub, with a camera look", es: "Cocina, baño o bañera, con cámara" } },
    { id: "leak", label: { en: "Fix a leak", es: "Arreglar una fuga" }, price: 165, from: true, mins: 60 },
    { id: "toilet", label: { en: "Toilet repair", es: "Arreglar el inodoro" }, price: 145, from: true, mins: 60, sub: { en: "Running, rocking, clogged", es: "Que corre, se mueve o se tapa" } },
    { id: "faucet", label: { en: "Faucet swap", es: "Cambiar la llave" }, price: 225, from: false, mins: 90, sub: { en: "Labor. Your faucet or ours", es: "Mano de obra. Tu llave o la nuestra" } },
    { id: "boiler", label: { en: "Boiler service", es: "Mantenimiento de caldera" }, price: 245, from: false, mins: 120, sub: { en: "Before the first cold night, not after", es: "Antes de la primera noche fría, no después" } },
    { id: "heater", label: { en: "Water heater, installed", es: "Calentador, instalado" }, price: 1650, from: true, mins: 240, sub: { en: "Old tank hauled away", es: "Nos llevamos el tanque viejo" } }
  ];

  var ICON = {
    drop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3c3 4 6 7.4 6 11a6 6 0 0 1-12 0c0-3.6 3-7 6-11z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };

  var SYMPTOMS = [
    { id: "water", img: "f-valve", label: { en: "Water where it shouldn't be", es: "Agua donde no debe" }, job: "leak",
      steps: { en: ["Shut the water. Under a sink or toilet: turn the small oval valve clockwise until it stops.", "Can't find it, or it's a pipe? Main valve: by the water meter, usually in the basement on the front wall. Turn the handle across the pipe.", "Kill power to anything wet, then call. We'll stay on the line."],
               es: ["Cierra el agua. Debajo del lavamanos o el inodoro: gira la llavecita ovalada a la derecha hasta que pare.", "¿No la encuentras o es un tubo? La llave principal está junto al medidor, casi siempre en el sótano, en la pared del frente. Gira la manija atravesada al tubo.", "Apaga la luz de lo que esté mojado y llama. Nos quedamos en la línea contigo."] } },
    { id: "heat", img: "f-hero-p", label: { en: "No heat", es: "No hay calefacción" }, job: "boiler",
      steps: { en: ["Thermostat on HEAT and set five degrees above the room.", "Boiler switch: top of the basement stairs, usually a red plate. Make sure it's ON.", "Still cold after 15 minutes? Call. Don't keep resetting the boiler."],
               es: ["Termostato en HEAT y cinco grados más alto que el cuarto.", "Interruptor de la caldera: arriba de la escalera del sótano, casi siempre con una placa roja. Que esté en ON.", "¿Sigue frío después de 15 minutos? Llama. No sigas reiniciando la caldera."] } },
    { id: "hot", img: "f-joint", label: { en: "No hot water", es: "No hay agua caliente" }, job: "visit",
      steps: { en: ["Gas heater: look through the little window at the bottom for a small blue flame.", "Electric heater: check its breaker in the panel.", "Smell gas at any point? Stop and go to the gas tile."],
               es: ["Calentador de gas: mira por la ventanita de abajo si hay una llamita azul.", "Calentador eléctrico: revisa su breaker en el panel.", "¿Huele a gas? Para y ve al cuadro de gas."] } },
    { id: "drain", img: "f-joint", label: { en: "Drain backing up", es: "Desagüe tapado" }, job: "drain",
      steps: { en: ["Stop running water everywhere in the house: sinks, shower, washer.", "Skip the chemical drain cleaner. It eats old pipes and burns whoever opens them next.", "Book a visit. If sewage is coming up in the basement, call instead."],
               es: ["No uses agua en toda la casa: lavamanos, ducha, lavadora.", "Nada de químicos destapacaños. Se comen los tubos viejos y queman al que los abra.", "Reserva una visita. Si sube agua sucia en el sótano, mejor llama."] } },
    { id: "gas", img: null, gas: true, label: { en: "I smell gas", es: "Huele a gas" },
      steps: { en: ["Leave now. Everyone out, door open behind you.", "Don't touch light switches, don't light anything, don't use your phone inside.", "From outside, call 911. Then call us; we'll meet the gas company there."],
               es: ["Sal ya. Todos afuera, deja la puerta abierta.", "No toques interruptores, no prendas nada, no uses el teléfono adentro.", "Desde afuera llama al 911. Después llámanos; nos vemos allí con la compañía de gas."] } },
    { id: "other", img: "f-van", label: { en: "Something else", es: "Otra cosa" }, job: "visit",
      steps: { en: ["Running toilet, slow drip, low pressure, a noise in the wall.", "Not urgent? Book a visit and pick a time.", "Not sure? Call. Two minutes on the phone usually tells us."],
               es: ["Inodoro que corre, goteo, poca presión, un ruido en la pared.", "¿No es urgente? Reserva una visita y escoge la hora.", "¿No sabes? Llama. Con dos minutos al teléfono casi siempre sabemos."] } }
  ];

  var DICT = {
    en: {
      bookVisit: "Book a visit", bookShort: "Book", call: "Call", callNow: "Call {n} now", directions: "Directions", google: "Find us on Google",
      nowEyebrow: "Before you call", nowTitle: "What's happening right now?", nowLede: "Tap it. We'll tell you what to do in the next two minutes, before anyone gets there.",
      doThis: "Do this now", tapOpen: "What to do",
      priceEyebrow: "Flat prices", priceTitle: "The price before the wrench.", priceLede: "You hear the number before we touch anything. If it's more, we tell you why, and you decide.",
      priceFoot: "Parts at cost plus 15%, shown on the bill. Tap any line to book it.", from: "from",
      crewEyebrow: "Three shifts, one phone", crewTitle: "Who's picking up.", onNow: "On call now", shift: "{a} to {b}",
      blockEyebrow: "Where we go", blockTitle: "Parked on your block. Not in Jersey.", blockLede: "The vans sleep in Astoria. Everything below is close enough that we're not stuck on the BQE while your ceiling drips.",
      promiseEyebrow: "How we work", promiseTitle: "Four things, every job.",
      p1: "Price first", p1s: "The number before the wrench. Always.", p2: "Shoe covers on", p2s: "Your floor looks the way we found it.",
      p3: "Photo when done", p3s: "You see the work, even the part behind the wall.", p4: "One year on labor", p4s: "If our joint leaks, we come back. Free.",
      visitEyebrow: "Call any hour", visitTitle: "One number. A person on it.", hoursEyebrow: "Booked visits", hoursAria: "Hours for booked visits",
      hoursNote: "Emergencies: the phone is answered 24 hours, every day.", today: "today",
      status: "{n} is on call right now", barBig: "{n} is on call", barSmall: "A person answers, 24/7",
      foot: "Ferrule Plumbing & Heating. 24-07 31st Street, Astoria, NY 11102. Licensed and insured.",
      concept: "Concept design. Ferrule is a fictional company; prices and people are examples.",
      jointAlt: "Fresh solder joints on new copper pipe", vanAlt: "A Ferrule van parked at night on a wet Astoria street, rear doors open",
      lineNight: "Somebody's up.", lineEarly: "First coffee. Vans rolling.", lineDay: "Out on calls in Astoria.", lineEve: "Still on. Still answering.",
      subNight: "It's late and something's wrong. {n} answers, not a menu, and gives you the price before the wrench comes out.",
      subDay: "Burst pipe, no heat, no hot water. {n} answers, not a menu, and gives you the price before the wrench comes out."
    },
    es: {
      bookVisit: "Reservar visita", bookShort: "Reservar", call: "Llamar", callNow: "Llama a {n} ya", directions: "Cómo llegar", google: "Búscanos en Google",
      nowEyebrow: "Antes de llamar", nowTitle: "¿Qué está pasando ahora?", nowLede: "Tócalo. Te decimos qué hacer en los próximos dos minutos, antes de que llegue nadie.",
      doThis: "Haz esto ya", tapOpen: "Qué hacer",
      priceEyebrow: "Precios fijos", priceTitle: "El precio antes de la llave.", priceLede: "Oyes el número antes de que toquemos nada. Si sale más, te decimos por qué y tú decides.",
      priceFoot: "Piezas al costo más 15%, en la factura. Toca cualquier línea para reservarla.", from: "desde",
      crewEyebrow: "Tres turnos, un teléfono", crewTitle: "Quién contesta.", onNow: "De guardia ahora", shift: "{a} a {b}",
      blockEyebrow: "Dónde vamos", blockTitle: "Parqueados en tu cuadra. No en Jersey.", blockLede: "Las vans duermen en Astoria. Todo esto queda cerca, para no estar atascados en la BQE mientras te gotea el techo.",
      promiseEyebrow: "Cómo trabajamos", promiseTitle: "Cuatro cosas, cada trabajo.",
      p1: "Precio primero", p1s: "El número antes de la llave. Siempre.", p2: "Cubrezapatos puestos", p2s: "Tu piso queda como lo encontramos.",
      p3: "Foto al terminar", p3s: "Ves el trabajo, hasta lo que queda detrás de la pared.", p4: "Un año de garantía", p4s: "Si nuestra unión gotea, volvemos. Gratis.",
      visitEyebrow: "Llama a cualquier hora", visitTitle: "Un número. Una persona.", hoursEyebrow: "Visitas reservadas", hoursAria: "Horario de visitas reservadas",
      hoursNote: "Emergencias: el teléfono se contesta las 24 horas, todos los días.", today: "hoy",
      status: "{n} está de guardia ahora", barBig: "{n} está de guardia", barSmall: "Contesta una persona, 24/7",
      foot: "Ferrule Plumbing & Heating. 24-07 31st Street, Astoria, NY 11102. Con licencia y seguro.",
      concept: "Diseño de muestra. Ferrule es una empresa ficticia; los precios y las personas son ejemplos.",
      jointAlt: "Uniones recién soldadas en tubería de cobre nueva", vanAlt: "Una van de Ferrule parqueada de noche en una calle mojada de Astoria, con las puertas de atrás abiertas",
      lineNight: "Aquí alguien está despierto.", lineEarly: "Primer café. Las vans salen.", lineDay: "En la calle por Astoria.", lineEve: "Seguimos. Seguimos contestando.",
      subNight: "Es tarde y algo anda mal. Contesta {n}, no un menú, y te da el precio antes de sacar la llave.",
      subDay: "Tubo roto, sin calefacción, sin agua caliente. Contesta {n}, no un menú, y te da el precio antes de sacar la llave."
    }
  };

  /* ---------- booking ---------- */
  function job(d) { return JOBS.filter(function (j) { return j.id === d.what; })[0] || JOBS[0]; }
  function usd(n) { return "$" + n.toLocaleString("en-US"); }
  function priceWords(j) { return (j.from ? L.t("from") + " " : "") + usd(j.price); }
  var BOOK = {
    title: { en: "Book a visit", es: "Reserva una visita" },
    refPrefix: "FRL",
    steps: [
      { id: "what", type: "pick", title: { en: "What needs fixing?", es: "¿Qué hay que arreglar?" }, compact: true,
        options: function () { return JOBS.map(function (j) { return { id: j.id, label: j.label, sub: j.sub, end: priceWords(j) }; }); },
        note: { en: "Water coming in or no heat in winter? Don't book, call.", es: "¿Entra agua o no hay calefacción en invierno? No reserves, llama." } },
      { id: "day", type: "day", title: { en: "Pick a day", es: "Escoge el día" }, days: 14 },
      { id: "time", type: "time", title: { en: "When can we come?", es: "¿A qué hora vamos?" } },
      { id: "sum", type: "summary" }, { id: "pay", type: "pay" }, { id: "done", type: "done" }
    ],
    step: 60, lead: 120,
    slotMins: function () { return 60; },
    taken: function (t) { return K.hash("frl" + t.toISOString().slice(0, 13)) % 100 < 35; },
    price: function (d) { return job(d).price; },
    payOptions: function (d, t, payments) {
      var es = L.cur === "es";
      var later = { id: "hold", amount: 0, label: es ? "Pagar cuando terminemos" : "Pay when the job's done", sub: es ? "No se cobra nada para reservar" : "Nothing charged to book" };
      if (!payments) return [later];
      return [
        { id: "deposit", amount: SHOP.visitFee, label: es ? "Pagar la visita ahora" : "Pay the visit now", sub: es ? "Se descuenta de la reparación" : "Credited to the repair" },
        later
      ];
    },
    holdLabel: { en: "Book it, pay later", es: "Reservar, pagar después" },
    receipt: function (d, t) {
      var es = L.cur === "es", j = job(d);
      return [
        [es ? "Trabajo" : "Job", L.pick(j.label)],
        [es ? "Día" : "Day", K.dateShort(d.time)],
        [es ? "Llegada" : "Arrival", K.time(d.time) + " – " + K.time(new Date(d.time.getTime() + 3600000))],
        "rule",
        [es ? "Precio" : "Price", priceWords(j), "strong"]
      ];
    },
    sms: function (d, paid) {
      var es = L.cur === "es", j = job(d);
      return [(es ? "Visita Ferrule " : "Ferrule visit ") + d.ref, K.dateShort(d.time) + ", " + K.time(d.time), L.pick(j.label) + " (" + priceWords(j) + ")", paid, (es ? "Nombre: " : "Name: ") + d.name].join("\n");
    },
    calendar: function (d) {
      var j = job(d);
      return { uid: d.ref + "@ferrule.demo", start: d.time, end: new Date(d.time.getTime() + 3600000),
        title: "Ferrule: " + L.pick(j.label), location: SHOP.address, description: (L.cur === "es" ? "Referencia " : "Reference ") + d.ref };
    }
  };

  /* ---------- the clock ---------- */
  var lastMin = -1;
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var d = K.now(), m = d.getHours() * 60 + d.getMinutes();
    if (m === lastMin) return; lastMin = m;
    var h = d.getHours() % 12 || 12, ap = d.getHours() < 12 ? "AM" : "PM";
    $("#clock").innerHTML = h + '<span class="colon">:</span>' + pad(d.getMinutes()) + '<span class="ap">' + ap + "</span>";
    renderLive();
  }
  function renderLive() {
    var d = K.now(), hr = d.getHours(), c = onCall(d);
    var line = hr >= 22 || hr < 5 ? "lineNight" : hr < 9 ? "lineEarly" : hr < 18 ? "lineDay" : "lineEve";
    $("#heroLine").textContent = L.t(line);
    $("#heroSub").textContent = L.t(hr >= 22 || hr < 5 ? "subNight" : "subDay", { n: c.label });
    $("#statusLine").textContent = L.t("status", { n: c.label });
    $("#callHeroText").textContent = L.t("callNow", { n: c.label });
    $("#barBig").textContent = L.t("barBig", { n: c.label });
    $("#barSmall").textContent = L.t("barSmall");
    document.querySelectorAll(".tech").forEach(function (el) { el.classList.toggle("now", el.dataset.id === c.id); });
    $("#hours").innerHTML = K.hoursRows(SHOP.hours).map(function (r) {
      return "<li" + (r.today ? ' class="today" aria-current="date"' : "") + '><span data-today="' + L.t("today") + '">' + r.label + "</span><span>" + r.text + "</span></li>";
    }).join("");
  }
  function hourWords(h) { var x = new Date(2026, 0, 4, h % 24, 0); return K.time(x); }

  /* ---------- sections ---------- */
  function pic(name, sizes, alt, cls) {
    return '<picture' + (cls ? ' class="' + cls + '"' : "") + '><source type="image/avif" srcset="img/' + name + '-480.avif 480w, img/' + name + '-828.avif 828w" sizes="' + sizes + '">' +
      '<img src="img/' + name + '-828.webp" srcset="img/' + name + '-480.webp 480w, img/' + name + '-828.webp 828w" sizes="' + sizes + '" width="1136" height="1408" alt="' + alt + '" loading="lazy" decoding="async"></picture>';
  }
  function renderTiles() {
    $("#tiles").innerHTML = SYMPTOMS.map(function (s) {
      return '<button type="button" role="listitem" class="tile' + (s.gas ? " gas" : "") + '" data-sym="' + s.id + '" aria-expanded="false" aria-controls="fix"><b>' + L.pick(s.label) + "</b><span>" + L.t("tapOpen") + ICON.arrow + "</span></button>";
    }).join("");
  }
  var openSym = null;
  function showFix(id) {
    var s = SYMPTOMS.filter(function (x) { return x.id === id; })[0], box = $("#fix");
    document.querySelectorAll(".tile").forEach(function (t) { t.setAttribute("aria-expanded", t.dataset.sym === id ? "true" : "false"); });
    if (!s || openSym === id) { openSym = null; box.hidden = true; document.querySelectorAll(".tile").forEach(function (t) { t.setAttribute("aria-expanded", "false"); }); return; }
    openSym = id;
    var c = onCall(K.now());
    var img = s.img ? (s.img === "f-hero-p"
      ? '<picture><source type="image/avif" srcset="img/f-hero-p-480.avif 480w, img/f-hero-p-828.avif 828w" sizes="(min-width:700px) 40vw, 100vw"><img src="img/f-hero-p-828.webp" width="944" height="1680" alt="" loading="lazy" decoding="async" style="object-position:50% 70%"></picture>'
      : pic(s.img, "(min-width:700px) 40vw, 100vw", "")) : "";
    box.className = "fix" + (s.gas ? " gas" : "");
    box.style.gridTemplateColumns = s.img ? "" : "1fr";
    box.innerHTML = img + '<div class="fix-in"><p class="eyebrow">' + L.t("doThis") + "</p><h3>" + L.pick(s.label) + "</h3><ol>" +
      L.pick(s.steps).map(function (x) { return "<li><span>" + x + "</span></li>"; }).join("") + '</ol><div class="acts">' +
      '<a class="btn fill" href="' + K.telUrl(SHOP.phone) + '">' + L.t("callNow", { n: c.label }) + "</a>" +
      (s.job ? '<button class="btn line" type="button" data-job="' + s.job + '">' + L.t("bookVisit") + "</button>" : "") + "</div></div>";
    box.hidden = false;
    if (!K.reduce) box.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], { duration: 600, easing: "cubic-bezier(.2,.7,.2,1)" });
    var r = box.getBoundingClientRect(); if (r.top > innerHeight * .6) box.scrollIntoView({ behavior: K.reduce ? "auto" : "smooth", block: "start" });
  }
  function renderPrices() {
    $("#priceList").innerHTML = JOBS.map(function (j) {
      return '<li><button type="button" class="price" data-job="' + j.id + '"><span class="price-name">' + L.pick(j.label) + '</span><span class="price-lead" aria-hidden="true"></span><span class="price-num">' +
        (j.from ? "<small>" + L.t("from") + "</small>" : "") + usd(j.price) + "</span>" + (j.sub ? '<span class="price-sub">' + L.pick(j.sub) + "</span>" : "") + "</button></li>";
    }).join("");
  }
  function renderCrew() {
    $("#crewList").innerHTML = CREW.map(function (c) {
      return '<article class="tech rv" data-id="' + c.id + '">' + pic(c.img, "(min-width:700px) 31vw, 100vw", c.label + (L.cur === "es" ? ", plomero de Ferrule" : ", plumber at Ferrule")) +
        '<span class="oncall"><span class="pulse" aria-hidden="true"></span>' + L.t("onNow") + "</span>" +
        '<div class="tech-text"><h3>' + c.label + '</h3><p class="shift" style="margin:0">' + L.t("shift", { a: hourWords(c.from), b: hourWords(c.to) }) + '</p><p class="role" style="margin:0">' + L.pick(c.role) + "</p></div></article>";
    }).join("");
    K.reveal($("#crewList"));
  }

  function boot() {
    Engine.init(SHOP);
    L.init(SHOP.id, DICT, (navigator.language || "").toLowerCase().indexOf("es") === 0 ? "es" : "en");
    var tel = K.telUrl(SHOP.phone);
    ["#callHero", "#callBar", "#callBig"].forEach(function (s) { $(s).href = tel; });
    $("#callBig").textContent = SHOP.phone;
    $("#mapBtn").href = K.mapsUrl(SHOP.name + " Plumbing & Heating", SHOP.address);
    $("#googleLink").href = K.googleSearchUrl("Ferrule Plumbing & Heating Astoria");
    L.on(function () { renderTiles(); renderPrices(); renderCrew(); lastMin = -1; tick(); if (openSym) { var o = openSym; openSym = null; showFix(o); } });
    renderTiles(); renderPrices(); renderCrew(); tick();
    setInterval(tick, 1000);
    K.reveal();

    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-lang-btn]")) { L.toggle(); return; }
      if (e.target.closest("[data-book]")) { Engine.book(BOOK); return; }
      var j = e.target.closest("[data-job]"); if (j) { Engine.book(BOOK, { what: j.dataset.job }); return; }
      var s = e.target.closest("[data-sym]"); if (s) { showFix(s.dataset.sym); return; }
    });

    var top = $("#top"), bar = $("#bar");
    new IntersectionObserver(function (es) { top.classList.toggle("solid", !es[0].isIntersecting); }, { rootMargin: "-80px 0px 0px 0px" }).observe($("#hero"));
    setTimeout(function () { bar.classList.add("up"); }, K.reduce ? 0 : 1400);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.addEventListener("load", function () { setTimeout(function () { document.documentElement.classList.add("settled"); }, 900); });
})();
