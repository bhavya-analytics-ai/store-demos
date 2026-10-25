/* Candil: the shop's own settings, words and page behaviour. */
(function () {
  "use strict";
  var K = window.Kit, L = K.Lang;
  function $(s) { return document.querySelector(s); }

  /* ---------- the shop: edit these lines for a real client ---------- */
  var OM_NUMBER = "[OM'S NUMBER]";
  var SHOP = window.SHOP = {
    id: "candil",
    name: "Candil",
    phone: OM_NUMBER,
    payments: true, /* false = no deposits: every booking is held and paid at the shop */
    deposit: 20,
    address: "28-19 Steinway Street, Astoria, NY 11103",
    /* minutes from midnight, Sunday first */
    hours: [[600, 960], [660, 1140], [600, 1200], [600, 1200], [600, 1200], [600, 1200], [540, 1200]]
  };

  var CUTS = [
    { id: "cut", label: { en: "The cut", es: "El corte" }, price: 45, mins: 45, sub: { en: "Scissors or clippers, shaped to your head", es: "Tijera o máquina, a la forma de tu cabeza" } },
    { id: "fade", label: { en: "Skin fade", es: "Skin fade" }, price: 50, mins: 45, sub: { en: "Down to the skin, blended high or low", es: "Pegadito a la piel, alto o bajo" } },
    { id: "cutbeard", label: { en: "Cut and beard", es: "Corte y barba" }, price: 60, mins: 60, sub: { en: "The cut, the beard shaped and lined", es: "El corte y la barba arreglada y perfilada" } },
    { id: "shave", label: { en: "Hot towel shave", es: "Afeitado con toalla caliente" }, price: 45, mins: 40, sub: { en: "Straight razor, two hot towels, a cold finish", es: "Navaja, dos toallas calientes y cierre en frío" } },
    { id: "beard", label: { en: "Beard sculpt", es: "Perfilado de barba" }, price: 30, mins: 30 },
    { id: "lineup", label: { en: "Line-up", es: "Cerquillo" }, price: 20, mins: 15 },
    { id: "kids", label: { en: "Kids, under 12", es: "Niños, menores de 12" }, price: 35, mins: 30 },
    { id: "hour", label: { en: "The full hour", es: "La hora completa" }, price: 85, mins: 75, sub: { en: "Cut, beard, shave, hot towel. Nobody rushes you.", es: "Corte, barba, afeitado y toalla caliente. Sin prisa." } }
  ];
  var BARBERS = [
    { id: "rafa", label: "Rafa", img: "b-rafa", sig: { en: "Signature: the skin fade", es: "Su firma: el skin fade" } },
    { id: "joel", label: "Joel", img: "b-joel", sig: { en: "Signature: the scissor cut", es: "Su firma: el corte a tijera" } },
    { id: "danny", label: "Danny", img: "b-danny", sig: { en: "Signature: beard and razor", es: "Su firma: barba y navaja" } }
  ];

  var DICT = {
    en: {
      sound: "Sound", line: "Walk in. Walk out different.", skip: "Tap to skip",
      cutsTitle: "The cuts", cutsFoot: "Prices in dollars. Every cut finishes with a hot towel.", teamTitle: "Three chairs.",
      baTitle: "Forty-five minutes.", baSub: "Drag the line. Same man, same chair, same light.", before: "Before", after: "After", baAria: "Compare before and after",
      visitTitle: "Follow the light.", directions: "Directions", call: "Call", google: "Find us on Google", today: "today", phoneLabel: "Phone",
      bookBig: "Book a chair", bookSmall: "Cuts from $45", bookBtn: "Book", bookWith: "Book with {n}", min: "{m} min"
    },
    es: {
      sound: "Sonido", line: "Entra. Sal distinto.", skip: "Toca para saltar",
      cutsTitle: "Los cortes", cutsFoot: "Precios en dólares. Cada corte termina con toalla caliente.", teamTitle: "Tres sillas.",
      baTitle: "Cuarenta y cinco minutos.", baSub: "Arrastra la línea. Mismo hombre, misma silla, misma luz.", before: "Antes", after: "Después", baAria: "Comparar antes y después",
      visitTitle: "Sigue la luz.", directions: "Cómo llegar", call: "Llamar", google: "Búscanos en Google", today: "hoy", phoneLabel: "Teléfono",
      bookBig: "Reserva tu corte", bookSmall: "Cortes desde $45", bookBtn: "Reservar", bookWith: "Reserva con {n}", min: "{m} min"
    }
  };

  /* ---------- booking ---------- */
  function cut(d) { return CUTS.filter(function (c) { return c.id === d.what; })[0] || CUTS[0]; }
  function barber(d) { return BARBERS.filter(function (b) { return b.id === d.who; })[0]; }
  function takenFor(id, t) { return K.hash(id + t.toISOString().slice(0, 16)) % 100 < 30; }
  var BOOK = {
    title: { en: "Book a chair", es: "Reserva tu corte" },
    refPrefix: "CND",
    steps: [
      { id: "who", type: "pick", title: { en: "Who's cutting?", es: "¿Quién te corta?" },
        options: function () {
          return BARBERS.map(function (b) { return { id: b.id, label: b.label, sub: b.sig, img: "img/" + b.img + "-480.webp" }; })
            .concat([{ id: "any", label: { en: "First available", es: "El que esté libre" }, sub: { en: "Most open times", es: "Más horarios libres" } }]);
        } },
      { id: "what", type: "pick", title: { en: "What are we doing?", es: "¿Qué te vas a hacer?" }, compact: true,
        options: function () { return CUTS.map(function (c) { return { id: c.id, label: c.label, sub: L.t("min", { m: c.mins }), end: K.money(c.price) }; }); } },
      { id: "day", type: "day", title: { en: "Pick a day", es: "Escoge el día" }, days: 14 },
      { id: "time", type: "time", title: { en: "Pick a time", es: "Escoge la hora" } },
      { id: "sum", type: "summary" }, { id: "pay", type: "pay" }, { id: "done", type: "done" }
    ],
    step: 15, lead: 60,
    slotMins: function (d) { return cut(d).mins; },
    taken: function (t, d) {
      if (d.who && d.who !== "any") return takenFor(d.who, t);
      return BARBERS.every(function (b) { return takenFor(b.id, t); });
    },
    price: function (d) { return cut(d).price; },
    payOptions: function (d, t, payments) {
      if (!payments) return [{ id: "hold", amount: 0, label: L.cur === "es" ? "Apartar la silla" : "Hold the chair", sub: L.cur === "es" ? "Pagas en el local" : "Pay at the shop" }];
      var es = L.cur === "es";
      return [
        { id: "deposit", amount: SHOP.deposit, label: es ? "Depósito ahora" : "Deposit now", sub: (es ? "El resto, " : "The rest, ") + K.money(t.total - SHOP.deposit) + (es ? ", en el local" : ", at the shop") },
        { id: "full", amount: t.total, label: es ? "Pagar el corte completo" : "Pay for the full cut", sub: es ? "Llegas y te sientas" : "Walk in and sit down" },
        { id: "hold", amount: 0, label: es ? "Apartar sin pagar" : "Hold without paying", sub: es ? "Pagas en el local" : "Pay at the shop" }
      ];
    },
    holdLabel: { en: "Hold my chair", es: "Apartar mi silla" },
    receipt: function (d, t) {
      var es = L.cur === "es", c = cut(d), b = barber(d);
      return [
        [es ? "Barbero" : "Barber", b ? b.label : (es ? "El que esté libre" : "First available")],
        [es ? "Servicio" : "Service", L.pick(c.label)],
        [es ? "Día" : "Day", K.dateShort(d.time)],
        [es ? "Hora" : "Time", K.time(d.time)],
        [es ? "Duración" : "Takes", L.t("min", { m: c.mins })],
        "rule",
        [es ? "Precio" : "Price", K.money(t.total), "strong"]
      ];
    },
    sms: function (d, paid) {
      var es = L.cur === "es", c = cut(d), b = barber(d);
      return [
        (es ? "Cita en Candil " : "Candil booking ") + d.ref,
        K.dateShort(d.time) + ", " + K.time(d.time),
        L.pick(c.label) + " (" + K.money(c.price) + "), " + (b ? b.label : (es ? "el que esté libre" : "first available")),
        paid,
        (es ? "Nombre: " : "Name: ") + d.name
      ].join("\n");
    },
    calendar: function (d) {
      var c = cut(d), b = barber(d);
      return {
        uid: d.ref + "@candil.demo", start: d.time, end: new Date(d.time.getTime() + c.mins * 60000),
        title: "Candil: " + L.pick(c.label) + (b ? " " + (L.cur === "es" ? "con" : "with") + " " + b.label : ""),
        location: "Candil, " + SHOP.address, description: (L.cur === "es" ? "Referencia " : "Reference ") + d.ref
      };
    }
  };

  /* ---------- the ride ---------- */
  var html = document.documentElement, ride, rideV, loopV, landed = false;
  var landscape = window.matchMedia("(min-width: 900px) and (orientation: landscape)").matches;
  var loopSrc = "video/loop-" + (landscape ? "l" : "p") + ".mp4";
  function land() {
    if (landed) return; landed = true;
    ride.classList.add("landed");
    K.store.sset("candil:ride", "1");
    setTimeout(function () { $("#book").classList.add("up"); }, K.reduce ? 0 : 900);
  }
  function toLoop(fast) {
    if (K.reduce) { html.classList.add("skip-ride"); land(); return; }
    if (!loopV.src) { loopV.src = loopSrc; }
    var p = loopV.play();
    var swap = function () { loopV.classList.add("on"); setTimeout(function () { rideV.classList.remove("on"); rideV.pause(); }, fast ? 0 : 500); land(); };
    if (p && p.then) p.then(swap).catch(function () { html.classList.add("skip-ride"); rideV.classList.remove("on"); land(); });
    else swap();
  }
  function startRide() {
    ride = $("#ride"); rideV = $("#rideV"); loopV = $("#loopV");
    if (html.classList.contains("skip-ride")) {
      ride.classList.add("ride-go");
      if (!K.reduce) { loopV.preload = "auto"; toLoop(true); } else land();
      return;
    }
    var fallback = setTimeout(function () { ride.classList.add("ride-go"); }, 700);
    rideV.addEventListener("playing", function () {
      clearTimeout(fallback);
      rideV.classList.add("on"); ride.classList.add("ride-go");
      loopV.preload = "auto"; loopV.src = loopSrc; loopV.load();
    }, { once: true });
    rideV.addEventListener("timeupdate", function () {
      if (!landed && rideV.duration && rideV.currentTime >= rideV.duration - 0.12) toLoop();
    });
    rideV.addEventListener("ended", function () { toLoop(); });
    var p = rideV.play();
    if (p && p.catch) p.catch(function () { clearTimeout(fallback); ride.classList.add("ride-go"); setTimeout(function () { html.classList.add("skip-ride"); toLoop(true); }, 1200); });
    ride.addEventListener("click", function () { if (!landed) { ride.classList.add("ride-go"); toLoop(true); } });
  }

  /* ---------- sound: a low room hum and the clipper, made live in the browser ---------- */
  var actx = null, master = null, on = false;
  function buildAudio() {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    actx = new AC(); master = actx.createGain(); master.gain.value = 0; master.connect(actx.destination);
    var len = actx.sampleRate * 4, buf = actx.createBuffer(1, len, actx.sampleRate), data = buf.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) { var white = Math.random() * 2 - 1; last = (last + 0.02 * white) / 1.02; data[i] = last * 3.2; }
    var noise = actx.createBufferSource(); noise.buffer = buf; noise.loop = true;
    var lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 300;
    var ng = actx.createGain(); ng.gain.value = 0.32;
    noise.connect(lp); lp.connect(ng); ng.connect(master); noise.start();
    [[60, 0.018], [120, 0.01], [180, 0.004]].forEach(function (f) {
      var o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = f[0]; g.gain.value = f[1]; o.connect(g); g.connect(master); o.start();
    });
    var c1 = actx.createOscillator(), c2 = actx.createOscillator(); c1.type = "sawtooth"; c1.frequency.value = 118; c2.type = "square"; c2.frequency.value = 236;
    var bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2300; bp.Q.value = 0.9;
    var hp = actx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 650;
    var cg = actx.createGain(); cg.gain.value = 0;
    var lfo = actx.createOscillator(), lg = actx.createGain(); lfo.frequency.value = 7; lg.gain.value = 0.012; lfo.connect(lg); lg.connect(cg.gain); lfo.start();
    c1.connect(bp); c2.connect(bp); bp.connect(hp); hp.connect(cg); cg.connect(master); c1.start(); c2.start();
    (function burst() {
      var t = actx.currentTime, len = 1.4 + Math.random() * 2.4;
      cg.gain.cancelScheduledValues(t); cg.gain.setTargetAtTime(0.055, t, 0.04); cg.gain.setTargetAtTime(0, t + len, 0.09);
      setTimeout(burst, (len + 1.4 + Math.random() * 2.6) * 1000);
    })();
    return true;
  }
  function toggleSound() {
    var btn = $("#sound");
    if (!actx && !buildAudio()) return;
    on = !on;
    if (actx.state === "suspended") actx.resume();
    master.gain.setTargetAtTime(on ? 0.8 : 0, actx.currentTime, 0.35);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  }

  /* ---------- the sign and the live lines ---------- */
  var signLit = null, signSeen = false;
  function renderLive() {
    var d = K.now(), st = K.status(SHOP.hours, d), sign = $("#sign");
    var es = L.cur === "es";
    $("#signNow").textContent = es ? K.dayName(d) + ", " + K.time(d) : K.time(d) + ", " + K.dayName(d);
    $("#signLine").textContent = K.openLine(SHOP.hours, d);
    if (signLit !== st.open) {
      signLit = st.open;
      sign.classList.toggle("lit", st.open);
      if (st.open && signSeen && !K.reduce) { sign.classList.remove("igniting"); void sign.offsetWidth; sign.classList.add("igniting"); }
    }
    var vl = $("#visitLive"); vl.textContent = K.openLine(SHOP.hours, d); vl.classList.toggle("closed", !st.open);
    $("#hours").innerHTML = K.hoursRows(SHOP.hours).map(function (r) {
      return "<li" + (r.today ? ' class="today" aria-current="date"' : "") + '><span data-today="' + L.t("today") + '">' + r.label + "</span><span>" + r.text + "</span></li>";
    }).join("");
  }
  function watchSign() {
    var sign = $("#sign");
    if (!("IntersectionObserver" in window)) { signSeen = true; return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !signSeen) {
          signSeen = true;
          if (signLit && !K.reduce) { sign.classList.remove("lit"); setTimeout(function () { sign.classList.add("lit", "igniting"); }, 250); }
          io.disconnect();
        }
      });
    }, { threshold: 0.45 });
    io.observe(sign);
  }

  /* ---------- menu card and chairs ---------- */
  function renderCuts() {
    $("#cuts").innerHTML = CUTS.map(function (c) {
      return '<li><button type="button" class="cut" data-cut="' + c.id + '"><span class="cut-name">' + L.pick(c.label) + '</span><span class="cut-lead" aria-hidden="true"></span><span class="cut-price">' + c.price + '</span>' +
        (c.sub ? '<span class="cut-sub">' + L.pick(c.sub) + "</span>" : "") + "</button></li>";
    }).join("");
    $("#team").innerHTML = BARBERS.map(function (b) {
      return '<article class="barber rv"><picture><source type="image/avif" srcset="img/' + b.img + '-480.avif 480w, img/' + b.img + '-828.avif 828w, img/' + b.img + '-1136.avif 1136w" sizes="(min-width: 900px) 33vw, 100vw">' +
        '<img src="img/' + b.img + '-828.webp" width="1136" height="1408" alt="' + b.label + (L.cur === "es" ? ", barbero de Candil" : ", barber at Candil") + '" loading="lazy" decoding="async"></picture>' +
        '<div class="barber-text"><h3>' + b.label + '</h3><p class="sig">' + L.pick(b.sig) + '</p><button type="button" class="with" data-with="' + b.id + '">' + L.t("bookWith", { n: b.label }) + "</button></div></article>";
    }).join("");
    K.reveal();
  }

  /* ---------- before / after ---------- */
  function wireCompare() {
    var box = $("#compare"), range = $("#baRange"), dragging = false;
    var set = function (pct) { pct = Math.max(0, Math.min(100, pct)); box.style.setProperty("--x", pct + "%"); range.value = Math.round(pct); };
    var fromEvent = function (e) { var r = box.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); };
    box.addEventListener("pointerdown", function (e) { dragging = true; box.setPointerCapture(e.pointerId); fromEvent(e); });
    box.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
    box.addEventListener("pointerup", function () { dragging = false; });
    box.addEventListener("pointercancel", function () { dragging = false; });
    range.addEventListener("input", function () { set(+range.value); });
    if (K.reduce || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; io.disconnect();
      var t0 = null, keys = [[0, 50], [600, 26], [1300, 70], [1900, 50]];
      (function step(ts) {
        if (dragging) return;
        if (t0 == null) t0 = ts; var t = ts - t0, i = 1;
        while (i < keys.length && keys[i][0] < t) i++;
        if (i >= keys.length) { set(50); return; }
        var a = keys[i - 1], b = keys[i], k = (t - a[0]) / (b[0] - a[0]); k = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        set(a[1] + (b[1] - a[1]) * k); requestAnimationFrame(step);
      })(performance.now());
    }, { threshold: 0.6 });
    io.observe(box);
  }

  function boot() {
    Engine.init(SHOP);
    L.init(SHOP.id, DICT, (navigator.language || "").toLowerCase().indexOf("es") === 0 ? "es" : "en");
    var phone = function () { $("#phoneText").textContent = L.t("phoneLabel") + ": " + SHOP.phone; };
    L.on(function () { renderCuts(); renderLive(); phone(); });
    renderCuts(); renderLive(); phone();
    startRide(); watchSign(); wireCompare();
    $("#mapBtn").href = K.mapsUrl(SHOP.name, SHOP.address);
    $("#callBtn").href = K.telUrl(SHOP.phone);
    $("#googleLink").href = K.googleSearchUrl(SHOP.name + " barbers " + SHOP.address);
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-lang-btn]")) { L.toggle(); return; }
      if (e.target.closest("#sound")) { toggleSound(); return; }
      if (e.target.closest("#bookBtn")) { Engine.book(BOOK); return; }
      var c = e.target.closest("[data-cut]"); if (c) { Engine.book(BOOK, { what: c.dataset.cut }); return; }
      var w = e.target.closest("[data-with]"); if (w) { Engine.book(BOOK, { who: w.dataset.with }); return; }
    });
    var top = $("#top");
    new IntersectionObserver(function (es) { top.classList.toggle("solid", !es[0].isIntersecting); }, { rootMargin: "-60px 0px 0px 0px" }).observe($("#ride"));
    setInterval(renderLive, 30000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
