/* =========================================================
   E-WasteBiz Enterprises — site script
   Header/footer, theme, animations, dynamic content, lead forms
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Icons (lucide-style, stroke) ---------- */
  const P = {
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    server: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01"/>',
    laptop: '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55A1 1 0 0 1 20.38 20H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    cable: '<path d="M4 9a2 2 0 0 1-2-2V5h6v2a2 2 0 0 1-2 2Z"/><path d="M3 5V3M7 5V3M19 15V6.5a3.5 3.5 0 0 0-7 0v11a3.5 3.5 0 0 1-7 0V9"/><path d="M17 21v-2M21 21v-2M22 19h-6v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2Z"/>',
    factory: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1M12 18h1M7 18h1"/>',
    file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6M9 15l2 2 4-4"/>',
    recycle: '<path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633 4.096 1.098 1.097-4.096"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1ZM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    rupee: '<path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3M9 13c6.667 0 6.667-10 0-10"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    school: '<path d="M14 22v-4a2 2 0 1 0-4 0v4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/><path d="M18 5v17M4 6l8-4 8 4M6 5v17"/><circle cx="12" cy="9" r="2"/>',
    hospital: '<path d="M12 6v4M14 14h-4M14 18h-4M14 8h-4"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18"/>',
    bank: '<path d="m3 10 9-7 9 7"/><path d="M4 10v10M20 10v10M8 14v3M12 14v3M16 14v3M2 21h20"/>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
    battery: '<rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2M6 11v2M10 11v2"/>',
    printer: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    phoneDev: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    hdd: '<path d="M22 12H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11zM6 16h.01M10 16h.01"/>',
    router: '<rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6.01 18H6M10.01 18H10M15 10v4M17.84 7.17a4 4 0 0 0-5.66 0M20.66 4.34a8 8 0 0 0-11.31 0"/>',
    ups: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    ac: '<path d="M2 12h20M12 2v20m-8.5-3.5L12 12l8.5-8.5M3.5 3.5 12 12l8.5 8.5"/>',
    tv: '<rect x="2" y="7" width="20" height="15" rx="2"/><path d="m17 2-5 5-5-5"/>',
    star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3M3 4h8"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
    trash: '<path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  };
  const WA = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.81 11.81 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.42"/></svg>';
  const icon = (n, cls) => `<svg class="${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || P.recycle}</svg>`;
  window.EWB_ICON = icon;
  window.EWB_ICONS = Object.keys(P);
  window.EWB_WA = WA;
  // Admin panel only needs the icon set
  if (document.body && document.body.dataset.page === "admin") return;

  /* ---------- Defaults (overridden by /api/content.php) ---------- */
  const DEFAULTS = {
    phone: "+91 96439 47123",
    phone_raw: "+919643947123",
    whatsapp: "919643947123",
    email: "info@ewastebiz.in",
    email_alt: "ewastebizenterprises@gmail.com",
    address: "Delhi-NCR, India",
    hours: "Mon – Sat, 9:30 AM – 7:00 PM",
    announcement: "Now buying bulk IT scrap across Delhi-NCR",
    whatsapp_message: "Hi E-WasteBiz, I want to sell/recycle e-waste. Please share a quote.",
    stats: [
      { value: "5", suffix: "", label: "NCR cities covered" },
      { value: "24", suffix: "h", label: "Pickup response time" },
      { value: "100", suffix: "%", label: "GST-invoiced deals" },
      { value: "0", suffix: "", label: "Waste sent to landfill" },
    ],
    testimonials: [],
    faqs: [
      { q: "Do you pay for old computers, servers and IT scrap?", a: "Yes. Working IT equipment and high-value scrap such as servers, laptops, networking gear, copper cables and PCBs have resale or material value. We inspect the lot (photos are enough to start) and share a fair buyback quote. Low-value or non-working items are taken for compliant recycling." },
      { q: "What is the minimum quantity for a pickup?", a: "We focus on business lots — offices, IT parks, factories and institutions. As a guide, we arrange free pickups for lots of roughly 50 kg or 10+ devices. Send us the details and we will confirm quickly." },
      { q: "Which areas do you cover?", a: "All of Delhi-NCR: Delhi, Gurugram, Noida, Greater Noida, Faridabad and Ghaziabad. Pan-India bulk lots can be arranged on request." },
      { q: "Will I get a GST invoice and recycling documentation?", a: "Yes. Every purchase is billed with a proper GST invoice. Material is routed to government-authorised recyclers and you receive the paperwork you need for your audit trail — including recycling / disposal certificates and, where applicable, data destruction certificates." },
      { q: "How is data on hard drives handled?", a: "Data-bearing devices are handled under a chain-of-custody. Drives can be wiped, degaussed or physically destroyed — including on-site at your premises on request — and a certificate of data destruction is issued." },
      { q: "How fast can you pick up?", a: "Most NCR requests get a call back within a few working hours and a pickup slot within 24–72 hours, depending on lot size and location." },
    ],
    certificates: [
      { title: "GST Registration", desc: "Registered business — every deal is backed by a valid GST invoice.", tag: "Verified", image: "" },
      { title: "Udyam (MSME) Registration", desc: "Registered with the Ministry of MSME, Government of India.", tag: "Govt. registered", image: "" },
      { title: "Authorised Recycler Network", desc: "Material is processed only through CPCB / SPCB-authorised e-waste recyclers.", tag: "E-Waste Rules 2022", image: "" },
      { title: "Recycling & Data Destruction Certificates", desc: "Issued per pickup for your compliance file and ESG reporting.", tag: "Per pickup", image: "" },
    ],
    analytics: { ga4: "", gads: "", gads_lead_label: "", gads_call_label: "", meta_pixel: "" },
    clients: [],
    gallery: [],
    partners: [],
  };
  let SITE = Object.assign({}, DEFAULTS);

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const page = document.body.dataset.page || "home";
  const waLink = () => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(SITE.whatsapp_message || "")}`;

  /* ---------- Theme ---------- */
  function currentTheme() {
    const t = document.documentElement.dataset.theme;
    if (t) return t;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function toggleTheme() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("ewb-theme", next); } catch (e) {}
  }

  /* ---------- Header / Footer ---------- */
  const LINKS = [
    ["home", "index.html", "Home"],
    ["services", "services.html", "Services"],
    ["about", "about.html", "About"],
    ["certificates", "certificates.html", "Certificates"],
    ["gallery", "gallery.html", "Gallery"],
    ["contact", "contact.html", "Contact"],
  ];
  const brand = (cls = "") => `
    <a class="brand ${cls}" href="index.html" aria-label="E-WasteBiz Enterprises home">
      <img class="logo-l" src="assets/img/logo-icon.png" alt="" width="40" height="37">
      <img class="logo-d" src="assets/img/logo-icon-dark.png" alt="" width="40" height="37">
      <span class="brand-text"><b>E-WASTE<span>BIZ</span></b><small>Enterprises</small></span>
    </a>`;

  function renderChrome() {
    const callbar = document.createElement("div");
    callbar.className = "callbar";
    callbar.innerHTML = `<div class="container">
        <a class="num" href="tel:${SITE.phone_raw}" data-track="call">${icon("phone")}<span data-site="phone">${esc(SITE.phone)}</span></a>
        <a class="call-now" href="tel:${SITE.phone_raw}" data-track="call">${icon("phone")} Call Now</a>
      </div>`;

    const header = document.createElement("header");
    header.className = "nav-wrap";
    header.innerHTML = `
      <nav class="nav" aria-label="Main">
        ${brand()}
        <div class="nav-links">
          <span class="nav-hover-pill"></span>
          ${LINKS.map(([k, h, t]) => `<a href="${h}" class="${k === page ? "active" : ""}">${t}</a>`).join("")}
        </div>
        <div class="nav-actions">
          <a class="nav-phone" href="tel:${SITE.phone_raw}" data-track="call">${icon("phone")}<span data-site="phone">${esc(SITE.phone)}</span></a>
          <button class="icon-btn theme-toggle" type="button" aria-label="Toggle dark mode">${icon("moon", "moon")}${icon("sun", "sun")}</button>
          <a class="btn btn--primary btn--sm btn-cta" href="contact.html#pickup">Request Pickup</a>
          <button class="icon-btn menu-btn" type="button" aria-label="Open menu">${icon("menu")}</button>
        </div>
      </nav>`;

    const mm = document.createElement("div");
    mm.className = "mobile-menu";
    mm.setAttribute("aria-hidden", "true");
    mm.innerHTML = `
      <div class="mm-head">${brand()}<button class="icon-btn mm-close" type="button" aria-label="Close menu">${icon("x")}</button></div>
      <nav>${LINKS.map(([k, h, t], i) => `<a href="${h}" style="transition-delay:${0.05 + i * 0.05}s">${t}</a>`).join("")}</nav>
      <div class="mm-cta">
        <a class="btn btn--primary btn--lg btn--block" href="tel:${SITE.phone_raw}" data-track="call">${icon("phone")} Call ${esc(SITE.phone)}</a>
        <a class="btn btn--ghost btn--lg btn--block" href="${waLink()}" target="_blank" rel="noopener" data-wa>WhatsApp Us</a>
      </div>`;

    document.body.prepend(mm);
    document.body.prepend(header);
    document.body.prepend(callbar);

    const footer = document.createElement("footer");
    footer.className = "footer";
    footer.innerHTML = `
      <div class="container">
        <div class="footer-cta">
          <div>
            <span class="eyebrow"><span class="dot"></span>Free pickup across Delhi-NCR</span>
            <h3>Got e-waste piling up? <em>Let's clear it.</em></h3>
          </div>
          <div class="footer-cta-btns">
            <a class="btn btn--primary" href="tel:${SITE.phone_raw}" data-track="call">${icon("phone")} Call Now</a>
            <a class="btn btn--ghost" href="contact.html#pickup">Request Pickup ${icon("arrow")}</a>
          </div>
        </div>
        <div class="footer-grid">
          <div class="footer-about">
            ${brand()}
            <p class="about">Responsible electronics recycling for a green future. We buy and responsibly route corporate e-waste, IT assets and cable scrap across Delhi-NCR — fully documented and GST-invoiced.</p>
            <div class="footer-badges"><span class="pill">${icon("file")} GST invoiced</span><span class="pill pill--blue">${icon("recycle")} Authorised recyclers</span></div>
          </div>
          <div>
            <h4>Company</h4>
            <ul>${LINKS.map(([, h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}<li><a href="privacy.html">Privacy Policy</a></li></ul>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              <li><a href="services.html#itad">IT Asset Disposition</a></li>
              <li><a href="services.html#bulk">Bulk E-Waste Buying</a></li>
              <li><a href="services.html#cables">Cables & Industrial Scrap</a></li>
              <li><a href="services.html#compliance">Compliant Recycling</a></li>
              <li><a href="services.html#data">Data Destruction</a></li>
            </ul>
          </div>
          <div>
            <h4>Get in touch</h4>
            <ul class="footer-contact">
              <li><a href="tel:${SITE.phone_raw}" data-track="call">${icon("phone")}<span data-site="phone">${esc(SITE.phone)}</span></a></li>
              <li><a href="mailto:${esc(SITE.email)}" data-mail="email">${icon("mail")}<span data-site="email">${esc(SITE.email)}</span></a></li>
              <li><a href="mailto:${esc(SITE.email_alt)}" data-mail="email_alt">${icon("mail")}<span data-site="email_alt">${esc(SITE.email_alt)}</span></a></li>
              <li><span>${icon("pin")}<span data-site="address">${esc(SITE.address)}</span></span></li>
            </ul>
          </div>
        </div>
        <div class="footer-word" aria-hidden="true">E-WASTEBIZ</div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} E-WasteBiz Enterprises. All rights reserved.</span>
          <span>Delhi · Gurugram · Noida · Faridabad · Ghaziabad</span>
        </div>
      </div>`;
    document.body.appendChild(footer);

    const fab = document.createElement("a");
    fab.className = "fab-wa";
    fab.href = waLink();
    fab.target = "_blank";
    fab.rel = "noopener";
    fab.setAttribute("aria-label", "Chat on WhatsApp");
    fab.setAttribute("data-wa", "");
    fab.innerHTML = WA;
    document.body.appendChild(fab);

    // Interactions
    $$(".theme-toggle").forEach((b) => b.addEventListener("click", toggleTheme));
    const open = () => { mm.classList.add("open"); mm.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; };
    const close = () => { mm.classList.remove("open"); mm.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; };
    $(".menu-btn", header).addEventListener("click", open);
    $(".mm-close", mm).addEventListener("click", close);
    $$("nav a", mm).forEach((a) => a.addEventListener("click", close));

    // Hover pill
    const links = $(".nav-links", header);
    const pill = $(".nav-hover-pill", header);
    $$("a", links).forEach((a) => {
      a.addEventListener("mouseenter", () => {
        pill.style.left = a.offsetLeft + "px";
        pill.style.width = a.offsetWidth + "px";
        pill.style.opacity = 1;
      });
    });
    links.addEventListener("mouseleave", () => (pill.style.opacity = 0));

    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Fill inline icons: <i data-icon="name"></i> ---------- */
  function hydrateIcons(root = document) {
    $$("[data-icon]", root).forEach((el) => {
      el.outerHTML = icon(el.dataset.icon, el.className);
    });
  }

  /* ---------- Bind site settings into the page ---------- */
  function bindSite() {
    $$("[data-site]").forEach((el) => {
      const k = el.dataset.site;
      if (SITE[k] == null) return;
      el.textContent = SITE[k];
      if (el.dataset.siteHref === "mailto") el.setAttribute("href", "mailto:" + SITE[k]);
    });
    $$("[data-mail]").forEach((a) => { const v = SITE[a.dataset.mail]; if (v) a.setAttribute("href", "mailto:" + v); });
    $$('a[href^="tel:"]').forEach((a) => a.setAttribute("href", "tel:" + SITE.phone_raw));
    $$("[data-wa]").forEach((a) => a.setAttribute("href", waLink()));
    $$("[data-announcement]").forEach((el) => { if (SITE.announcement) el.textContent = SITE.announcement; });
  }

  /* ---------- Dynamic sections ---------- */
  function renderStats() {
    const box = $("[data-stats]");
    if (!box || !Array.isArray(SITE.stats)) return;
    box.innerHTML = SITE.stats.map((s) => `
      <div class="stat"><b><span class="grad-text" data-count="${esc(s.value)}">0</span><span class="grad-text">${esc(s.suffix || "")}</span></b><span>${esc(s.label)}</span></div>`).join("");
  }

  function renderFaqs() {
    const box = $("[data-faqs]");
    if (!box || !Array.isArray(SITE.faqs)) return;
    box.innerHTML = SITE.faqs.map((f, i) => `
      <details class="reveal" ${i === 0 ? "open" : ""}>
        <summary>${esc(f.q)}<span class="pm">${icon("plus")}</span></summary>
        <div class="ans">${esc(f.a)}</div>
      </details>`).join("");
    // FAQ schema for SEO
    let ld = document.getElementById("faq-ld");
    if (!ld) { ld = document.createElement("script"); ld.id = "faq-ld"; ld.type = "application/ld+json"; }
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: SITE.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
    document.head.appendChild(ld);
  }

  function renderCerts() {
    const box = $("[data-certs]");
    if (!box || !Array.isArray(SITE.certificates)) return;
    box.innerHTML = SITE.certificates.map((c) => `
      <article class="card cert reveal" ${c.image ? `data-img="${esc(c.image)}"` : ""}>
        <div class="cert-media">
          ${c.image ? `<img src="${esc(c.image)}" alt="${esc(c.title)}" loading="lazy">`
        : `<div class="cert-doc">${icon("award")}<i></i><i></i></div>`}
        </div>
        <div class="cert-body">
          <h3>${esc(c.title)}</h3>
          <p>${esc(c.desc)}</p>
          ${c.tag ? `<span class="pill">${icon("check")} ${esc(c.tag)}</span>` : ""}
        </div>
      </article>`).join("");
    $$(".cert[data-img]", box).forEach((c) => c.addEventListener("click", () => openLightbox(c.dataset.img)));
  }

  function renderTestimonials() {
    const sec = $("[data-testimonials-section]");
    const box = $("[data-testimonials]");
    if (!sec || !box) return;
    const list = (SITE.testimonials || []).filter((t) => t && t.text && t.published !== "No" && t.published !== false);
    if (!list.length) { sec.hidden = true; return; }
    sec.hidden = false;
    const card = (t) => `
      <figure class="tcard">
        <div class="stars">${"★".repeat(Math.max(1, Math.min(5, +t.rating || 5)))}</div>
        <p>${esc(t.text)}</p>
        <figcaption class="who"><span class="av">${esc((t.name || "?").trim().charAt(0).toUpperCase())}</span>
          <span><b>${esc(t.name)}</b><small>${esc([t.role, t.company].filter(Boolean).join(", "))}</small></span></figcaption>
      </figure>`;
    const html = list.map(card).join("");
    box.innerHTML = html + html;
  }


  /* ---------- Client logo wall ---------- */
  const SECTORS = [["building", "Corporate Offices"], ["server", "IT Parks"], ["bank", "Banks & NBFCs"], ["globe", "MNCs"], ["factory", "Manufacturing"], ["hospital", "Hospitals"], ["school", "Universities"], ["scale", "Govt. & PSUs"], ["cpu", "Data Centres"], ["truck", "Logistics"]];
  function renderClients() {
    const box = $("[data-clients]");
    if (!box) return;
    const logos = (SITE.clients || []).filter((c) => c && c.logo);
    const title = $("[data-clients-title]");
    let html;
    if (logos.length) {
      if (title) title.textContent = "Some of our corporate clients";
      html = logos.map((c) => `<span class="logo-tile" title="${esc(c.name)}"><img src="${esc(c.logo)}" alt="${esc(c.name)}" loading="lazy"></span>`).join("");
    } else {
      if (title) title.textContent = "Built for organisations like yours";
      html = SECTORS.map(([ic, t]) => `<span class="logo-tile txt">${icon(ic)}${t}</span>`).join("");
    }
    box.innerHTML = html + html;
  }


  /* ---------- Trusted partners ---------- */
  const PARTNER_TYPES = [
    ["recycle", "Authorised E-Waste Recyclers", "CPCB / SPCB-authorised facilities that dismantle and recover materials."],
    ["laptop", "Refurbishment Partners", "Working devices get a second life before anything is recycled."],
    ["battery", "Battery Recyclers", "Lead-acid and lithium batteries sent to authorised battery recyclers."],
    ["truck", "Logistics Partners", "Secure, documented transport from your premises to the facility."],
  ];
  function renderPartners() {
    const box = $("[data-partners]");
    if (!box) return;
    const list = (SITE.partners || []).filter((p) => p && (p.logo || p.name));
    if (list.length) {
      box.classList.add("partners--logos"); box.classList.remove("grid-4", "m-scroll");
      box.innerHTML = list.map((p) => `
        <div class="partner card reveal">
          <div class="partner-logo">${p.logo ? `<img src="${esc(p.logo)}" alt="${esc(p.name)}" loading="lazy">` : `<b>${esc(p.name)}</b>`}</div>
          <div class="partner-meta"><b>${esc(p.name)}</b>${p.type ? `<small>${esc(p.type)}</small>` : ""}</div>
        </div>`).join("");
    } else {
      box.classList.add("grid-4"); box.classList.remove("partners--logos");
      box.innerHTML = PARTNER_TYPES.map(([ic, t, d], i) => `
        <div class="card reveal" ${i ? `data-d="${i}"` : ""}><div class="card-icon ${i % 2 ? "card-icon--blue" : ""}">${icon(ic)}</div><h3>${t}</h3><p>${d}</p></div>`).join("");
    }
  }

  /* ---------- Gallery ---------- */
  function renderGallery() {
    const items = (SITE.gallery || []).filter((g) => g && g.image);
    $$("[data-gallery]").forEach((box) => {
      const limit = +box.dataset.limit || 0;
      const sec = box.closest("[data-gallery-section]");
      if (sec) sec.hidden = !items.length;
      const filters = $("[data-gallery-filters]");
      const draw = (cat) => {
        let list = cat && cat !== "All" ? items.filter((g) => (g.category || "Other") === cat) : items;
        if (limit) list = list.slice(0, limit);
        box.innerHTML = list.length ? list.map((g) => `
          <figure class="g-item reveal in" data-img="${esc(g.image)}">
            <img src="${esc(g.image)}" alt="${esc(g.caption || "E-WasteBiz gallery")}" loading="lazy">
            ${g.caption || g.category ? `<figcaption>${esc(g.caption || "")}${g.category ? `<small>${esc(g.category)}</small>` : ""}</figcaption>` : ""}
          </figure>`).join("")
          : `<div class="g-empty">${icon("globe")}<b style="display:block;font-size:18px;color:var(--text)">Photos coming soon</b>Pickup and recycling photos will appear here.</div>`;
        $$(".g-item", box).forEach((f) => f.addEventListener("click", () => openLightbox(f.dataset.img)));
      };
      if (filters && !limit) {
        const cats = ["All", ...new Set(items.map((g) => g.category || "Other"))];
        filters.innerHTML = cats.length > 2 ? cats.map((c, i) => `<button type="button" class="${i === 0 ? "on" : ""}">${esc(c)}</button>`).join("") : "";
        $$("button", filters).forEach((b) => b.addEventListener("click", () => { $$("button", filters).forEach((x) => x.classList.toggle("on", x === b)); draw(b.textContent); }));
      }
      draw("All");
    });
  }

  /* ---------- Meteors ---------- */
  function meteors() {
    $$(".meteors").forEach((m) => {
      m.innerHTML = Array.from({ length: 16 }, () =>
        `<i style="left:${Math.floor(Math.random() * 110)}%;animation-delay:${(Math.random() * 6).toFixed(2)}s;animation-duration:${(3 + Math.random() * 6).toFixed(2)}s"></i>`).join("");
    });
  }

  function openLightbox(src) {
    let lb = $(".lightbox");
    if (!lb) {
      lb = document.createElement("div");
      lb.className = "lightbox";
      lb.innerHTML = `<button class="icon-btn" aria-label="Close">${icon("x")}</button><img alt="Certificate">`;
      lb.addEventListener("click", (e) => { if (e.target === lb || e.target.closest("button")) lb.classList.remove("open"); });
      document.addEventListener("keydown", (e) => e.key === "Escape" && lb.classList.remove("open"));
      document.body.appendChild(lb);
    }
    $("img", lb).src = src;
    lb.classList.add("open");
  }

  /* ---------- Animations ---------- */
  let io;
  function observeReveals() {
    if (!("IntersectionObserver" in window)) { $$(".reveal").forEach((e) => e.classList.add("in")); return; }
    io = io || new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        if (en.target.matches("[data-count]")) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal:not(.in), [data-count]").forEach((e) => io.observe(e));
    // Fallback: anything already in the first viewport is shown even if the observer is throttled
    setTimeout(() => {
      $$(".reveal:not(.in)").forEach((e) => { if (e.getBoundingClientRect().top < innerHeight) e.classList.add("in"); });
      $$("[data-count]").forEach((e) => { if (e.textContent === "0" && e.getBoundingClientRect().top < innerHeight) countUp(e); });
    }, 600);
  }

  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    if (isNaN(target)) { el.textContent = el.dataset.count; return; }
    const dur = 1400, start = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = (Math.round(target * e) || 0).toLocaleString("en-IN");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function flipWords() {
    $$("[data-flip]").forEach((el) => {
      const words = el.dataset.flip.split("|");
      let i = 0;
      let show = (w) => {
        el.innerHTML = `<span class="fw">${[...w].map((c, k) => `<span class="ch" style="animation-delay:${k * 0.03}s">${c === " " ? "&nbsp;" : esc(c)}</span>`).join("")}</span>`;
      };
      const _show = show;
      // after render, give each char its offset so one gradient spans the word
      show = (w) => {
        _show(w);
        const fw = $(".fw", el);
        const chars = $$(".ch", fw);
        const total = fw.getBoundingClientRect().width || 1;
        let x = 0;
        chars.forEach((c) => {
          c.style.setProperty("--gw", total + "px");
          c.style.setProperty("--gx", x + "px");
          x += c.getBoundingClientRect().width;
        });
      };
      show(words[0]);
      setInterval(() => {
        const cur = $(".fw", el);
        if (cur) cur.classList.add("out");
        setTimeout(() => { i = (i + 1) % words.length; show(words[i]); }, 420);
      }, 2800);
    });
  }

  function textGenerate() {
    $$(".tg").forEach((el) => {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map((w, i) => `<span class="w" style="animation-delay:${0.1 + i * 0.05}s">${esc(w)}</span>`).join(" ");
      setTimeout(() => el.classList.add("on"), 40);
    });
  }

  function spotlightCards() {
    document.addEventListener("pointermove", (e) => {
      const c = e.target.closest && e.target.closest(".card");
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", e.clientX - r.left + "px");
      c.style.setProperty("--my", e.clientY - r.top + "px");
    }, { passive: true });
  }

  /* Mobile: card grids become swipeable carousels with dots */
  function mobileCarousels() {
    $$(".bento, .grid-3, .grid-4, .grid-2").forEach((grid) => {
      if (grid.classList.contains("m-scroll")) return;
      grid.classList.add("m-scroll");
      const dots = document.createElement("div");
      dots.className = "m-dots";
      grid.after(dots);
      const build = () => {
        const kids = Array.from(grid.children);
        dots.innerHTML = kids.map((_, i) => `<button type="button" aria-label="Go to card ${i + 1}"></button>`).join("");
        $$("button", dots).forEach((b, i) => b.addEventListener("click", () => kids[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })));
        sync();
      };
      const sync = () => {
        const kids = Array.from(grid.children);
        if (!kids.length) return;
        const mid = grid.scrollLeft + grid.clientWidth / 2;
        let best = 0, bd = Infinity;
        kids.forEach((k, i) => { const d = Math.abs(k.offsetLeft + k.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
        $$("button", dots).forEach((b, i) => b.classList.toggle("on", i === best));
      };
      grid.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
      new MutationObserver(build).observe(grid, { childList: true });
      build();
    });
  }

  /* 3D tilt on hero form (desktop, fine pointer only) */
  function tilt() {
    if (!matchMedia("(pointer: fine) and (min-width: 981px)").matches) return;
    $$(".hero .form-card").forEach((c) => {
      c.addEventListener("mousemove", (e) => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
      });
      c.addEventListener("mouseleave", () => (c.style.transform = ""));
    });
  }

  function sparkles() {
    $$(".sparkles").forEach((s) => {
      s.innerHTML = Array.from({ length: 40 }, () =>
        `<i style="left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${(Math.random() * 3).toFixed(2)}s;animation-duration:${(2 + Math.random() * 3).toFixed(2)}s"></i>`).join("");
    });
  }

  function marquees() {
    $$(".marquee-track[data-dup]").forEach((t) => { t.innerHTML += t.innerHTML; });
  }

  function tracingBeam() {
    const proc = $(".process");
    if (!proc) return;
    const fill = $(".beam-fill", proc);
    const steps = $$(".step", proc);
    const update = () => {
      const r = proc.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh * 0.6 - r.top) / r.height));
      fill.style.height = p * 100 + "%";
      steps.forEach((s) => {
        const sr = s.getBoundingClientRect();
        s.classList.toggle("lit", sr.top < vh * 0.6);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------- Attribution (UTM / gclid) for ads ---------- */
  function captureAttribution() {
    try {
      const q = new URLSearchParams(location.search);
      const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
      const found = {};
      keys.forEach((k) => { if (q.get(k)) found[k] = q.get(k).slice(0, 200); });
      if (Object.keys(found).length) {
        found.landing = location.pathname;
        localStorage.setItem("ewb-attr", JSON.stringify(found));
      }
      if (!sessionStorage.getItem("ewb-ref")) sessionStorage.setItem("ewb-ref", document.referrer || "direct");
    } catch (e) {}
  }
  function getAttribution() {
    let a = {};
    try { a = JSON.parse(localStorage.getItem("ewb-attr") || "{}"); } catch (e) {}
    try { a.referrer = sessionStorage.getItem("ewb-ref") || document.referrer || ""; } catch (e) {}
    return a;
  }

  /* ---------- Analytics (GA4 / Google Ads / Meta) ---------- */
  function loadAnalytics() {
    const a = SITE.analytics || {};
    const gid = a.ga4 || a.gads;
    if (gid) {
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gid);
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      gtag("js", new Date());
      if (a.ga4) gtag("config", a.ga4);
      if (a.gads) gtag("config", a.gads);
    }
    if (a.meta_pixel) {
      /* eslint-disable */
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      /* eslint-enable */
      fbq("init", a.meta_pixel);
      fbq("track", "PageView");
    }
    // Conversion on thank-you page
    if (page === "thanks") {
      if (window.gtag && a.gads && a.gads_lead_label) gtag("event", "conversion", { send_to: a.gads + "/" + a.gads_lead_label });
      if (window.gtag && a.ga4) gtag("event", "generate_lead");
      if (window.fbq) fbq("track", "Lead");
    }
    // Call clicks
    document.addEventListener("click", (e) => {
      const t = e.target.closest('[data-track="call"], a[href^="tel:"]');
      const w = e.target.closest("[data-wa]");
      if (t) {
        if (window.gtag && a.gads && a.gads_call_label) gtag("event", "conversion", { send_to: a.gads + "/" + a.gads_call_label });
        if (window.gtag) gtag("event", "click_to_call");
        if (window.fbq) fbq("track", "Contact");
        ping("call");
      }
      if (w) {
        if (window.gtag) gtag("event", "whatsapp_click");
        if (window.fbq) fbq("track", "Contact");
        ping("whatsapp");
      }
    });
  }
  function ping(type) {
    try {
      const body = JSON.stringify({ type, page: location.pathname, attr: getAttribution() });
      if (navigator.sendBeacon) navigator.sendBeacon("api/track.php", new Blob([body], { type: "application/json" }));
    } catch (e) {}
  }

  /* ---------- Lead forms ---------- */
  function leadForms() {
    $$("form[data-lead-form]").forEach((form) => {
      const msg = $(".form-msg", form);
      const btn = $('button[type="submit"]', form);
      const started = Date.now();
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msg.className = "form-msg";
        $$(".invalid", form).forEach((x) => x.classList.remove("invalid"));
        const data = Object.fromEntries(new FormData(form).entries());
        const errs = [];
        if (!data.name || data.name.trim().length < 2) errs.push("name");
        const digits = String(data.phone || "").replace(/\D/g, "");
        if (digits.length < 10 || digits.length > 13) errs.push("phone");
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.push("email");
        if (errs.length) {
          errs.forEach((n) => form.elements[n] && form.elements[n].classList.add("invalid"));
          msg.textContent = "Please enter a valid " + errs.join(" and ") + ".";
          msg.classList.add("err");
          return;
        }
        data.page = location.pathname;
        data.form = form.dataset.leadForm || "pickup";
        data.elapsed = Math.round((Date.now() - started) / 1000);
        data.attr = getAttribution();
        btn.classList.add("loading");
        btn.disabled = true;
        try {
          const res = await fetch("api/lead.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const out = await res.json().catch(() => ({}));
          if (!res.ok || !out.ok) throw new Error(out.error || "Something went wrong. Please call us directly.");
          try { sessionStorage.setItem("ewb-lead-name", data.name.split(" ")[0]); } catch (e) {}
          location.href = "thank-you.html";
        } catch (err) {
          msg.innerHTML = esc(err.message || "Could not submit.") + ` <a href="tel:${SITE.phone_raw}" style="text-decoration:underline">Call ${esc(SITE.phone)}</a>`;
          msg.classList.add("err");
          btn.classList.remove("loading");
          btn.disabled = false;
        }
      });
    });
  }

  /* ---------- Boot ---------- */
  function renderDynamic() {
    bindSite();
    renderStats();
    renderFaqs();
    renderCerts();
    renderTestimonials();
    renderClients();
    renderPartners();
    renderGallery();
    observeReveals();
  }

  async function loadContent() {
    try {
      const res = await fetch("api/content.php", { cache: "no-store" });
      if (!res.ok) throw 0;
      const data = await res.json();
      if (data && typeof data === "object") SITE = Object.assign({}, DEFAULTS, data);
    } catch (e) { /* static fallback */ }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    captureAttribution();
    if (document.hidden) document.documentElement.classList.add("no-anim");
    // Render immediately with defaults (fast first paint for ad traffic)…
    renderChrome();
    hydrateIcons();
    renderDynamic();
    // …then refresh with live content from the admin panel
    loadContent().then(() => { renderDynamic(); loadAnalytics(); });
    textGenerate();
    flipWords();
    marquees();
    spotlightCards();
    tracingBeam();
    mobileCarousels();
    tilt();
    sparkles();
    meteors();
    leadForms();
    const n = $("[data-lead-name]");
    if (n) { try { const v = sessionStorage.getItem("ewb-lead-name"); if (v) n.textContent = ", " + v; } catch (e) {} }
  });
})();
