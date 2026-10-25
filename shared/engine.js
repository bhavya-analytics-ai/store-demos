/* engine.js: the booking and ordering engines shared by the three shops.
   One decision per screen; a receipt before paying; Stripe when config/stripe.js has keys, a labelled demo pay screen when it doesn't. */
(function () {
  "use strict";
  var K = window.Kit, L = K.Lang;

  /* ---------- engine words ---------- */
  var W = {
    en: {
      back: "Back", close: "Close", cont: "Continue", today: "Today", tomorrow: "Tomorrow", closed: "Closed",
      morning: "Morning", afternoon: "Afternoon", evening: "Evening", late: "After midnight",
      noTimes: "No times left this day. Pick another day.", taken: "taken",
      yourName: "Name for the booking", yourNameOrder: "Name for the order", namePh: "First name is fine",
      receiptBook: "Your booking", receiptOrder: "Your order",
      payTitle: "How do you want to pay?", deposit: "Deposit now", depositSub: "{bal} at the shop",
      full: "Pay in full", fullSub: "Nothing at the shop", hold: "Hold without paying", holdSub: "Pay at the shop",
      payNow: "Pay now", payNowSub: "Apple Pay, Google Pay or card", pickupPay: "Pay at pickup", pickupPaySub: "Cash or card at the counter",
      required: "Deposit required", requiredSub: "{why}",
      demoNote: "Demo checkout · no charge", demoCard: "This is the shop's own pay screen in demo mode. With Stripe connected, Apple Pay, Google Pay and card appear here.",
      payBtn: "Pay {amt}", processing: "Processing", paid: "Paid",
      holdBtn: "Confirm, pay at the shop", pickupBtn: "Place order, pay at pickup",
      booked: "You're booked.", ordered: "Order in.", heldNote: "Nothing charged. Pay at the shop.", paidNote: "{amt} paid.", paidDemoNote: "{amt} paid in demo mode. No money moved.",
      textShop: "Text it to {shop}", textOpened: "Messages opened. Press send so {shop} has it.",
      addCal: "Add to calendar", doneBtn: "Done", ref: "Reference", orderNo: "Order",
      bag: "Your bag", notes: "Notes", notesPh: "No onions, extra hot…", empty: "Your bag is empty. Add something from the menu.",
      pickupTitle: "When are you coming by?", asap: "As soon as it's ready", readyIn: "Ready in about {m} min", opensAt: "We open {when}",
      tipTitle: "Add a tip for the team", noTip: "No tip",
      subtotal: "Subtotal", tip: "Tip", total: "Total", dueNow: "Due now", atShop: "At the shop", tipAtPickup: "Tip at pickup",
      readyAt: "Ready at {t}", seeYou: "See you {when}.", pickupWhen: "Pickup {when}",
      remove: "Remove one", addOne: "Add one", err: "Payment didn't go through: {msg}. Try again or pick another option.",
      loadingPay: "Loading secure checkout", step: "Step {n} of {m}"
    },
    es: {
      back: "Atrás", close: "Cerrar", cont: "Seguir", today: "Hoy", tomorrow: "Mañana", closed: "Cerrado",
      morning: "Mañana", afternoon: "Tarde", evening: "Noche", late: "Madrugada",
      noTimes: "No quedan horarios ese día. Escoge otro.", taken: "ocupado",
      yourName: "¿A nombre de quién?", yourNameOrder: "¿A nombre de quién?", namePh: "Con tu nombre basta",
      receiptBook: "Tu cita", receiptOrder: "Tu pedido",
      payTitle: "¿Cómo vas a pagar?", deposit: "Depósito ahora", depositSub: "{bal} en el local",
      full: "Pagar completo", fullSub: "No pagas nada en el local", hold: "Apartar sin pagar", holdSub: "Pagas en el local",
      payNow: "Pagar ahora", payNowSub: "Apple Pay, Google Pay o tarjeta", pickupPay: "Pagar al recoger", pickupPaySub: "Efectivo o tarjeta en el mostrador",
      required: "Se requiere depósito", requiredSub: "{why}",
      demoNote: "Pago de prueba · no se cobra nada", demoCard: "Esta es la pantalla de pago del negocio en modo de prueba. Con Stripe conectado, aquí salen Apple Pay, Google Pay y tarjeta.",
      payBtn: "Pagar {amt}", processing: "Procesando", paid: "Pagado",
      holdBtn: "Confirmar, pago en el local", pickupBtn: "Hacer pedido, pago al recoger",
      booked: "¡Listo! Tu cita está hecha.", ordered: "¡Pedido hecho!", heldNote: "No se cobró nada. Pagas en el local.", paidNote: "{amt} pagado.", paidDemoNote: "{amt} pagado en modo de prueba. No se movió dinero.",
      textShop: "Mándaselo a {shop} por texto", textOpened: "Se abrió Mensajes. Dale a enviar para que {shop} lo tenga.",
      addCal: "Añadir al calendario", doneBtn: "Listo", ref: "Referencia", orderNo: "Pedido",
      bag: "Tu funda", notes: "Notas", notesPh: "Sin cebolla, bien caliente…", empty: "Tu funda está vacía. Escoge algo del menú.",
      pickupTitle: "¿A qué hora pasas?", asap: "Lo antes posible", readyIn: "Listo en unos {m} min", opensAt: "Abrimos {when}",
      tipTitle: "¿Le dejas propina al equipo?", noTip: "Sin propina",
      subtotal: "Subtotal", tip: "Propina", total: "Total", dueNow: "A pagar ahora", atShop: "En el local", tipAtPickup: "Propina al recoger",
      readyAt: "Listo a las {t}", seeYou: "Te esperamos {when}.", pickupWhen: "Recoges {when}",
      remove: "Quitar uno", addOne: "Añadir uno", err: "El pago no pasó: {msg}. Intenta otra vez o escoge otra opción.",
      loadingPay: "Cargando el pago seguro", step: "Paso {n} de {m}"
    }
  };
  function w(k, v) {
    var s = (W[L.cur] || W.en)[k]; if (s == null) s = W.en[k];
    if (v) s = s.replace(/\{(\w+)\}/g, function (m, n) { return v[n] != null ? v[n] : ""; });
    return s;
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function P(o) { return L.pick(o); }
  var ICON = {
    back: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    check: '<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" stroke-width="1.5"/><path class="e-tick" d="M20 33l8 8 16-18" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    minus: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="1.8"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14M12 5v14" stroke="currentColor" stroke-width="1.8"/></svg>'
  };

  var SHOP = null, root, panel, body, foot, titleEl, stepEl, backBtn, progressEl, lastFocus = null;
  var flow = null; /* {kind, cfg, steps, i, data} */

  /* ---------- cart ---------- */
  var Cart = {
    lines: {}, subs: [], menu: {},
    key: function () { return "cart:" + (SHOP ? SHOP.id : "x"); },
    load: function () { try { this.lines = JSON.parse(K.store.sget(this.key()) || "{}") || {}; } catch (e) { this.lines = {}; } },
    save: function () { K.store.sset(this.key(), JSON.stringify(this.lines)); this.subs.forEach(function (f) { f(); }); },
    setMenu: function (items) { var m = this.menu; items.forEach(function (it) { m[it.id] = it; }); },
    add: function (id, n) { this.lines[id] = (this.lines[id] || 0) + (n || 1); if (this.lines[id] <= 0) delete this.lines[id]; this.save(); },
    qty: function (id) { return this.lines[id] || 0; },
    count: function () { var c = 0; for (var k in this.lines) c += this.lines[k]; return c; },
    items: function () { var out = [], m = this.menu; for (var k in this.lines) if (m[k]) out.push({ item: m[k], qty: this.lines[k] }); return out; },
    subtotal: function () { return this.items().reduce(function (s, l) { return s + l.item.price * l.qty; }, 0); },
    clear: function () { this.lines = {}; this.save(); },
    on: function (f) { this.subs.push(f); }
  };

  /* ---------- the sheet ---------- */
  function build() {
    if (root) return;
    root = document.createElement("div");
    root.className = "eng"; root.hidden = true;
    root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.setAttribute("aria-labelledby", "eng-title");
    root.innerHTML =
      '<div class="eng-scrim" data-act="close"></div>' +
      '<div class="eng-panel">' +
        '<header class="eng-top">' +
          '<button type="button" class="eng-ic eng-back" data-act="back">' + ICON.back + '<span class="vh" data-w="back"></span></button>' +
          '<div class="eng-head"><p class="eng-kicker" id="eng-step"></p><h2 class="eng-title" id="eng-title" tabindex="-1"></h2></div>' +
          '<button type="button" class="eng-ic eng-close" data-act="close">' + ICON.close + '<span class="vh" data-w="close"></span></button>' +
        '</header>' +
        '<div class="eng-progress" aria-hidden="true"><i></i></div>' +
        '<div class="eng-body"></div>' +
        '<footer class="eng-foot"></footer>' +
      '</div>';
    document.body.appendChild(root);
    panel = root.querySelector(".eng-panel"); body = root.querySelector(".eng-body"); foot = root.querySelector(".eng-foot");
    titleEl = root.querySelector(".eng-title"); stepEl = root.querySelector(".eng-kicker"); backBtn = root.querySelector(".eng-back");
    progressEl = root.querySelector(".eng-progress i");
    root.addEventListener("click", onClick);
    root.addEventListener("input", onInput);
    root.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
      if (e.key === "Tab") trap(e);
    });
    L.on(function () { if (!root.hidden && flow) render(false); });
  }
  function trap(e) {
    var f = panel.querySelectorAll('button:not([disabled]),input,textarea,a[href],[tabindex="0"]');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function open() {
    build();
    lastFocus = document.activeElement;
    root.hidden = false;
    document.documentElement.classList.add("eng-lock");
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add("on"); }); });
  }
  function close() {
    if (!root || root.hidden) return;
    root.classList.remove("on");
    document.documentElement.classList.remove("eng-lock");
    setTimeout(function () { root.hidden = true; body.innerHTML = ""; foot.innerHTML = ""; if (lastFocus && lastFocus.focus) lastFocus.focus(); }, 520);
    if (flow && flow.done && flow.kind === "order") Cart.clear();
    flow = null;
  }

  /* ---------- flow driver ---------- */
  function start(kind, cfg, preset) {
    SHOP = SHOP || window.SHOP;
    flow = { kind: kind, cfg: cfg, i: 0, data: Object.assign({}, preset || {}), done: false, paidMode: null };
    flow.steps = cfg.steps.filter(function (s) { return !(preset && preset[s.id] != null && s.type === "pick"); });
    open();
    render(true);
  }
  function step() { return flow.steps[flow.i]; }
  function go(delta) {
    var ni = flow.i + delta;
    if (ni < 0) { close(); return; }
    if (ni >= flow.steps.length) return;
    flow.i = ni;
    render(true, delta);
  }
  function render(animate, dir) {
    var s = step(), cfg = flow.cfg;
    var visible = flow.steps.filter(function (x) { return x.type !== "done"; }).length;
    var n = Math.min(flow.i + 1, visible);
    stepEl.textContent = s.type === "done" ? P(cfg.title) : w("step", { n: n, m: visible });
    titleEl.textContent = stepTitle(s);
    backBtn.style.visibility = (flow.i === 0 || s.type === "done") ? "hidden" : "visible";
    progressEl.style.transform = "scaleX(" + (s.type === "done" ? 1 : (flow.i + 1) / (visible + 1)) + ")";
    root.querySelectorAll("[data-w]").forEach(function (el) { el.textContent = w(el.dataset.w); });
    var html = SCREENS[s.type](s, cfg, flow.data);
    var screen = document.createElement("section");
    screen.className = "eng-screen" + (animate ? " enter" + (dir < 0 ? " back" : "") : "");
    screen.innerHTML = html;
    var old = body.querySelector(".eng-screen");
    if (old && animate) { old.classList.add("leave"); setTimeout(function () { old.remove(); }, 380); body.appendChild(screen); }
    else { body.innerHTML = ""; body.appendChild(screen); }
    if (animate) { body.scrollTop = 0; requestAnimationFrame(function () { requestAnimationFrame(function () { screen.classList.remove("enter"); }); }); }
    foot.innerHTML = footFor(s, cfg, flow.data);
    if (s.after) s.after(screen, flow.data);
    if (AFTER[s.type]) AFTER[s.type](screen, s, cfg, flow.data);
    if (animate) setTimeout(function () { titleEl.focus({ preventScroll: true }); }, 60);
  }
  function stepTitle(s) {
    if (s.type === "done") return flow.cfg.doneTitle ? P(flow.cfg.doneTitle) : flow.kind === "order" ? w("ordered") : w("booked");
    if (s.type === "bag") return w("bag");
    if (s.type === "pickup") return w("pickupTitle");
    if (s.type === "tip") return w("tipTitle");
    if (s.type === "summary") return flow.cfg.summaryTitle ? P(flow.cfg.summaryTitle) : flow.kind === "order" ? w("receiptOrder") : w("receiptBook");
    if (s.type === "pay") return w("payTitle");
    return P(s.title);
  }
  function footFor(s, cfg, d) {
    var t = s.type;
    if (t === "pick" || t === "day" || t === "time") return "";
    if (t === "bag") return '<button type="button" class="eng-cta" data-act="next"' + (Cart.count() ? "" : " disabled") + ">" + esc(w("cont")) + "</button>";
    if (t === "pickup") return '<button type="button" class="eng-cta" data-act="next"' + (d.pickup ? "" : " disabled") + ">" + esc(w("cont")) + "</button>";
    if (t === "tip") return '<button type="button" class="eng-cta" data-act="next">' + esc(w("cont")) + "</button>";
    if (t === "summary") return '<button type="button" class="eng-cta" data-act="next"' + ((d.name || "").trim().length > 1 ? "" : " disabled") + ">" + esc(w("cont")) + "</button>";
    if (t === "pay") return '<button type="button" class="eng-cta" data-act="pay">' + esc(payLabel(cfg, d)) + "</button>";
    if (t === "done") return '<button type="button" class="eng-cta ghost" data-act="close">' + esc(w("doneBtn")) + "</button>";
    return "";
  }

  /* ---------- money for the current flow ---------- */
  function totals(cfg, d) {
    if (flow.kind === "order") {
      var sub = Cart.subtotal(), tip = Math.round(sub * (d.tip || 0) * 100) / 100;
      return { sub: sub, tip: tip, total: sub + tip };
    }
    var price = cfg.price ? cfg.price(d) : 0;
    return { sub: price, tip: 0, total: price };
  }
  function payOptions(cfg, d) {
    var t = totals(cfg, d), payments = SHOP.payments !== false;
    if (flow.kind === "order") {
      var o = [];
      if (payments) o.push({ id: "now", amount: t.total, label: w("payNow"), sub: w("payNowSub") });
      o.push({ id: "pickup", amount: 0, label: w("pickupPay"), sub: w("pickupPaySub") });
      return o;
    }
    return cfg.payOptions(d, t, payments);
  }
  function payLabel(cfg, d) {
    var opt = currentPayOpt(cfg, d);
    if (!opt) return w("cont");
    if (opt.amount > 0) return w("payBtn", { amt: K.money(opt.amount) });
    return flow.kind === "order" ? w("pickupBtn") : (cfg.holdLabel ? P(cfg.holdLabel) : w("holdBtn"));
  }
  function currentPayOpt(cfg, d) {
    var opts = payOptions(cfg, d);
    var sel = opts.filter(function (o) { return o.id === d.payOpt; })[0];
    if (!sel) { sel = opts[0]; d.payOpt = sel && sel.id; }
    return sel;
  }

  /* ---------- slots ---------- */
  function daySlots(cfg, d, day) {
    var win = cfg.window ? cfg.window(day, d) : null;
    if (!win) {
      var h = SHOP.hours[day.getDay()]; if (!h) return [];
      win = [h[0], h[1] - (cfg.slotMins ? cfg.slotMins(d) : 30)];
    }
    var stepM = cfg.step || 15, lead = cfg.lead || 60, now = K.now(), out = [];
    for (var m = win[0]; m <= win[1]; m += stepM) {
      var t = K.atMinutes(day, m);
      if (t.getTime() < now.getTime() + lead * 60000) continue;
      var taken = cfg.taken ? cfg.taken(t, d) : false;
      out.push({ at: t, taken: taken });
    }
    return out;
  }
  function pickupSlots(cfg) {
    var now = K.now(), lead = cfg.lead || 15, stepM = cfg.step || 15, out = [], st = K.status(SHOP.hours, now);
    var win = cfg.pickupHours || SHOP.hours;
    var list = K.intervals(win, now, 7).filter(function (i) { return i.end > now; });
    if (!list.length) return out;
    var first = list[0];
    var openNow = now >= first.start && now < first.end;
    var t = new Date(Math.max(now.getTime() + lead * 60000, first.start.getTime() + lead * 60000));
    t.setSeconds(0, 0);
    var mm = t.getMinutes(); t.setMinutes(Math.ceil(mm / stepM) * stepM);
    if (openNow) out.push({ asap: true, at: new Date(now.getTime() + lead * 60000) });
    while (t < first.end && out.length < 24) { out.push({ at: new Date(t) }); t = new Date(t.getTime() + stepM * 60000); }
    return out;
  }

  /* ---------- screens ---------- */
  var SCREENS = {
    pick: function (s, cfg, d) {
      var opts = typeof s.options === "function" ? s.options(d) : s.options;
      return '<div class="e-list' + (s.compact ? " compact" : "") + '">' + opts.map(function (o) {
        var on = d[s.id] === o.id ? " on" : "";
        return '<button type="button" class="e-row' + on + '" data-pick="' + esc(o.id) + '">' +
          (o.img ? '<img class="e-thumb" src="' + esc(o.img) + '" alt="" width="56" height="70" loading="lazy">' : "") +
          '<span class="e-row-text"><span class="e-row-main">' + esc(P(o.label)) + "</span>" +
          (o.sub ? '<span class="e-row-sub">' + esc(P(o.sub)) + "</span>" : "") + "</span>" +
          (o.end ? '<span class="e-row-end">' + esc(P(o.end)) + "</span>" : "") +
          "</button>";
      }).join("") + "</div>" + (s.note ? '<p class="e-note">' + esc(P(s.note)) + "</p>" : "");
    },
    day: function (s, cfg, d) {
      var today = K.startOfDay(K.now());
      var month = today.toLocaleDateString(L.cur === "es" ? "es-US" : "en-US", { month: "long", year: "numeric" });
      var html = '<p class="e-lead e-month">' + esc(month.charAt(0).toUpperCase() + month.slice(1)) + '</p><div class="e-days" role="list">';
      for (var i = 0; i < (s.days || 14); i++) {
        var day = K.addDays(today, i), slots = daySlots(cfg, d, day), free = slots.filter(function (x) { return !x.taken; }).length;
        var shut = !SHOP.hours[day.getDay()] || (cfg.window && !cfg.window(day, d));
        var dis = shut || !free, on = d.day && K.sameDay(d.day, day) ? " on" : "";
        var top = i === 0 ? w("today") : i === 1 ? w("tomorrow") : K.dayShort(day);
        html += '<button type="button" role="listitem" class="e-day' + on + '" data-day="' + day.getTime() + '"' + (dis ? " disabled" : "") + ">" +
          '<span class="e-day-top">' + esc(top) + "</span>" +
          '<span class="e-day-num">' + day.getDate() + "</span>" +
          '<span class="e-day-sub">' + esc(shut ? w("closed") : free ? (L.cur === "es" ? free + " libres" : free + " open") : w("closed")) + "</span>" +
          "</button>";
      }
      return html + "</div>" + (s.note ? '<p class="e-note">' + esc(P(s.note)) + "</p>" : "");
    },
    time: function (s, cfg, d) {
      var slots = daySlots(cfg, d, d.day);
      var head = '<p class="e-lead">' + esc(K.sameDay(d.day, K.now()) ? w("today") : K.dateShort(d.day)) + "</p>";
      if (!slots.length) return head + '<p class="e-note">' + esc(w("noTimes")) + "</p>";
      var groups = [["morning", 0, 12], ["afternoon", 12, 17], ["evening", 17, 24], ["late", 24, 30]], html = head;
      groups.forEach(function (g) {
        var inG = slots.filter(function (x) {
          var h = x.at.getHours() + (K.sameDay(x.at, d.day) ? 0 : 24);
          return h >= g[1] && h < g[2];
        });
        if (!inG.length) return;
        html += '<h3 class="e-group">' + esc(w(g[0])) + '</h3><div class="e-slots">' + inG.map(function (x) {
          var on = d.time && d.time.getTime() === x.at.getTime() ? " on" : "";
          return '<button type="button" class="e-slot' + on + '" data-time="' + x.at.getTime() + '"' + (x.taken ? ' disabled aria-label="' + esc(K.clock(x.at) + " " + K.ampm(x.at) + ", " + w("taken")) + '"' : "") + ">" +
            esc(K.clock(x.at)) + '<small>' + esc(K.ampm(x.at)) + "</small></button>";
        }).join("") + "</div>";
      });
      return html;
    },
    bag: function (s, cfg, d) {
      var items = Cart.items();
      if (!items.length) return '<p class="e-note">' + esc(w("empty")) + "</p>";
      return '<div class="e-bag">' + items.map(function (l) {
        return '<div class="e-line"><div class="e-line-text"><span class="e-line-name">' + esc(P(l.item.name)) + '</span><span class="e-line-price">' + esc(K.money(l.item.price * l.qty)) + "</span></div>" +
          '<div class="e-qty"><button type="button" class="e-qbtn" data-qty="' + esc(l.item.id) + '" data-n="-1">' + ICON.minus + '<span class="vh">' + esc(w("remove")) + "</span></button>" +
          '<output class="e-qn" aria-live="polite">' + l.qty + "</output>" +
          '<button type="button" class="e-qbtn" data-qty="' + esc(l.item.id) + '" data-n="1">' + ICON.plus + '<span class="vh">' + esc(w("addOne")) + "</span></button></div></div>";
      }).join("") + "</div>" +
        '<div class="e-sum-line"><span>' + esc(w("subtotal")) + "</span><span>" + esc(K.money(Cart.subtotal())) + "</span></div>" +
        '<label class="e-field"><span>' + esc(w("notes")) + '</span><textarea id="eng-notes" rows="2" data-field="notes" placeholder="' + esc(w("notesPh")) + '">' + esc(d.notes || "") + "</textarea></label>";
    },
    pickup: function (s, cfg, d) {
      var slots = pickupSlots(cfg);
      if (!slots.length) return '<p class="e-note">' + esc(w("closed")) + "</p>";
      var first = slots[slots.length - 1].at, label = K.sameDay(first, K.now()) ? w("today") : K.sameDay(first, K.addDays(K.now(), 1)) ? w("tomorrow") : K.dateShort(first);
      var html = '<p class="e-lead">' + esc(label) + '</p><div class="e-strip" role="list">';
      html += slots.map(function (x) {
        var id = x.asap ? "asap" : String(x.at.getTime());
        var on = d.pickup && d.pickup.id === id ? " on" : "";
        if (x.asap) return '<button type="button" role="listitem" class="e-chip wide' + on + '" data-pickup="asap" data-at="' + x.at.getTime() + '"><span class="e-chip-big">' + esc(w("asap")) + '</span><span class="e-chip-sub">' + esc(w("readyIn", { m: cfg.lead || 15 })) + "</span></button>";
        return '<button type="button" role="listitem" class="e-chip' + on + '" data-pickup="' + id + '" data-at="' + x.at.getTime() + '"><span class="e-chip-big">' + esc(K.clock(x.at)) + '</span><span class="e-chip-sub">' + esc(K.ampm(x.at)) + "</span></button>";
      }).join("");
      return html + "</div>";
    },
    tip: function (s, cfg, d) {
      var sub = Cart.subtotal(), tips = cfg.tips || [0, 0.1, 0.15, 0.2];
      if (d.tip == null) d.tip = tips[2] != null ? tips[2] : 0;
      return '<div class="e-tips">' + tips.map(function (p) {
        var on = d.tip === p ? " on" : "";
        return '<button type="button" class="e-tipb' + on + '" data-tip="' + p + '"><span class="e-chip-big">' + (p ? Math.round(p * 100) + "%" : esc(w("noTip"))) + '</span><span class="e-chip-sub">' + (p ? esc(K.money(Math.round(sub * p * 100) / 100)) : "&nbsp;") + "</span></button>";
      }).join("") + "</div>";
    },
    summary: function (s, cfg, d) {
      var t = totals(cfg, d), rows = flow.kind === "order" ? orderReceipt(cfg, d, t) : cfg.receipt(d, t);
      var html = '<div class="e-receipt"><p class="e-r-shop">' + esc(SHOP.name) + '</p><p class="e-r-addr">' + esc(SHOP.address) + "</p><dl>";
      rows.forEach(function (r) {
        if (r === "rule") { html += '<div class="e-r-rule" aria-hidden="true"></div>'; return; }
        html += '<div class="e-r-row' + (r[2] ? " " + r[2] : "") + '"><dt>' + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>";
      });
      html += "</dl></div>";
      html += '<label class="e-field"><span>' + esc(flow.kind === "order" ? w("yourNameOrder") : w("yourName")) + '</span><input id="eng-name" data-field="name" autocomplete="given-name" enterkeyhint="done" placeholder="' + esc(w("namePh")) + '" value="' + esc(d.name || "") + '"></label>';
      return html;
    },
    pay: function (s, cfg, d) {
      var opts = payOptions(cfg, d), sel = currentPayOpt(cfg, d), html = "";
      if (opts.length > 1 || opts[0].locked) {
        html += '<div class="e-opts" role="radiogroup">' + opts.map(function (o) {
          var on = sel && sel.id === o.id;
          return '<button type="button" role="radio" aria-checked="' + on + '" class="e-opt' + (on ? " on" : "") + '" data-opt="' + esc(o.id) + '">' +
            '<span class="e-opt-dot" aria-hidden="true"></span><span class="e-row-text"><span class="e-row-main">' + esc(o.label) + "</span>" +
            (o.sub ? '<span class="e-row-sub">' + esc(o.sub) + "</span>" : "") + "</span>" +
            '<span class="e-row-end">' + (o.amount ? esc(K.money(o.amount)) : "") + "</span></button>";
        }).join("") + "</div>";
      }
      if (sel && sel.amount > 0) {
        if (stripeOn()) html += '<div class="e-stripe"><div id="e-express"></div><div id="e-card"></div><p class="e-note e-paystate">' + esc(w("loadingPay")) + "</p></div>";
        else html += '<div class="e-demo"><p class="e-demo-amt">' + esc(K.money(sel.amount)) + '</p><p class="e-demo-note">' + esc(w("demoNote")) + '</p><p class="e-note">' + esc(w("demoCard")) + "</p></div>";
      }
      html += '<p class="e-err" role="alert" hidden></p>';
      return html;
    },
    done: function (s, cfg, d) {
      var isOrder = flow.kind === "order";
      var big = isOrder ? "#" + d.ref : d.ref;
      var when = isOrder ? (d.pickup && d.pickup.id === "asap" ? w("readyIn", { m: cfg.lead || 15 }) : w("readyAt", { t: K.time(d.pickupAt) })) : w("seeYou", { when: whenWords(d.time) });
      var paidLine = flow.paidMode === "hold" ? w("heldNote") : flow.paidMode === "demo" ? w("paidDemoNote", { amt: K.money(d.paidAmount) }) : w("paidNote", { amt: K.money(d.paidAmount) });
      var html = '<div class="e-done"><div class="e-done-mark">' + ICON.check + '</div>' +
        '<p class="e-done-label">' + esc(isOrder ? w("orderNo") : w("ref")) + '</p><p class="e-done-ref">' + esc(big) + "</p>" +
        '<p class="e-done-when">' + esc(when) + "</p>" +
        '<p class="e-done-paid">' + esc(paidLine) + "</p></div>" +
        '<div class="e-actions">' +
          '<a class="eng-cta" data-act="sms" href="' + esc(K.smsUrl(SHOP.phone, smsBody(cfg, d))) + '">' + esc(w("textShop", { shop: SHOP.name })) + "</a>" +
          (!isOrder ? '<button type="button" class="eng-cta ghost" data-act="ics">' + esc(w("addCal")) + "</button>" : "") +
        '</div><p class="e-note e-sent" aria-live="polite"></p>';
      return html;
    }
  };
  var AFTER = {
    pay: function (screen, s, cfg, d) {
      var sel = currentPayOpt(cfg, d);
      if (sel && sel.amount > 0 && stripeOn()) mountStripe(screen, sel.amount, cfg, d);
    },
    day: function (screen) {
      var on = screen.querySelector(".e-day.on"); if (on) on.scrollIntoView({ inline: "center", block: "nearest" });
    }
  };
  function whenWords(t) {
    var n = K.now();
    if (K.sameDay(t, n)) return L.cur === "es" ? "hoy a " + K.esHour(t) : "today at " + K.time(t);
    if (K.sameDay(t, K.addDays(n, 1))) return L.cur === "es" ? "mañana a " + K.esHour(t) : "tomorrow at " + K.time(t);
    return L.cur === "es" ? "el " + K.dayName(t) + " " + t.getDate() + " a " + K.esHour(t) : K.dayName(t) + ", " + K.dateShort(t).split(", ")[1] + " at " + K.time(t);
  }
  function orderReceipt(cfg, d, t) {
    var rows = Cart.items().map(function (l) { return [l.qty + " × " + P(l.item.name), K.money(l.item.price * l.qty)]; });
    rows.push("rule");
    rows.push([w("subtotal"), K.money(t.sub)]);
    rows.push([w("tip") + (d.tip ? " " + Math.round(d.tip * 100) + "%" : ""), K.money(t.tip)]);
    rows.push([w("total"), K.money(t.total), "strong"]);
    rows.push("rule");
    rows.push([P({ en: "Pickup", es: "Recoges" }), d.pickup && d.pickup.id === "asap" ? w("readyIn", { m: cfg.lead || 15 }) : K.dateShort(d.pickupAt) + ", " + K.time(d.pickupAt)]);
    if (d.notes) rows.push([w("notes"), d.notes]);
    return rows;
  }
  function smsBody(cfg, d) {
    if (flow.kind === "order") {
      var t = totals(cfg, d), lines = [];
      lines.push((L.cur === "es" ? "Pedido para recoger " : "Pickup order ") + "#" + d.ref + " · " + SHOP.name);
      Cart.items().forEach(function (l) { lines.push(l.qty + " × " + P(l.item.name) + "  " + K.money(l.item.price * l.qty)); });
      lines.push(w("total") + ": " + K.money(t.total) + (d.tip ? " (" + w("tip").toLowerCase() + " " + K.money(t.tip) + ")" : ""));
      lines.push(d.pickup && d.pickup.id === "asap" ? w("asap") : w("pickupWhen", { when: K.dateShort(d.pickupAt) + ", " + K.time(d.pickupAt) }));
      lines.push(paidWords(d));
      if (d.notes) lines.push(w("notes") + ": " + d.notes);
      lines.push((L.cur === "es" ? "Nombre: " : "Name: ") + d.name);
      return lines.join("\n");
    }
    return cfg.sms(d, paidWords(d));
  }
  function paidWords(d) {
    var es = L.cur === "es";
    if (flow.paidMode === "hold") return flow.kind === "order" ? (es ? "Paga al recoger" : "Pays at pickup") : (es ? "Paga en el local" : "Pays at the shop");
    var amt = K.money(d.paidAmount);
    return (es ? "Pagado: " : "Paid: ") + amt + (flow.paidMode === "demo" ? (es ? " (prueba)" : " (demo)") : "");
  }

  /* ---------- events ---------- */
  function onClick(e) {
    var b = e.target.closest("[data-act],[data-pick],[data-day],[data-time],[data-qty],[data-pickup],[data-tip],[data-opt]");
    if (!b || b.disabled) return;
    var d = flow ? flow.data : null, s = flow ? step() : null, act = b.dataset.act;
    if (act === "close") { close(); return; }
    if (!flow) return;
    if (act === "back") { go(-1); return; }
    if (act === "next") { go(1); return; }
    if (act === "pay") { pay(b); return; }
    if (act === "sms") { var sent = root.querySelector(".e-sent"); if (sent) sent.textContent = w("textOpened", { shop: SHOP.name }); return; }
    if (act === "ics") { K.addToCalendar(flow.cfg.calendar(d), SHOP.id + "-" + d.ref + ".ics"); return; }
    if (b.dataset.pick) { d[s.id] = b.dataset.pick; mark(b); later(function () { go(1); }); return; }
    if (b.dataset.day) { d.day = new Date(+b.dataset.day); d.time = null; mark(b); later(function () { go(1); }); return; }
    if (b.dataset.time) { d.time = new Date(+b.dataset.time); mark(b); later(function () { go(1); }); return; }
    if (b.dataset.qty) { Cart.add(b.dataset.qty, +b.dataset.n); render(false); return; }
    if (b.dataset.pickup) { d.pickup = { id: b.dataset.pickup }; d.pickupAt = new Date(+b.dataset.at); mark(b); foot.innerHTML = footFor(s, flow.cfg, d); return; }
    if (b.dataset.tip) { d.tip = +b.dataset.tip; mark(b); return; }
    if (b.dataset.opt) { d.payOpt = b.dataset.opt; render(false); return; }
  }
  function mark(b) {
    var p = b.parentElement; p.querySelectorAll(".on").forEach(function (x) { x.classList.remove("on"); });
    b.classList.add("on");
  }
  function later(f) { setTimeout(f, K.reduce ? 0 : 260); }
  function onInput(e) {
    var f = e.target.dataset.field; if (!f || !flow) return;
    flow.data[f] = e.target.value;
    if (f === "name") { var c = foot.querySelector(".eng-cta"); if (c) c.disabled = e.target.value.trim().length < 2; }
  }

  /* ---------- paying ---------- */
  function stripeOn() {
    var c = window.STRIPE_CONFIG || {};
    return SHOP.payments !== false && !!c.publishableKey && !!c.endpoint;
  }
  var stripeCtl = null;
  function finish(mode, amount) {
    var d = flow.data;
    flow.paidMode = mode; d.paidAmount = amount;
    d.ref = flow.kind === "order" ? String(100 + (K.hash(String(Date.now())) % 900)) : refCode(flow.cfg.refPrefix || "REF");
    flow.done = true;
    flow.i = flow.steps.length - 1;
    render(true, 1);
  }
  function refCode(prefix) {
    var a = "ACDEFGHJKMNPQRTUVWXY34679", h = K.hash(prefix + Date.now() + Math.random()), s = "";
    for (var i = 0; i < 4; i++) { s += a[h % a.length]; h = Math.floor(h / a.length) + 7919 * (i + 1); }
    return prefix + "-" + s;
  }
  function pay(btn) {
    var cfg = flow.cfg, d = flow.data, sel = currentPayOpt(cfg, d);
    var err = root.querySelector(".e-err");
    if (!sel || sel.amount <= 0) { finish("hold", 0); return; }
    btn.disabled = true;
    btn.classList.add("busy");
    btn.textContent = w("processing");
    if (!stripeOn()) {
      setTimeout(function () { btn.textContent = w("paid"); btn.classList.remove("busy"); btn.classList.add("ok"); setTimeout(function () { finish("demo", sel.amount); }, 650); }, K.reduce ? 300 : 1300);
      return;
    }
    if (!stripeCtl) { btn.disabled = false; btn.classList.remove("busy"); btn.textContent = payLabel(cfg, d); return; }
    stripeCtl.confirm().then(function () { finish("paid", sel.amount); }).catch(function (e) {
      btn.disabled = false; btn.classList.remove("busy"); btn.textContent = payLabel(cfg, d);
      if (err) { err.hidden = false; err.textContent = w("err", { msg: (e && e.message) || "error" }); }
    });
  }
  function loadStripeJs() {
    return new Promise(function (res, rej) {
      if (window.Stripe) return res();
      var s = document.createElement("script");
      s.src = "https://js.stripe.com/v3/"; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  function mountStripe(screen, amount, cfg, d) {
    var c = window.STRIPE_CONFIG, state = screen.querySelector(".e-paystate");
    stripeCtl = null;
    var cs = getComputedStyle(root);
    loadStripeJs().then(function () {
      return fetch(c.endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(amount * 100), currency: "usd", shop: SHOP.id, description: SHOP.name + " " + (flow.kind === "order" ? "order" : "booking") })
      }).then(function (r) { return r.json(); });
    }).then(function (j) {
      var stripe = window.Stripe(c.publishableKey);
      var elements = stripe.elements({
        clientSecret: j.clientSecret,
        appearance: { theme: cfg.stripeTheme || "night", variables: { colorPrimary: cs.getPropertyValue("--e-accent").trim() || "#c9a46a", borderRadius: "4px" } }
      });
      var confirm = function () {
        return stripe.confirmPayment({ elements: elements, redirect: "if_required", confirmParams: { return_url: location.href.split("#")[0] } })
          .then(function (r) { if (r.error) throw r.error; return r.paymentIntent; });
      };
      var express = elements.create("expressCheckout", { buttonHeight: 52 });
      express.mount(screen.querySelector("#e-express"));
      express.on("confirm", function () { confirm().then(function () { finish("paid", amount); }).catch(function (e) { var er = root.querySelector(".e-err"); if (er) { er.hidden = false; er.textContent = w("err", { msg: e.message }); } }); });
      elements.create("payment", { layout: "tabs" }).mount(screen.querySelector("#e-card"));
      stripeCtl = { confirm: confirm };
      if (state) state.remove();
    }).catch(function (e) {
      if (state) state.textContent = w("err", { msg: (e && e.message) || "Stripe" });
    });
  }

  window.Engine = {
    init: function (shop, menuItems) {
      SHOP = shop; Cart.load();
      if (menuItems) Cart.setMenu(menuItems);
      build();
    },
    book: function (cfg, preset) { start("book", cfg, preset); },
    order: function (cfg) { start("order", cfg, {}); },
    cart: Cart, close: close
  };
})();
