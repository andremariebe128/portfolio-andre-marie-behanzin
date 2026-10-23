/* Portfolio André-Marie BEHANZIN — scripts (aucune dépendance) */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  root.classList.add("js");
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Hors ligne (file://) : les liens propres n'ont pas d'extension, on la rajoute pour pouvoir naviguer en local */
  if (location.protocol === "file:") {
    $$("a[href]").forEach(function (a) {
      var h = a.getAttribute("href");
      if (!h || /^(https?:|mailto:|tel:|#|data:)/i.test(h)) return;
      var m = h.match(/^([^?#]*)(.*)$/), p = m[1];
      if (/\.[a-z0-9]+$/i.test(p)) return;
      p = (p === "" || /\/$/.test(p)) ? p + "index.html" : p + ".html";
      a.setAttribute("href", p + m[2]);
    });
  }

  /* En-tête : ombre au défilement + barre de progression */
  var header = $(".site-header"), bar = $(".progress");
  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (bar) {
      var max = d.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Menu mobile */
  var btn = $(".menu-btn");
  if (btn && header) {
    var setMenu = function (open) {
      header.classList.toggle("nav-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    };
    btn.addEventListener("click", function () { setMenu(!header.classList.contains("nav-open")); });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    $$(".nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  }

  /* Apparition au défilement */
  var rv = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add("in"); });
  }

  /* Pile de fenêtres du hero */
  var deck = $("[data-deck]");
  if (deck) {
    var frames = $$(".frame", deck), n = frames.length, cur = 0, timer = null;
    var capName = $("[data-cap-name]"), capDesc = $("[data-cap-desc]"), capLink = $("[data-cap-link]");
    var dots = $$(".pager button");
    var show = function (i) {
      cur = (i + n) % n;
      frames.forEach(function (f, k) {
        var pos = (k - cur + n) % n;
        f.setAttribute("data-pos", pos);
        f.setAttribute("aria-hidden", pos === 0 ? "false" : "true");
        var a = $("a", f); if (a) a.tabIndex = pos === 0 ? 0 : -1;
      });
      var f0 = frames[cur];
      if (capName) capName.textContent = f0.getAttribute("data-name");
      if (capDesc) capDesc.textContent = f0.getAttribute("data-desc");
      if (capLink) capLink.setAttribute("href", f0.getAttribute("data-href"));
      dots.forEach(function (b, k) { b.setAttribute("aria-current", k === cur ? "true" : "false"); });
    };
    var start = function () { if (!reduce && !timer) timer = setInterval(function () { show(cur + 1); }, 4300); };
    var stop = function () { clearInterval(timer); timer = null; };
    show(0); start();
    dots.forEach(function (b, k) { b.addEventListener("click", function () { show(k); stop(); start(); }); });
    var wrap = deck.parentNode;
    wrap.addEventListener("mouseenter", stop); wrap.addEventListener("mouseleave", start);
    wrap.addEventListener("focusin", stop); wrap.addEventListener("focusout", start);
    if (!reduce && window.matchMedia("(hover: hover)").matches) {
      var raf = 0;
      deck.addEventListener("pointermove", function (e) {
        var r = deck.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          deck.style.setProperty("--rx", (x * 7).toFixed(2) + "deg");
          deck.style.setProperty("--ry", (-y * 6).toFixed(2) + "deg");
        });
      });
      deck.addEventListener("pointerleave", function () { deck.style.setProperty("--rx", "0deg"); deck.style.setProperty("--ry", "0deg"); });
    }
  }

  /* Filtre des projets */
  var filters = $$("[data-filter]");
  if (filters.length) {
    var cards = $$("[data-cat]");
    var apply = function (cat) {
      filters.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-filter") === cat ? "true" : "false"); });
      cards.forEach(function (c) { c.hidden = !(cat === "tous" || c.getAttribute("data-cat") === cat); });
      var live = $("#filter-live");
      if (live) live.textContent = cards.filter(function (c) { return !c.hidden; }).length + " projets affichés";
    };
    filters.forEach(function (b) { b.addEventListener("click", function () { apply(b.getAttribute("data-filter")); }); });
    var h = (location.hash || "").replace("#", "");
    apply(h === "clients" || h === "personnels" ? h : "tous");
  }

  /* Agrandissement des captures */
  var zooms = $$("[data-zoom]");
  if (zooms.length && typeof HTMLDialogElement !== "undefined") {
    var dlg = d.createElement("dialog");
    dlg.className = "lightbox";
    dlg.setAttribute("aria-label", "Capture agrandie");
    dlg.innerHTML = '<button class="lb-close" type="button" aria-label="Fermer"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button><img alt=""><p></p>';
    d.body.appendChild(dlg);
    var im = $("img", dlg), cap = $("p", dlg);
    zooms.forEach(function (z) {
      z.addEventListener("click", function () {
        im.src = z.getAttribute("data-full"); im.alt = z.getAttribute("data-alt") || "";
        cap.textContent = z.getAttribute("data-alt") || "";
        dlg.showModal();
      });
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.closest(".lb-close")) dlg.close(); });
  }

  /* Formulaire : prépare un message WhatsApp ou e-mail (aucun serveur nécessaire) */
  var form = $("#contact-form");
  if (form) {
    var err = $("#form-error", form);
    var compose = function () {
      var nom = form.nom.value.trim(), type = form.type.value, msg = form.message.value.trim();
      if (!nom || !msg) { err.textContent = "Indiquez votre nom et votre message pour continuer."; (nom ? form.message : form.nom).focus(); return null; }
      err.textContent = "";
      return { subject: type + " : message de " + nom, body: "Bonjour André-Marie,\n\nJe m'appelle " + nom + ".\nObjet : " + type + ".\n\n" + msg };
    };
    $("[data-send=wa]", form).addEventListener("click", function () {
      var m = compose(); if (!m) return;
      window.open("https://wa.me/2290145289399?text=" + encodeURIComponent(m.body), "_blank", "noopener");
    });
    $("[data-send=mail]", form).addEventListener("click", function () {
      var m = compose(); if (!m) return;
      location.href = "mailto:andremariebe128@gmail.com?subject=" + encodeURIComponent(m.subject) + "&body=" + encodeURIComponent(m.body);
    });
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    var q = new URLSearchParams(location.search).get("type");
    if (q) { $$("option", form.type).forEach(function (o) { if (o.value === q) form.type.value = q; }); }
  }

  /* Heure à Cotonou */
  var clocks = $$("[data-clock]");
  if (clocks.length && window.Intl) {
    var fmt = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Porto-Novo" });
    var tick = function () { clocks.forEach(function (c) { c.textContent = fmt.format(new Date()); }); };
    tick(); setInterval(tick, 20000);
  }
})();
