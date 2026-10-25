/* kit.js: clock, language, hours, links and calendar helpers shared by the three shops. */
(function () {
  "use strict";
  var qs = new URLSearchParams(location.search);

  /* ---------- clock: the phone's own time, or ?t=2026-10-25T08:00 to test ---------- */
  var tParam = qs.get("t");
  var offset = 0;
  if (tParam) {
    var target = new Date(tParam);
    if (!isNaN(target)) offset = target.getTime() - Date.now();
  }
  var preview = null; /* a moment chosen on the page ("see it at 8 PM"), or null for the live clock */
  function now() { return preview ? new Date(preview.getTime()) : new Date(Date.now() + offset); }
  function setPreview(d) { preview = d ? new Date(d) : null; }

  /* ---------- storage that never throws ---------- */
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sget: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- language ---------- */
  var Lang = {
    cur: "en", dict: { en: {}, es: {} }, key: "lang", subs: [],
    init: function (siteId, dict, fallback) {
      this.key = "lang:" + siteId;
      this.dict = dict;
      var forced = qs.get("lang");
      this.cur = (forced === "en" || forced === "es") ? forced : (store.get(this.key) || fallback || "en");
      this.apply();
    },
    set: function (l) { this.cur = l; store.set(this.key, l); this.apply(); },
    toggle: function () { this.set(this.cur === "en" ? "es" : "en"); },
    t: function (k, vars) {
      var d = this.dict[this.cur] || {}, v = d[k];
      if (v === undefined) v = (this.dict.en || {})[k];
      if (v === undefined) return k;
      if (typeof v === "function") return v(vars || {});
      if (vars) v = v.replace(/\{(\w+)\}/g, function (m, n) { return vars[n] != null ? vars[n] : ""; });
      return v;
    },
    pick: function (o) { return (o && typeof o === "object") ? (o[this.cur] != null ? o[this.cur] : o.en) : o; },
    apply: function () {
      var self = this;
      document.documentElement.lang = this.cur;
      document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = self.t(el.dataset.i18n); });
      document.querySelectorAll("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", self.t(el.dataset.i18nAria)); });
      document.querySelectorAll("[data-i18n-alt]").forEach(function (el) { el.setAttribute("alt", self.t(el.dataset.i18nAlt)); });
      document.querySelectorAll("[data-i18n-ph]").forEach(function (el) { el.setAttribute("placeholder", self.t(el.dataset.i18nPh)); });
      document.querySelectorAll("[data-lang-btn]").forEach(function (el) {
        el.textContent = self.cur === "en" ? "ES" : "EN";
        el.setAttribute("aria-label", self.cur === "en" ? "Ver en español" : "View in English");
      });
      this.subs.forEach(function (f) { f(self.cur); });
    },
    on: function (f) { this.subs.push(f); }
  };

  /* ---------- time words ---------- */
  var DAYS = {
    en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
  };
  var DAYS_SHORT = {
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    es: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"]
  };
  var MONTHS_SHORT = {
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
  };
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* 8 PM, 8:30 PM / 8 p. m. */
  function time(d, lang) {
    lang = lang || Lang.cur;
    var h = d.getHours(), m = d.getMinutes(), hh = h % 12 || 12;
    var mm = m ? ":" + pad(m) : "";
    if (lang === "es") return hh + mm + (h < 12 ? " a. m." : " p. m.");
    return hh + mm + (h < 12 ? " AM" : " PM");
  }
  /* clock time with minutes always, for slot grids: 3:15 */
  function clock(d) { return (d.getHours() % 12 || 12) + ":" + pad(d.getMinutes()); }
  function ampm(d, lang) { return (lang || Lang.cur) === "es" ? (d.getHours() < 12 ? "a. m." : "p. m.") : (d.getHours() < 12 ? "AM" : "PM"); }

  /* Spanish the way a shop says it: "las 8 de la noche", "la 1 de la tarde" */
  function esHour(d) {
    var h = d.getHours(), m = d.getMinutes(), hh = h % 12 || 12;
    var art = hh === 1 ? "la " : "las ";
    var part = h < 12 ? "de la mañana" : h < 19 ? "de la tarde" : "de la noche";
    return art + hh + (m ? ":" + pad(m) : "") + " " + part;
  }
  function dayName(d, lang) { return DAYS[lang || Lang.cur][d.getDay()]; }
  function dayShort(d, lang) { return DAYS_SHORT[lang || Lang.cur][d.getDay()]; }
  function dateShort(d, lang) {
    lang = lang || Lang.cur;
    return lang === "es" ? dayShort(d, lang) + " " + d.getDate() + " " + MONTHS_SHORT.es[d.getMonth()]
                         : dayShort(d, lang) + ", " + MONTHS_SHORT.en[d.getMonth()] + " " + d.getDate();
  }
  function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function atMinutes(day, mins) { var x = startOfDay(day); x.setHours(0, mins, 0, 0); return x; }

  /* ---------- hours ----------
     hours[dow] = [openMinutes, closeMinutes] or null; close may pass 1440 (after midnight). */
  function intervals(hours, from, days) {
    var out = [];
    for (var k = -1; k <= days; k++) {
      var day = addDays(startOfDay(from), k), h = hours[day.getDay()];
      if (!h) continue;
      out.push({ day: day, dow: day.getDay(), start: atMinutes(day, h[0]), end: atMinutes(day, h[1]) });
    }
    return out;
  }
  function status(hours, d) {
    d = d || now();
    var list = intervals(hours, d, 8), cur = null, next = null;
    for (var i = 0; i < list.length; i++) {
      if (d >= list[i].start && d < list[i].end) cur = list[i];
      if (!next && list[i].start > d) next = list[i];
    }
    return { open: !!cur, cur: cur, next: next, closesAt: cur && cur.end, opensAt: next && next.start, opDow: cur ? cur.dow : d.getDay() };
  }
  /* the day whose row is "today": past midnight inside last night's hours, it is still last night */
  function operatingDow(hours, d) {
    d = d || now();
    var y = addDays(startOfDay(d), -1), h = hours[y.getDay()];
    if (h && h[1] > 1440 && d < atMinutes(y, h[1])) return y.getDay();
    return d.getDay();
  }

  /* "Open until 8 tonight" / "Abierto hasta las 8 de la noche" and the closed forms */
  function openLine(hours, d, lang) {
    d = d || now(); lang = lang || Lang.cur;
    var s = status(hours, d);
    if (s.open) {
      var c = s.closesAt, late = c.getHours() >= 17 && sameDay(c, d);
      if (lang === "es") return "Abierto hasta " + esHour(c);
      return "Open until " + time(c, "en") + (late ? " tonight" : "");
    }
    if (!s.opensAt) return lang === "es" ? "Cerrado" : "Closed";
    var o = s.opensAt, tomorrow = sameDay(o, addDays(d, 1));
    if (lang === "es") {
      if (sameDay(o, d)) return "Cerrado ahora. Abrimos hoy a " + esHour(o);
      if (tomorrow) return "Cerrado ahora. Abrimos mañana a " + esHour(o);
      return "Cerrado ahora. Abrimos el " + dayName(o, "es") + " a " + esHour(o);
    }
    if (sameDay(o, d)) return "Closed now. Opens today at " + time(o, "en");
    if (tomorrow) return "Closed now. Opens tomorrow at " + time(o, "en");
    return "Closed now. Opens " + dayName(o, "en") + " at " + time(o, "en");
  }

  /* hours table rows, Monday first, with today's row marked */
  function hoursRows(hours, lang, d) {
    lang = lang || Lang.cur; d = d || now();
    var today = operatingDow(hours, d), order = [1, 2, 3, 4, 5, 6, 0], rows = [];
    order.forEach(function (dow) {
      var h = hours[dow], label = DAYS[lang][dow];
      label = label.charAt(0).toUpperCase() + label.slice(1);
      var txt;
      if (!h) txt = lang === "es" ? "Cerrado" : "Closed";
      else {
        var a = atMinutes(new Date(2026, 0, 4), h[0]), b = atMinutes(new Date(2026, 0, 4), h[1]);
        txt = time(a, lang) + " – " + time(b, lang);
      }
      rows.push({ dow: dow, label: label, text: txt, today: dow === today });
    });
    return rows;
  }

  /* ---------- links ---------- */
  var ua = navigator.userAgent;
  var isApple = /iPhone|iPad|iPod|Macintosh/.test(ua);
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  function mapsUrl(name, address) {
    if (isApple) return "https://maps.apple.com/?q=" + encodeURIComponent(name) + "&address=" + encodeURIComponent(address);
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(name + ", " + address);
  }
  function telUrl(phone) { return "tel:" + encodeURIComponent(phone.replace(/[^\d+A-Za-z\[\]' ]/g, "")); }
  function smsUrl(phone, body) {
    return "sms:" + encodeURIComponent(phone) + (isIOS ? "&" : "?") + "body=" + encodeURIComponent(body);
  }
  function googleSearchUrl(q) { return "https://www.google.com/search?q=" + encodeURIComponent(q); }

  /* ---------- calendar (.ics) ---------- */
  function icsEsc(s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }
  function icsDate(d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
  function ics(ev) {
    return [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//store-demos//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + ev.uid,
      "DTSTAMP:" + icsDate(new Date()),
      "DTSTART:" + icsDate(ev.start),
      "DTEND:" + icsDate(ev.end),
      "SUMMARY:" + icsEsc(ev.title),
      "LOCATION:" + icsEsc(ev.location),
      "DESCRIPTION:" + icsEsc(ev.description || ""),
      "BEGIN:VALARM", "TRIGGER:-PT1H", "ACTION:DISPLAY", "DESCRIPTION:" + icsEsc(ev.title), "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
  }
  /* iPhone: a tapped link to a text/calendar data URL opens Calendar's "Add" sheet; elsewhere the .ics downloads */
  function addToCalendar(ev, filename) {
    var text = ics(ev), a = document.createElement("a");
    if (isIOS) { a.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(text); a.target = "_blank"; }
    else { a.href = URL.createObjectURL(new Blob([text], { type: "text/calendar;charset=utf-8" })); }
    a.download = filename || "booking.ics";
    a.rel = "noopener";
    document.body.appendChild(a); a.click();
    setTimeout(function () { if (a.href.indexOf("blob:") === 0) URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  /* ---------- money ---------- */
  function money(n) {
    var whole = Math.round(n * 100) % 100 === 0;
    return "$" + (whole ? Math.round(n).toString() : n.toFixed(2));
  }

  /* ---------- quiet reveals: elements with .rv rise into place once ---------- */
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function reveal(root) {
    var els = (root || document).querySelectorAll(".rv:not(.in)");
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* deterministic small hash, for demo availability */
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  window.Kit = {
    qs: qs, now: now, setPreview: setPreview, store: store, Lang: Lang, reduce: reduce,
    time: time, clock: clock, ampm: ampm, esHour: esHour, dayName: dayName, dayShort: dayShort, dateShort: dateShort,
    sameDay: sameDay, startOfDay: startOfDay, addDays: addDays, atMinutes: atMinutes,
    status: status, intervals: intervals, operatingDow: operatingDow, openLine: openLine, hoursRows: hoursRows,
    mapsUrl: mapsUrl, telUrl: telUrl, smsUrl: smsUrl, googleSearchUrl: googleSearchUrl, isIOS: isIOS,
    ics: ics, addToCalendar: addToCalendar, money: money, reveal: reveal, hash: hash
  };
})();
