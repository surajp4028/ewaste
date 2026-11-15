/* =========================================================
   E-WasteBiz Admin Dashboard
   ========================================================= */
(function () {
  "use strict";
  const API = "../api/admin.php";
  const icon = window.EWB_ICON;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const STATUSES = ["new", "contacted", "quoted", "won", "lost", "spam"];

  const TABS = {
    overview: ["Overview", "zap"],
    leads: ["Leads", "users"],
    content: ["Site content", "globe"],
    certificates: ["Certificates", "award"],
    testimonials: ["Testimonials", "star"],
    faqs: ["FAQs", "file"],
    clients: ["Client logos", "building"],
    partners: ["Partners", "handshake"],
    gallery: ["Gallery", "globe"],
    settings: ["Settings", "lock"],
  };

  const state = { leads: [], events: {}, settings: null, filter: { q: "", status: "all", source: "all", range: "all" }, page: 1, selected: new Set(), seen: new Set() };
  try { JSON.parse(localStorage.getItem("ewb-seen") || "[]").forEach((id) => state.seen.add(id)); } catch (e) {}

  /* ---------- helpers ---------- */
  async function api(action, { method = "GET", body, form } = {}) {
    const opts = { method, credentials: "same-origin", headers: { "X-EWB": "1" } };
    if (body) { opts.headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
    if (form) opts.body = form;
    const res = await fetch(`${API}?action=${action}`, opts);
    const data = await res.json().catch(() => ({ ok: false, error: "Server error (" + res.status + ")" }));
    if (res.status === 401 && action !== "login") { showLogin(); throw new Error("Session expired"); }
    if (!data.ok) throw new Error(data.error || "Request failed");
    return data;
  }
  function toast(msg, err) {
    const t = document.createElement("div");
    t.className = "toast" + (err ? " err" : "");
    t.textContent = msg;
    $("#toasts").appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }
  const fmtDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) + ", " + d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  };
  const ago = (iso) => {
    const s = (Date.now() - new Date(iso)) / 1000;
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago";
    return Math.floor(s / 86400) + "d ago";
  };
  const dayKey = (d) => { const x = new Date(d); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
  const telHref = (p) => "tel:" + String(p).replace(/[^\d+]/g, "");
  const waHref = (p) => { let d = String(p).replace(/\D/g, ""); if (d.length === 10) d = "91" + d; return "https://wa.me/" + d; };
  function saveSeen() { try { localStorage.setItem("ewb-seen", JSON.stringify([...state.seen].slice(-5000))); } catch (e) {} }

  /* ---------- auth ---------- */
  function showLogin() { $("#app").hidden = true; $("#login").hidden = false; setTimeout(() => $("#lu").focus(), 50); }
  function showApp() { $("#login").hidden = true; $("#app").hidden = false; }

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("button", e.target), msg = $(".form-msg", e.target);
    msg.className = "form-msg";
    btn.classList.add("loading"); btn.disabled = true;
    try {
      await api("login", { method: "POST", body: { username: $("#lu").value.trim(), password: $("#lp").value } });
      $("#lp").value = "";
      await boot();
    } catch (err) {
      msg.textContent = err.message; msg.classList.add("err");
    } finally { btn.classList.remove("loading"); btn.disabled = false; }
  });
  const logout = async () => { try { await api("logout", { method: "POST" }); } catch (e) {} showLogin(); };
  $("#logout").addEventListener("click", logout);
  $("#logoutM").addEventListener("click", logout);

  /* ---------- chrome ---------- */
  function buildNav() {
    $$(".side a.tab").forEach((a) => { const [t, ic] = TABS[a.dataset.tab]; a.innerHTML = icon(ic) + `<span>${t}</span>` + (a.dataset.tab === "leads" ? '<span class="count" id="newCount" hidden></span>' : ""); });
    $("#mobTabs").innerHTML = Object.entries(TABS).map(([k, [t, ic]]) => `<a href="#${k}" data-tab="${k}">${icon(ic)}${t.split(" ")[0]}</a>`).join("");
    const tt = $(".topbar .theme-toggle");
    tt.innerHTML = icon("moon", "moon") + icon("sun", "sun");
    tt.addEventListener("click", () => {
      const cur = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("ewb-theme", next); } catch (e) {}
    });
    $("#viewSite").innerHTML = icon("globe");
    $("#logoutM").innerHTML = icon("x");
    if (matchMedia("(max-width: 860px)").matches) $("#logoutM").style.display = "";
    $("#refresh").addEventListener("click", async () => { await loadData(); route(); toast("Refreshed"); });
  }
  function updateNewCount() {
    const n = state.leads.filter((l) => l.status === "new").length;
    const el = $("#newCount");
    if (el) { el.hidden = !n; el.textContent = n; }
    document.title = (n ? `(${n}) ` : "") + "Admin · E-WasteBiz";
  }

  /* ---------- data ---------- */
  async function loadData() {
    const [l, ev, s] = await Promise.all([api("leads"), api("events"), api("settings")]);
    state.leads = l.leads || [];
    state.events = ev.events || {};
    state.settings = s.settings || {};
    updateNewCount();
  }

  /* ---------- router ---------- */
  let dirty = false;
  function route() {
    const tab = (location.hash || "#overview").slice(1).split("/")[0];
    const key = TABS[tab] ? tab : "overview";
    $$("[data-tab]").forEach((a) => a.classList.toggle("active", a.dataset.tab === key));
    $("#viewTitle").textContent = TABS[key][0];
    const v = $("#view");
    v.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "view";
    v.appendChild(wrap);
    dirty = false;
    ({ overview, leads: leadsView, content: contentView, certificates: certsView, testimonials: testiView, faqs: faqView, clients: clientsView, partners: partnersView, gallery: galleryView, settings: settingsView })[key](wrap);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", () => {
    if (dirty && !confirm("You have unsaved changes. Leave anyway?")) return;
    route();
  });
  window.addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

  /* =========================================================
     OVERVIEW
     ========================================================= */
  function overview(el) {
    const L = state.leads;
    const now = new Date();
    const today = dayKey(now);
    const inDays = (iso, n) => (now - new Date(iso)) / 86400000 < n;
    const last7 = L.filter((l) => inDays(l.created_at, 7)).length;
    const prev7 = L.filter((l) => !inDays(l.created_at, 7) && inDays(l.created_at, 14)).length;
    const todayN = L.filter((l) => dayKey(l.created_at) === today).length;
    const newN = L.filter((l) => l.status === "new").length;
    const won = L.filter((l) => l.status === "won").length;
    const conv = L.length ? Math.round((won / L.filter((l) => l.status !== "spam").length) * 100) || 0 : 0;
    let calls7 = 0, wa7 = 0;
    for (let i = 0; i < 7; i++) {
      const k = dayKey(new Date(now - i * 86400000));
      calls7 += (state.events[k] || {}).call || 0;
      wa7 += (state.events[k] || {}).whatsapp || 0;
    }
    const delta = prev7 ? Math.round(((last7 - prev7) / prev7) * 100) : null;

    el.innerHTML = `
      <div class="kpis">
        ${kpi("Leads today", todayN, "zap", `${L.length} total all-time`)}
        ${kpi("Last 7 days", last7, "users", delta == null ? "vs previous week" : `<span class="${delta >= 0 ? "up" : "down"}">${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)}%</span> vs previous week`, true)}
        ${kpi("Awaiting call-back", newN, "phone", newN ? '<a href="#leads" style="color:var(--accent)">Open new leads →</a>' : "All caught up 🎉", true)}
        ${kpi("Call / WhatsApp clicks", calls7 + wa7, "handshake", `${calls7} calls · ${wa7} WhatsApp (7 days)`)}
      </div>
      <div class="grid-main">
        <div class="panel">
          <div class="panel-head"><h2>Leads — last 30 days</h2><span class="hint">Won rate: <b style="color:var(--text)">${conv}%</b></span></div>
          ${chart30()}
        </div>
        <div class="panel">
          <div class="panel-head"><h2>By source</h2><span class="hint">All time</span></div>
          ${hbars(groupBy(L, (l) => l.source || "Direct"))}
        </div>
      </div>
      <div class="grid-halves">
        <div class="panel">
          <div class="panel-head"><h2>Recent leads</h2><a class="btn btn--ghost btn--sm" href="#leads">View all</a></div>
          ${L.length ? `<div style="display:grid;gap:4px">${L.slice(0, 6).map((l) => `
            <div class="recent" data-id="${esc(l.id)}" style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px;border-radius:10px;cursor:pointer">
              <div style="min-width:0"><b style="display:block;font-size:14.5px">${esc(l.name)} ${l.company ? `<span style="color:var(--text-3);font-weight:500">· ${esc(l.company)}</span>` : ""}</b>
              <small style="color:var(--text-3)">${esc(l.category || "—")} · ${esc(l.city || "")} · ${ago(l.created_at)}</small></div>
              <span class="status s-${esc(l.status)}">${esc(l.status)}</span>
            </div>`).join("")}</div>` : emptyBox("No leads yet. They'll appear here as soon as someone submits the form.")}
        </div>
        <div class="panel">
          <div class="panel-head"><h2>By category</h2></div>
          ${hbars(groupBy(L, (l) => l.category || "Other"))}
          <div class="panel-head" style="margin:26px 0 14px"><h2>Pipeline</h2></div>
          ${hbars(Object.fromEntries(STATUSES.map((s) => [s[0].toUpperCase() + s.slice(1), L.filter((l) => l.status === s).length]).filter(([, n]) => n)))}
        </div>
      </div>`;
    $$(".recent", el).forEach((r) => {
      r.addEventListener("mouseenter", () => (r.style.background = "var(--bg-soft)"));
      r.addEventListener("mouseleave", () => (r.style.background = ""));
      r.addEventListener("click", () => openLead(r.dataset.id));
    });
    bindChart(el);
    requestAnimationFrame(() => $$(".hbar .fill", el).forEach((f) => (f.style.width = f.dataset.w + "%")));
  }
  function kpi(label, val, ic, sub, raw) {
    return `<div class="panel kpi"><small>${icon(ic)}${esc(label)}</small><b>${val}</b><div class="delta">${raw ? sub : esc(sub)}</div></div>`;
  }
  function groupBy(arr, fn) { const o = {}; arr.forEach((x) => { const k = fn(x); o[k] = (o[k] || 0) + 1; }); return o; }
  function hbars(obj) {
    const e = Object.entries(obj).sort((a, b) => b[1] - a[1]);
    if (!e.length) return emptyBox("No data yet");
    const max = Math.max(...e.map((x) => x[1]));
    return `<div class="hbars">${e.slice(0, 7).map(([k, n]) => `<div class="hbar"><div class="row"><span>${esc(k)}</span><b>${n}</b></div><div class="track"><div class="fill" data-w="${(n / max) * 100}"></div></div></div>`).join("")}</div>`;
  }
  function emptyBox(t) { return `<div class="empty">${icon("search")}${esc(t)}</div>`; }
  function chart30() {
    const days = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) days.push(dayKey(new Date(now - i * 86400000)));
    const counts = Object.fromEntries(days.map((d) => [d, 0]));
    state.leads.forEach((l) => { const k = dayKey(l.created_at); if (k in counts) counts[k]++; });
    const max = Math.max(4, ...Object.values(counts));
    const W = 600, H = 220, pad = 24, bw = (W - pad) / 30;
    let bars = "", axis = "", grid = "";
    for (let g = 0; g <= 4; g++) {
      const y = 10 + ((H - 34) * g) / 4;
      grid += `<line class="gl" x1="${pad}" x2="${W}" y1="${y}" y2="${y}" stroke-dasharray="3 4"/><text class="axis" x="0" y="${y + 3}">${Math.round(max - (max * g) / 4)}</text>`;
    }
    days.forEach((d, i) => {
      const v = counts[d];
      const h = ((H - 34) * v) / max;
      const x = pad + i * bw + 3;
      bars += `<rect class="bar" data-tip="${d.slice(5)}: ${v} lead${v === 1 ? "" : "s"}" x="${x}" y="${H - 24 - h}" width="${bw - 6}" height="${Math.max(h, v ? 2 : 0)}" rx="3"/>`;
      if (i % 5 === 0 || i === 29) axis += `<text class="axis" x="${x}" y="${H - 6}">${new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</text>`;
    });
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="barg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#22c55e"/><stop offset="1" stop-color="#2563eb" stop-opacity=".75"/></linearGradient></defs>${grid}${bars}${axis}</svg>`;
  }
  function bindChart(el) {
    const tip = $("#tip");
    $$(".bar", el).forEach((b) => {
      b.addEventListener("mousemove", (e) => { tip.textContent = b.dataset.tip; tip.style.left = e.clientX + 12 + "px"; tip.style.top = e.clientY - 34 + "px"; tip.style.opacity = 1; });
      b.addEventListener("mouseleave", () => (tip.style.opacity = 0));
    });
  }

  /* =========================================================
     LEADS
     ========================================================= */
  const PER = 25;
  function filtered() {
    const f = state.filter, q = f.q.toLowerCase();
    const now = Date.now();
    return state.leads.filter((l) => {
      if (f.status !== "all" && l.status !== f.status) return false;
      if (f.source !== "all" && (l.source || "Direct") !== f.source) return false;
      if (f.range !== "all" && (now - new Date(l.created_at)) / 86400000 > +f.range) return false;
      if (q && ![l.name, l.phone, l.email, l.company, l.city, l.category, l.message, l.id].join(" ").toLowerCase().includes(q)) return false;
      return true;
    });
  }
  function leadsView(el) {
    const sources = [...new Set(state.leads.map((l) => l.source || "Direct"))];
    const counts = groupBy(state.leads, (l) => l.status);
    el.innerHTML = `
      <div class="toolbar">
        <div class="search">${icon("search")}<input class="input" id="lq" placeholder="Search name, phone, company, message…" value="${esc(state.filter.q)}"></div>
        <select class="select" id="lsrc"><option value="all">All sources</option>${sources.map((s) => `<option ${state.filter.source === s ? "selected" : ""}>${esc(s)}</option>`).join("")}</select>
        <select class="select" id="lrange">
          ${[["all", "All time"], ["1", "Today"], ["7", "Last 7 days"], ["30", "Last 30 days"], ["90", "Last 90 days"]].map(([v, t]) => `<option value="${v}" ${state.filter.range === v ? "selected" : ""}>${t}</option>`).join("")}
        </select>
        <a class="btn btn--dark btn--sm" href="${API}?action=export" download>Export CSV</a>
      </div>
      <div class="chips">
        <button class="chipf ${state.filter.status === "all" ? "on" : ""}" data-s="all">All <span class="n">${state.leads.length}</span></button>
        ${STATUSES.map((s) => `<button class="chipf ${state.filter.status === s ? "on" : ""}" data-s="${s}">${s[0].toUpperCase() + s.slice(1)} <span class="n">${counts[s] || 0}</span></button>`).join("")}
      </div>
      <div class="bulkbar" id="bulk"><span id="bulkN"></span>
        <select class="select" id="bulkStatus" style="height:32px;width:auto;background-color:transparent;color:inherit;border-color:rgba(127,127,127,.4);font-size:13px"><option value="">Set status…</option>${STATUSES.map((s) => `<option value="${s}">${s}</option>`).join("")}</select>
        <button class="btn btn--sm" id="bulkDel" style="background:#ef4444;color:#fff">Delete</button>
        <button class="btn btn--sm" id="bulkClear" style="background:transparent;color:inherit">Clear</button>
      </div>
      <div class="table-wrap"><table class="t"><thead><tr>
        <th style="width:36px"><input type="checkbox" id="selAll" aria-label="Select all"></th>
        <th>Received</th><th>Contact</th><th>Requirement</th><th>Source</th><th>Status</th><th>Quick</th>
      </tr></thead><tbody id="ltb"></tbody></table></div>
      <div class="pager"><span id="pinfo"></span><span style="display:flex;gap:6px"><button class="btn btn--ghost btn--sm" id="pprev">← Prev</button><button class="btn btn--ghost btn--sm" id="pnext">Next →</button></span></div>`;

    const draw = () => {
      const rows = filtered();
      const pages = Math.max(1, Math.ceil(rows.length / PER));
      state.page = Math.min(state.page, pages);
      const slice = rows.slice((state.page - 1) * PER, state.page * PER);
      $("#ltb", el).innerHTML = slice.length ? slice.map((l) => `
        <tr data-id="${esc(l.id)}" class="${state.seen.has(l.id) ? "" : "unread"}">
          <td onclick="event.stopPropagation()"><input type="checkbox" class="sel" value="${esc(l.id)}" ${state.selected.has(l.id) ? "checked" : ""}></td>
          <td><b style="font-weight:600">${ago(l.created_at)}</b><div class="muted">${fmtDate(l.created_at)}</div></td>
          <td class="nm"><b>${esc(l.name)}</b><small>${esc(l.phone)}${l.company ? " · " + esc(l.company) : ""}</small></td>
          <td><div style="font-weight:500">${esc(l.category || "—")}</div><div class="muted">${esc([l.city, l.quantity].filter(Boolean).join(" · "))}</div></td>
          <td><span class="src">${esc(l.source || "Direct")}</span>${l.attr && l.attr.utm_campaign ? `<div class="muted" style="margin-top:4px">${esc(l.attr.utm_campaign)}</div>` : ""}</td>
          <td><span class="status s-${esc(l.status)}">${esc(l.status)}</span></td>
          <td onclick="event.stopPropagation()"><div class="quick"><a href="${telHref(l.phone)}" title="Call">${icon("phone")}</a><a href="${waHref(l.phone)}" target="_blank" rel="noopener" title="WhatsApp">${icon("handshake")}</a>${l.email ? `<a href="mailto:${esc(l.email)}" title="Email">${icon("mail")}</a>` : ""}</div></td>
        </tr>`).join("") : `<tr><td colspan="7">${emptyBox(state.leads.length ? "No leads match these filters." : "No leads yet.")}</td></tr>`;
      $("#pinfo", el).textContent = rows.length ? `Showing ${(state.page - 1) * PER + 1}–${Math.min(state.page * PER, rows.length)} of ${rows.length}` : "";
      $("#pprev", el).disabled = state.page <= 1;
      $("#pnext", el).disabled = state.page >= pages;
      $$("#ltb tr[data-id]", el).forEach((tr) => tr.addEventListener("click", () => openLead(tr.dataset.id)));
      $$(".sel", el).forEach((c) => c.addEventListener("change", () => { c.checked ? state.selected.add(c.value) : state.selected.delete(c.value); bulk(); }));
      $("#selAll", el).checked = slice.length && slice.every((l) => state.selected.has(l.id));
      bulk();
    };
    const bulk = () => {
      const n = state.selected.size;
      $("#bulk", el).classList.toggle("show", n > 0);
      $("#bulkN", el).textContent = `${n} selected`;
    };
    let t;
    $("#lq", el).addEventListener("input", (e) => { clearTimeout(t); t = setTimeout(() => { state.filter.q = e.target.value; state.page = 1; draw(); }, 150); });
    $("#lsrc", el).addEventListener("change", (e) => { state.filter.source = e.target.value; state.page = 1; draw(); });
    $("#lrange", el).addEventListener("change", (e) => { state.filter.range = e.target.value; state.page = 1; draw(); });
    $$(".chipf", el).forEach((c) => c.addEventListener("click", () => { state.filter.status = c.dataset.s; state.page = 1; $$(".chipf", el).forEach((x) => x.classList.toggle("on", x === c)); draw(); }));
    $("#pprev", el).addEventListener("click", () => { state.page--; draw(); });
    $("#pnext", el).addEventListener("click", () => { state.page++; draw(); });
    $("#selAll", el).addEventListener("change", (e) => {
      const rows = filtered().slice((state.page - 1) * PER, state.page * PER);
      rows.forEach((l) => (e.target.checked ? state.selected.add(l.id) : state.selected.delete(l.id)));
      draw();
    });
    $("#bulkClear", el).addEventListener("click", () => { state.selected.clear(); draw(); });
    $("#bulkDel", el).addEventListener("click", async () => {
      const ids = [...state.selected];
      if (!confirm(`Permanently delete ${ids.length} lead(s)? This cannot be undone.`)) return;
      try {
        await api("lead_delete", { method: "POST", body: { ids } });
        state.leads = state.leads.filter((l) => !state.selected.has(l.id));
        state.selected.clear(); updateNewCount(); draw(); toast(`Deleted ${ids.length} lead(s)`);
      } catch (e) { toast(e.message, true); }
    });
    $("#bulkStatus", el).addEventListener("change", async (e) => {
      const s = e.target.value; if (!s) return;
      const ids = [...state.selected];
      try {
        for (const id of ids) { const r = await api("lead_update", { method: "POST", body: { id, status: s } }); replaceLead(r.lead); }
        state.selected.clear(); updateNewCount(); draw(); toast(`Updated ${ids.length} lead(s)`);
      } catch (err) { toast(err.message, true); }
      e.target.value = "";
    });
    leadsView.redraw = draw;
    draw();
  }
  function replaceLead(l) { const i = state.leads.findIndex((x) => x.id === l.id); if (i > -1) state.leads[i] = l; }

  /* ---------- Lead drawer ---------- */
  function openLead(id) {
    const l = state.leads.find((x) => x.id === id);
    if (!l) return;
    state.seen.add(id); saveSeen();
    const d = $("#drawer");
    const a = l.attr || {};
    const kv = (k, v) => (v ? `<dt>${k}</dt><dd>${v}</dd>` : "");
    d.innerHTML = `
      <div class="drawer-head">
        <div><h2>${esc(l.name)}</h2><small>${esc(l.company || "Individual")} · ${fmtDate(l.created_at)} · #${esc(l.id)}</small></div>
        <button class="icon-btn" id="dclose" aria-label="Close">${icon("x")}</button>
      </div>
      <div class="drawer-body">
        <div class="d-actions">
          <a class="btn btn--primary" href="${telHref(l.phone)}">${icon("phone")} Call</a>
          <a class="btn btn--ghost" href="${waHref(l.phone)}" target="_blank" rel="noopener">WhatsApp</a>
        </div>
        <div><div class="sec-title">Status</div>
          <div class="status-pick">${STATUSES.map((s) => `<button type="button" class="status s-${s} ${l.status === s ? "on" : ""}" data-s="${s}">${s}</button>`).join("")}</div>
        </div>
        <div><div class="sec-title">Details</div>
          <dl class="kv">
            ${kv("Phone", `<a href="${telHref(l.phone)}" style="color:var(--accent)">${esc(l.phone)}</a>`)}
            ${kv("Email", l.email ? `<a href="mailto:${esc(l.email)}" style="color:var(--accent)">${esc(l.email)}</a>` : "")}
            ${kv("Company", esc(l.company))}
            ${kv("City", esc(l.city))}
            ${kv("Category", esc(l.category))}
            ${kv("Quantity", esc(l.quantity))}
            ${kv("Message", esc(l.message).replace(/\n/g, "<br>"))}
          </dl>
        </div>
        <div><div class="sec-title">Deal value (₹)</div>
          <div style="display:flex;gap:8px"><input class="input" id="dval" type="number" min="0" step="100" value="${l.value != null ? esc(l.value) : ""}" placeholder="e.g. 45000" style="height:42px"><button class="btn btn--ghost btn--sm" id="dvalSave" style="--h:42px">Save</button></div>
        </div>
        <div><div class="sec-title">Notes</div>
          <div class="notes">${(l.notes || []).map((n) => `<div class="note"><small>${fmtDate(n.at)}</small>${esc(n.text)}</div>`).join("") || '<div class="muted" style="color:var(--text-3);font-size:14px">No notes yet.</div>'}</div>
          <div style="display:flex;gap:8px;margin-top:10px"><input class="input" id="dnote" placeholder="Add a note (e.g. called, quoted ₹25/kg)…" style="height:42px"><button class="btn btn--dark btn--sm" id="dnoteAdd" style="--h:42px">Add</button></div>
        </div>
        <div><div class="sec-title">Attribution</div>
          <dl class="kv">
            ${kv("Source", esc(l.source))}
            ${kv("Campaign", esc(a.utm_campaign))}
            ${kv("Medium", esc(a.utm_medium))}
            ${kv("Keyword", esc(a.utm_term))}
            ${kv("Ad content", esc(a.utm_content))}
            ${kv("GCLID", a.gclid ? `<span style="font-size:12px">${esc(a.gclid)}</span>` : "")}
            ${kv("Landing", esc(a.landing))}
            ${kv("Referrer", esc(a.referrer))}
            ${kv("Form", esc([l.form, l.page].filter(Boolean).join(" · ")))}
            ${kv("Email alert", esc(l.email_status))}
          </dl>
        </div>
        <button class="btn btn--ghost btn--sm" id="ddel" style="color:#ef4444;justify-self:start">${icon("trash")} Delete lead</button>
      </div>`;
    d.classList.add("open"); d.setAttribute("aria-hidden", "false");
    $("#drawerBg").classList.add("open");
    const refresh = (nl) => { replaceLead(nl); updateNewCount(); openLead(id); if (leadsView.redraw && location.hash === "#leads") leadsView.redraw(); };
    $("#dclose").addEventListener("click", closeLead);
    $$(".status-pick button", d).forEach((b) => b.addEventListener("click", async () => {
      try { const r = await api("lead_update", { method: "POST", body: { id, status: b.dataset.s } }); refresh(r.lead); toast("Status updated"); } catch (e) { toast(e.message, true); }
    }));
    const addNote = async () => {
      const v = $("#dnote").value.trim(); if (!v) return;
      try { const r = await api("lead_update", { method: "POST", body: { id, note: v } }); refresh(r.lead); toast("Note added"); } catch (e) { toast(e.message, true); }
    };
    $("#dnoteAdd").addEventListener("click", addNote);
    $("#dnote").addEventListener("keydown", (e) => e.key === "Enter" && addNote());
    $("#dvalSave").addEventListener("click", async () => {
      try { const r = await api("lead_update", { method: "POST", body: { id, value: $("#dval").value || 0 } }); refresh(r.lead); toast("Value saved"); } catch (e) { toast(e.message, true); }
    });
    $("#ddel").addEventListener("click", async () => {
      if (!confirm(`Permanently delete the lead from ${l.name}? This cannot be undone.`)) return;
      try {
        await api("lead_delete", { method: "POST", body: { ids: [id] } });
        state.leads = state.leads.filter((x) => x.id !== id); updateNewCount(); closeLead(); route(); toast("Lead deleted");
      } catch (e) { toast(e.message, true); }
    });
    // mark row as read
    const tr = $(`#ltb tr[data-id="${CSS.escape(id)}"]`); if (tr) tr.classList.remove("unread");
  }
  function closeLead() { $("#drawer").classList.remove("open"); $("#drawer").setAttribute("aria-hidden", "true"); $("#drawerBg").classList.remove("open"); }
  $("#drawerBg").addEventListener("click", closeLead);
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeLead());

  /* =========================================================
     CONTENT EDITORS
     ========================================================= */
  function savebar(el, getPatch, label = "Save changes") {
    const bar = document.createElement("div");
    bar.className = "savebar";
    bar.innerHTML = `<span>You have unsaved changes</span><div style="display:flex;gap:8px"><button class="btn btn--sm" data-x style="background:transparent;color:inherit">Discard</button><button class="btn btn--primary btn--sm" data-s>${label}</button></div>`;
    el.appendChild(bar);
    const mark = () => { dirty = true; bar.classList.add("show"); };
    el.addEventListener("input", mark);
    el.addEventListener("change", mark);
    $("[data-x]", bar).addEventListener("click", () => { dirty = false; route(); });
    $("[data-s]", bar).addEventListener("click", async () => {
      const btn = $("[data-s]", bar);
      btn.disabled = true;
      try {
        const r = await api("settings_save", { method: "POST", body: { settings: getPatch() } });
        state.settings = r.settings; dirty = false; bar.classList.remove("show"); toast("Saved — live on the website");
      } catch (e) { toast(e.message, true); }
      btn.disabled = false;
    });
    return mark;
  }
  const field = (id, label, val, opts = {}) => `
    <div class="field ${opts.full ? "full" : ""}"><label for="${id}">${label}</label>
      ${opts.area ? `<textarea class="textarea" id="${id}" ${opts.ph ? `placeholder="${esc(opts.ph)}"` : ""}>${esc(val)}</textarea>` : `<input class="input" id="${id}" value="${esc(val)}" ${opts.ph ? `placeholder="${esc(opts.ph)}"` : ""} ${opts.type ? `type="${opts.type}"` : ""}>`}
      ${opts.help ? `<span class="help">${opts.help}</span>` : ""}</div>`;

  function contentView(el) {
    const s = state.settings;
    const stats = (s.stats || []).concat([{}, {}, {}, {}]).slice(0, 4);
    el.innerHTML = `
      <div class="panel" style="margin-bottom:14px">
        <div class="panel-head"><h2>Contact details</h2><span class="hint">Shown in header, call bar, footer & contact page</span></div>
        <div class="form-2">
          ${field("phone", "Phone (display)", s.phone, { ph: "+91 96439 47123" })}
          ${field("phone_raw", "Phone (for call button)", s.phone_raw, { ph: "+919643947123", help: "Digits with country code, no spaces" })}
          ${field("whatsapp", "WhatsApp number", s.whatsapp, { ph: "919643947123", help: "Country code + number, digits only" })}
          ${field("hours", "Working hours", s.hours)}
          ${field("email", "Primary email", s.email, { type: "email" })}
          ${field("email_alt", "Secondary email", s.email_alt, { type: "email" })}
          ${field("address", "Office address", s.address, { full: true, area: true })}
          ${field("whatsapp_message", "WhatsApp pre-filled message", s.whatsapp_message, { full: true })}
        </div>
      </div>
      <div class="panel" style="margin-bottom:14px">
        <div class="panel-head"><h2>Hero announcement</h2><span class="hint">Small badge above the main headline</span></div>
        ${field("announcement", "Announcement text", s.announcement, { ph: "Now buying bulk IT scrap across Delhi-NCR" })}
      </div>
      <div class="panel">
        <div class="panel-head"><h2>Stats strip</h2><span class="hint">4 numbers shown on Home & About (animated count-up)</span></div>
        <div class="list-ed">${stats.map((st, i) => `
          <div class="li-row">
            ${field("sv" + i, "Number", st.value || "", { ph: "500" })}
            ${field("ss" + i, "Suffix", st.suffix || "", { ph: "+, %, h, T" })}
            ${field("sl" + i, "Label", st.label || "", { ph: "Tonnes recycled" })}
          </div>`).join("")}</div>
      </div>`;
    savebar(el, () => ({
      phone: $("#phone").value, phone_raw: $("#phone_raw").value, whatsapp: $("#whatsapp").value, hours: $("#hours").value,
      email: $("#email").value, email_alt: $("#email_alt").value, address: $("#address").value, whatsapp_message: $("#whatsapp_message").value,
      announcement: $("#announcement").value,
      stats: [0, 1, 2, 3].map((i) => ({ value: $("#sv" + i).value, suffix: $("#ss" + i).value, label: $("#sl" + i).value })).filter((x) => x.label),
    }));
  }

  /* Generic list editor */
  function listEditor(el, { key, title, hint, fields, blank, render }) {
    let items = JSON.parse(JSON.stringify(state.settings[key] || []));
    el.innerHTML = `<div class="panel"><div class="panel-head"><div><h2>${title}</h2><span class="hint">${hint}</span></div><button class="btn btn--dark btn--sm" id="addItem">${icon("plus")} Add</button></div><div class="list-ed" id="items"></div></div>`;
    const mark = savebar(el, () => ({ [key]: items }));
    const box = $("#items", el);
    const draw = () => {
      box.innerHTML = items.length ? items.map((it, i) => `
        <div class="li-ed" data-i="${i}">
          <div class="li-tools">
            <span style="margin-right:auto;font-weight:700;color:var(--text-3);font-size:13px">#${i + 1}</span>
            <button type="button" data-a="up" aria-label="Move up">↑</button>
            <button type="button" data-a="down" aria-label="Move down">↓</button>
            <button type="button" class="del" data-a="del" aria-label="Remove">${icon("trash")}</button>
          </div>
          ${render ? render(it, i) : ""}
          <div class="li-row">${fields.map(([f, label, o = {}]) => `
            <div class="field" style="${o.area ? "grid-column:1/-1" : ""}"><label>${label}</label>
              ${o.area ? `<textarea class="textarea" data-f="${f}" placeholder="${esc(o.ph || "")}">${esc(it[f])}</textarea>`
                : o.select ? `<select class="select" data-f="${f}">${o.select.map((v) => `<option ${String(it[f]) === String(v) ? "selected" : ""}>${v}</option>`).join("")}</select>`
                : `<input class="input" data-f="${f}" value="${esc(it[f])}" placeholder="${esc(o.ph || "")}">`}
            </div>`).join("")}</div>
        </div>`).join("") : emptyBox("Nothing here yet — click Add.");
      $$(".li-ed", box).forEach((row) => {
        const i = +row.dataset.i;
        $$("[data-f]", row).forEach((inp) => inp.addEventListener("input", () => { items[i][inp.dataset.f] = inp.value; }));
        $$("[data-f]", row).forEach((inp) => inp.addEventListener("change", () => { items[i][inp.dataset.f] = inp.value; }));
        $$("[data-a]", row).forEach((b) => b.addEventListener("click", () => {
          const a = b.dataset.a;
          if (a === "del") { if (!confirm("Remove this item?")) return; items.splice(i, 1); }
          if (a === "up" && i > 0) [items[i - 1], items[i]] = [items[i], items[i - 1]];
          if (a === "down" && i < items.length - 1) [items[i + 1], items[i]] = [items[i], items[i + 1]];
          mark(); draw();
        }));
      });
      listEditor.after && listEditor.after(box, items, mark, draw);
    };
    $("#addItem", el).addEventListener("click", () => { items.push(Object.assign({}, blank)); mark(); draw(); box.lastElementChild && box.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" }); });
    draw();
  }

  /* Image field helpers (shared by certificates, client logos, gallery) */
  function imgField(it, field, label) {
    return `<div class="cert-row">
        <div class="cert-thumb">${it[field] ? `<img src="../${esc(it[field])}" alt="">` : "No image"}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn btn--ghost btn--sm" data-up>${it[field] ? "Replace" : "Upload"} ${label}</button>${it[field] ? '<button type="button" class="btn btn--ghost btn--sm" data-rm>Remove</button>' : ""}
        <input type="file" accept="image/jpeg,image/png,image/webp" hidden></div>
        <span class="hint" style="font-size:12.5px;color:var(--text-3)">JPG / PNG / WEBP, max 6 MB</span></div>`;
  }
  function uploadHook(field) {
    return (box, items, mark, draw) => {
      $$(".li-ed", box).forEach((row) => {
        const i = +row.dataset.i;
        const up = $("[data-up]", row), file = $("input[type=file]", row), rm = $("[data-rm]", row);
        if (up) up.addEventListener("click", () => file.click());
        if (rm) rm.addEventListener("click", () => { items[i][field] = ""; mark(); draw(); });
        if (file) file.addEventListener("change", async () => {
          const f = file.files[0]; if (!f) return;
          const fd = new FormData(); fd.append("file", f);
          up.disabled = true; up.textContent = "Uploading…";
          try { const r = await api("upload", { method: "POST", form: fd }); items[i][field] = r.path; mark(); draw(); toast("Uploaded — click Save"); }
          catch (e) { toast(e.message, true); up.disabled = false; up.textContent = "Upload"; }
        });
      });
    };
  }

  function certsView(el) {
    listEditor.after = uploadHook("image");
    listEditor(el, {
      key: "certificates", title: "Certificates & registrations",
      hint: "Upload scans of GST, MSME, recycler authorisations, ISO etc. Shown on Home and Certificates page.",
      blank: { title: "", desc: "", tag: "", image: "" },
      fields: [["title", "Title", { ph: "GST Registration" }], ["tag", "Badge", { ph: "Verified" }], ["desc", "Short description", { area: true }]],
      render: (it) => imgField(it, "image", "image"),
    });
  }

  function clientsView(el) {
    listEditor.after = uploadHook("logo");
    listEditor(el, {
      key: "clients", title: "Client logos",
      hint: "Shown as a scrolling logo wall on the home page (\"Some of our corporate clients\"). Only add companies you have actually worked with. Transparent PNG works best.",
      blank: { name: "", logo: "" },
      fields: [["name", "Company name", { ph: "Company name" }]],
      render: (it) => imgField(it, "logo", "logo"),
    });
  }

  function partnersView(el) {
    listEditor.after = uploadHook("logo");
    listEditor(el, {
      key: "partners", title: "Trusted partners",
      hint: "Recyclers, refurbishers and logistics partners you work with. Shown in the “Our trusted partners” section. Until you add any, the site shows partner categories instead.",
      blank: { name: "", type: "Authorised Recycler", logo: "" },
      fields: [["name", "Partner name", { ph: "Partner company" }], ["type", "Partner type", { select: ["Authorised Recycler", "Refurbishment Partner", "Battery Recycler", "Logistics Partner", "Other"] }]],
      render: (it) => imgField(it, "logo", "logo"),
    });
  }

  function galleryView(el) {
    listEditor.after = uploadHook("image");
    listEditor(el, {
      key: "gallery", title: "Gallery photos",
      hint: "Photos of your pickups, clearances and team. First 6 show on the home page; all show on the Gallery page. Use “Add many” to upload several at once.",
      blank: { image: "", caption: "", category: "Pickups" },
      fields: [["caption", "Caption", { ph: "Office clearance, Gurugram" }], ["category", "Category", { select: ["Pickups", "IT Assets", "Cables & Scrap", "Data Destruction", "Team", "Events", "Other"] }]],
      render: (it) => imgField(it, "image", "photo"),
    });
    // Bulk upload
    const head = $(".panel-head", el);
    const bulk = document.createElement("label");
    bulk.className = "btn btn--ghost btn--sm";
    bulk.style.cursor = "pointer";
    bulk.innerHTML = `${icon("plus")} Add many<input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden>`;
    head.insertBefore(bulk, $("#addItem", el));
    $("input", bulk).addEventListener("change", async (e) => {
      const files = [...e.target.files];
      if (!files.length) return;
      toast(`Uploading ${files.length} photo(s)…`);
      const added = [];
      for (const f of files) {
        const fd = new FormData(); fd.append("file", f);
        try { const r = await api("upload", { method: "POST", form: fd }); added.push({ image: r.path, caption: "", category: "Pickups" }); }
        catch (err) { toast(f.name + ": " + err.message, true); }
      }
      if (!added.length) return;
      const cur = (state.settings.gallery || []).concat(added);
      try {
        const r = await api("settings_save", { method: "POST", body: { settings: { gallery: cur } } });
        state.settings = r.settings; dirty = false; toast(`${added.length} photo(s) added`); route();
      } catch (err) { toast(err.message, true); }
    });
  }

  function testiView(el) {
    listEditor.after = null;
    listEditor(el, {
      key: "testimonials", title: "Client testimonials",
      hint: "Only testimonials marked Published = Yes appear on the website. The samples are drafts — replace them with real client feedback before publishing.",
      blank: { name: "", role: "", company: "", text: "", rating: "5", published: "Yes" },
      fields: [["name", "Name", { ph: "Rahul Sharma" }], ["role", "Designation", { ph: "IT Manager" }], ["company", "Company", { ph: "Company name" }], ["rating", "Rating", { select: ["5", "4", "3"] }], ["published", "Published", { select: ["Yes", "No"] }], ["text", "Feedback", { area: true }]],
    });
  }
  function faqView(el) {
    listEditor.after = null;
    listEditor(el, {
      key: "faqs", title: "Frequently asked questions",
      hint: "Shown on the home page and added to Google FAQ rich results.",
      blank: { q: "", a: "" },
      fields: [["q", "Question", {}], ["a", "Answer", { area: true }]],
    });
  }

  /* =========================================================
     SETTINGS
     ========================================================= */
  function settingsView(el) {
    const s = state.settings, a = s.analytics || {};
    el.innerHTML = `
      <div class="panel" style="margin-bottom:14px">
        <div class="panel-head"><div><h2>Lead email alerts</h2><span class="hint">Sent instantly via Resend for every new lead</span></div><button class="btn btn--ghost btn--sm" id="testMail">Send test email</button></div>
        <div class="form-2">
          ${field("notify_emails", "Send new-lead alerts to", s.notify_emails, { full: true, help: "Comma-separated emails" })}
          <div class="field full" style="flex-direction:row;align-items:center;gap:12px">
            <label class="switch"><input type="checkbox" id="autoreply" ${s.autoreply_enabled ? "checked" : ""}><span></span></label>
            <span><b style="font-size:14.5px">Auto-reply to customers</b><br><span class="help" style="font-size:12.5px;color:var(--text-3)">Sends a "we received your request" email when the customer enters an email.</span></span>
          </div>
        </div>
      </div>
      <div class="panel" style="margin-bottom:14px">
        <div class="panel-head"><div><h2>Ads & analytics tracking</h2><span class="hint">For Google Ads / Meta campaigns — conversions fire on the thank-you page and on Call / WhatsApp clicks</span></div></div>
        <div class="form-2">
          ${field("ga4", "Google Analytics 4 ID", a.ga4, { ph: "G-XXXXXXXXXX" })}
          ${field("gads", "Google Ads ID", a.gads, { ph: "AW-123456789" })}
          ${field("gads_lead_label", "Google Ads lead conversion label", a.gads_lead_label, { ph: "AbC-D_efG-h12_34-567" })}
          ${field("gads_call_label", "Google Ads call-click conversion label", a.gads_call_label, { ph: "XyZ-12_ab" })}
          ${field("meta_pixel", "Meta (Facebook) Pixel ID", a.meta_pixel, { ph: "123456789012345" })}
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>Change login</h2></div>
        <form id="pwForm" class="form-2" autocomplete="off">
          ${field("pw_user", "Username", "", { ph: "admin" })}
          <div class="field"><label for="pw_cur">Current password</label><input class="input" id="pw_cur" type="password" autocomplete="current-password"></div>
          <div class="field"><label for="pw_new">New password</label><input class="input" id="pw_new" type="password" autocomplete="new-password" minlength="10"><span class="help">At least 10 characters</span></div>
          <div class="field"><label for="pw_new2">Confirm new password</label><input class="input" id="pw_new2" type="password" autocomplete="new-password"></div>
          <div class="full"><button class="btn btn--dark" type="submit">Update login</button></div>
        </form>
      </div>`;
    const pwPanel = $("#pwForm", el);
    // Password form should not trigger the settings savebar
    ["input", "change"].forEach((ev) => pwPanel.addEventListener(ev, (e) => e.stopPropagation()));
    savebar(el, () => ({
      notify_emails: $("#notify_emails").value,
      autoreply_enabled: $("#autoreply").checked,
      analytics: { ga4: $("#ga4").value.trim(), gads: $("#gads").value.trim(), gads_lead_label: $("#gads_lead_label").value.trim(), gads_call_label: $("#gads_call_label").value.trim(), meta_pixel: $("#meta_pixel").value.trim() },
    }));
    $("#testMail", el).addEventListener("click", async (e) => {
      e.target.disabled = true;
      try { await api("test_email", { method: "POST" }); toast("Test email sent ✔"); } catch (err) { toast("Email failed: " + err.message, true); }
      e.target.disabled = false;
    });
    pwPanel.addEventListener("submit", async (e) => {
      e.preventDefault();
      const n1 = $("#pw_new").value, n2 = $("#pw_new2").value;
      if (n1 !== n2) return toast("New passwords do not match", true);
      try {
        await api("password", { method: "POST", body: { username: $("#pw_user").value.trim() || undefined, current: $("#pw_cur").value, new: n1 } });
        pwPanel.reset(); toast("Login updated");
      } catch (err) { toast(err.message, true); }
    });
  }

  /* ---------- boot ---------- */
  async function boot() {
    const me = await fetch(`${API}?action=me`, { credentials: "same-origin" }).then((r) => r.json()).catch(() => ({}));
    if (!me.auth) return showLogin();
    showApp();
    await loadData();
    route();
    // Poll for new leads every 60s
    clearInterval(boot.t);
    boot.t = setInterval(async () => {
      try {
        const before = state.leads.length ? state.leads[0].id : null;
        const r = await api("leads");
        state.leads = r.leads || [];
        updateNewCount();
        if (state.leads.length && state.leads[0].id !== before) {
          toast("🔔 New lead: " + state.leads[0].name);
          if (!dirty && ["#overview", "#leads", ""].includes(location.hash)) route();
        }
      } catch (e) {}
    }, 60000);
  }
  buildNav();
  boot();
})();
