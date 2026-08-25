/* Vitta — sistema pessoal de organização
   Estado em memória + localStorage. Sem dependências. */

/* ---------------------------------------------------------------- utilidades */

const $ = s => document.querySelector(s);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const pad = n => String(n).padStart(2, "0");
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDate = v => new Date(v + "T12:00");
const isDate = v => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(parseDate(v));
const today = () => iso(new Date());
const shift = n => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d) };
const dayDiff = (v, ref = today()) => Math.round((parseDate(v) - parseDate(ref)) / 864e5);
const sameMonth = (v, ref = today()) => {
  if (!isDate(v)) return false;
  const a = parseDate(v), b = parseDate(ref);
  return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
};
const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
const pct = (part, total) => (total ? Math.round(part / total * 100) : 0);

const CURRENCIES = {
  BRL: { label: "Real brasileiro (R$)", locale: "pt-BR" },
  USD: { label: "US Dollar ($)", locale: "en-US" },
  EUR: { label: "Euro (€)", locale: "pt-PT" },
};

const money = n => {
  const c = CURRENCIES[state.profile.currency] ? state.profile.currency : "BRL";
  return new Intl.NumberFormat(CURRENCIES[c].locale, { style: "currency", currency: c }).format(n || 0);
};
const dayLabel = v => isDate(v)
  ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(parseDate(v))
  : "sem data";
const monthAbbr = v => new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(parseDate(v)).replace(".", "").toUpperCase();
const fullDate = d => new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(d);
const greeting = h => (h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite");
const firstName = n => String(n || "").trim().split(/\s+/)[0] || "você";
const initials = n => String(n || "").trim().split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase() || "V";

/* -------------------------------------------------------------------- ícones */

const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ICON = {
  home: svg('<path d="M3.5 10.4 12 3.5l8.5 6.9"/><path d="M5.8 9.2V20.5h12.4V9.2"/><path d="M10 20.5v-5.6h4v5.6"/>'),
  wallet: svg('<rect x="3" y="6" width="18" height="13.5" rx="3.2"/><path d="M3 10.2h18"/><circle cx="16.8" cy="14.8" r="1.25"/>'),
  calendar: svg('<rect x="3.2" y="5.2" width="17.6" height="15.6" rx="3.2"/><path d="M3.2 10.2h17.6M8.2 3v4.2M15.8 3v4.2"/>'),
  check: svg('<path d="M20.5 7 10 17.5 4.5 12"/>'),
  target: svg('<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1"/>'),
  repeat: svg('<path d="M4 9.2a5 5 0 0 1 5-5h10.4"/><path d="m16.6 1.4 3.2 2.8-3.2 2.8"/><path d="M20 14.8a5 5 0 0 1-5 5H4.6"/><path d="m7.4 22.6-3.2-2.8 3.2-2.8"/>'),
  chart: svg('<path d="M3 20.5h18"/><path d="M6.5 20.5V12M12 20.5V4.5M17.5 20.5v-5.5"/>'),
  settings: svg('<circle cx="12" cy="12" r="3.1"/><path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5"/>'),
  search: svg('<circle cx="11" cy="11" r="6.6"/><path d="m16 16 4.4 4.4"/>'),
  bell: svg('<path d="M18 8.6a6 6 0 1 0-12 0c0 5.2-2 6.8-2 6.8h16s-2-1.6-2-6.8"/><path d="M13.7 19.4a2 2 0 0 1-3.4 0"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  download: svg('<path d="M12 3.5v11.5"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M4.5 19.5h15"/>'),
  trash: svg('<path d="M4.5 6.8h15"/><path d="M9.2 6.8V4.6h5.6v2.2"/><path d="M6.6 6.8 7.6 20a1 1 0 0 0 1 .9h6.8a1 1 0 0 0 1-.9l1-13.2"/>'),
  close: svg('<path d="M6 6 18 18M18 6 6 18"/>'),
  spark: svg('<path d="M12 3.2 13.9 9l5.8 1.9-5.8 1.9L12 18.6 10.1 12.8 4.3 10.9 10.1 9z"/>'),
  up: svg('<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>'),
  down: svg('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),
  right: svg('<path d="M5 12h13"/><path d="m12.5 6 6 6-6 6"/>'),
  layers: svg('<path d="m12 3.5 8.5 4.4-8.5 4.4-8.5-4.4z"/><path d="m4.4 12.4 7.6 3.9 7.6-3.9"/><path d="m4.4 16.6 7.6 3.9 7.6-3.9"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
};

const NAV = [
  ["Visão geral", "home"], ["Finanças", "wallet"], ["Agenda", "calendar"],
  ["Meu dia", "check"], ["Metas", "target"], ["Hábitos", "repeat"], ["Relatórios", "chart"],
];
const KIND_ICON = { "Finanças": "wallet", "Agenda": "calendar", "Meu dia": "check", "Metas": "target", "Hábitos": "repeat" };
const LABELS = { "Finanças": "Nova transação", "Agenda": "Novo compromisso", "Meu dia": "Nova tarefa", "Metas": "Nova meta", "Hábitos": "Novo hábito" };
const TABS = {
  "Finanças": ["Todos", "Receitas", "Despesas", "Contas"],
  "Agenda": ["Todos", "Hoje", "Semana", "Mês"],
  "Meu dia": ["Hoje", "Pendentes", "Concluídas"],
  "Metas": ["Todas", "Financeiras", "Pessoais", "Concluídas"],
  "Hábitos": ["Hoje", "Em andamento", "Concluídos"],
};
const SUBTITLE = {
  "Finanças": "Seu dinheiro, com total clareza.",
  "Agenda": "Tempo bem planejado, mente mais leve.",
  "Meu dia": "O essencial para hoje.",
  "Metas": "Transforme intenção em conquista.",
  "Hábitos": "Pequenos passos, grandes mudanças.",
};

/* --------------------------------------------------------------------- dados */

const seed = () => [
  { id: "t1", kind: "Finanças", title: "Salário", amount: 4250, date: shift(-14), category: "Receita", status: "recebido" },
  { id: "t2", kind: "Finanças", title: "Supermercado", amount: -428.9, date: shift(-3), category: "Alimentação", status: "pago" },
  { id: "t3", kind: "Finanças", title: "Netflix", amount: -55.9, date: shift(-5), category: "Assinaturas", status: "pago" },
  { id: "t4", kind: "Finanças", title: "Fatura do cartão", amount: -1280, date: shift(4), category: "Cartão", status: "pendente" },
  { id: "a1", kind: "Agenda", title: "Consulta médica", date: shift(1), category: "Pessoal", status: "pendente", note: "14:30 · Clínica São Lucas" },
  { id: "a2", kind: "Agenda", title: "Apresentação do projeto", date: shift(3), category: "Trabalho", status: "pendente", note: "09:00 · Reunião online" },
  { id: "d1", kind: "Meu dia", title: "Revisar planejamento semanal", date: today(), category: "Prioridade alta", status: "pendente" },
  { id: "d2", kind: "Meu dia", title: "Separar documentos", date: today(), category: "Pessoal", status: "concluído" },
  { id: "m1", kind: "Metas", title: "Viagem para Europa", amount: 9600, date: shift(120), category: "Financeira", status: "andamento", progress: 60, note: "Meta: R$ 16.000" },
  { id: "m2", kind: "Metas", title: "Comprar meu carro", amount: 18000, date: shift(300), category: "Financeira", status: "andamento", progress: 45, note: "Meta: R$ 40.000" },
  { id: "h1", kind: "Hábitos", title: "Academia", date: today(), category: "Saúde", status: "feito", progress: 86, note: "Sequência de 12 dias" },
  { id: "h2", kind: "Hábitos", title: "Ler 30 minutos", date: today(), category: "Conhecimento", status: "pendente", progress: 65, note: "Sequência de 5 dias" },
];

const DEFAULT_PROFILE = { name: "Yggor Pires", email: "yggor@email.com", currency: "BRL" };

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
const loadItems = () => read("vitta-html-records", null) || seed();
const loadProfile = () => ({ ...DEFAULT_PROFILE, ...read("vitta-html-profile", {}) });

function save() {
  try {
    localStorage.setItem("vitta-html-records", JSON.stringify(state.items));
    localStorage.setItem("vitta-html-profile", JSON.stringify(state.profile));
  } catch { toast("Não foi possível salvar neste navegador") }
}

const isDone = x => ["concluído", "feito"].includes(x.status);

let state = {
  active: "Visão geral", tab: "Todos", query: "", menu: false, notice: false,
  items: loadItems(), profile: loadProfile(),
};

/* ------------------------------------------------------------------- filtros */

function matchTab(x, tab) {
  switch (tab) {
    case "Todos": case "Todas": return true;
    case "Receitas": return x.amount > 0;
    case "Despesas": return x.amount < 0;
    case "Contas": return x.amount < 0 && !["pago", "recebido"].includes(x.status);
    case "Hoje": return x.date === today();
    case "Semana": { const d = dayDiff(x.date); return d >= 0 && d < 7 }
    case "Mês": return sameMonth(x.date);
    case "Pendentes": case "Em andamento": return !isDone(x);
    case "Concluídas": case "Concluídos": return isDone(x);
    case "Financeiras": return x.category === "Financeira";
    case "Pessoais": return x.category !== "Financeira";
    default: return true;
  }
}

/* --------------------------------------------------------------------- ações */

function toast(t) {
  const el = document.createElement("div");
  el.className = "toast";
  const mark = document.createElement("i");
  mark.innerHTML = ICON.check;
  el.appendChild(mark);
  el.appendChild(document.createTextNode(t));
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function active(v) {
  state.active = v;
  state.tab = TABS[v] ? TABS[v][0] : "Todos";
  state.query = ""; state.menu = false; state.notice = false;
  render();
}
const setTab = t => { state.tab = t; render() };
const toggleMenu = () => { state.menu = !state.menu; render() };
const toggleNotice = () => { state.notice = !state.notice; render() };
const onSearch = v => { state.query = v; render() };
const clearQuery = () => { state.query = ""; render() };

function toggle(id) {
  state.items = state.items.map(x => x.id !== id ? x : {
    ...x, status: isDone(x) ? "pendente" : x.kind === "Hábitos" ? "feito" : "concluído",
  });
  save(); render(); toast("Status atualizado");
}

function remove(id) {
  const item = state.items.find(x => x.id === id);
  if (!item) return;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" onclick="closeModal(event)">
      <div class="modal modal-sm">
        <span class="modal-kicker">EXCLUIR REGISTRO</span>
        <h2>Excluir “${esc(item.title)}”?</h2>
        <p>Esta ação não pode ser desfeita.</p>
        <div class="modal-actions">
          <button type="button" class="ghost" onclick="closeModal(event,true)">Cancelar</button>
          <button type="button" class="danger" onclick="removeConfirmed('${esc(id)}')">Excluir</button>
        </div>
      </div>
    </div>`);
}

function removeConfirmed(id) {
  state.items = state.items.filter(x => x.id !== id);
  save();
  document.querySelector(".modal-backdrop")?.remove();
  render();
  toast("Registro excluído");
}

function closeModal(e, force) {
  if (force) return e.target.closest(".modal-backdrop").remove();
  if (e.target === e.currentTarget) e.currentTarget.remove();
}

function modal(kind) {
  const isMoney = kind === "Finanças";
  const hasProgress = ["Metas", "Hábitos"].includes(kind);
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" onclick="closeModal(event)">
      <form class="modal" onsubmit="createRecord(event,'${esc(kind)}')">
        <button type="button" class="close" onclick="closeModal(event,true)">${ICON.close}</button>
        <span class="modal-kicker">NOVO REGISTRO</span>
        <h2>${esc(LABELS[kind])}</h2>
        <p>Preencha os detalhes para manter sua vida organizada.</p>
        <label>Nome<input name="title" required autofocus placeholder="Como você quer chamar?"></label>
        ${isMoney ? `<div class="two">
          <label>Tipo<select name="type"><option>Despesa</option><option>Receita</option></select></label>
          <label>Valor<input name="amount" required inputmode="decimal" placeholder="0,00"></label>
        </div>` : ""}
        <div class="two">
          <label>Categoria<input name="category" required placeholder="Ex.: Pessoal"></label>
          <label>Data<input name="date" type="date" value="${today()}" required></label>
        </div>
        ${hasProgress ? `<label>Progresso<input name="progress" type="number" min="0" max="100" value="0"></label>` : ""}
        <label>Observação<textarea name="note" placeholder="Adicione um detalhe se desejar"></textarea></label>
        <div class="modal-actions">
          <button type="button" class="ghost" onclick="closeModal(event,true)">Cancelar</button>
          <button class="primary">Salvar registro</button>
        </div>
      </form>
    </div>`);
}

function createRecord(e, kind) {
  e.preventDefault();
  const f = new FormData(e.target);
  const raw = Number(String(f.get("amount") || 0).replace(/\./g, "").replace(",", "."));
  if (kind === "Finanças" && !isFinite(raw)) return toast("Informe um valor numérico");
  const progress = Math.min(100, Math.max(0, Number(f.get("progress") || 0)));
  state.items.unshift({
    id: crypto.randomUUID(),
    kind,
    title: String(f.get("title") || "").trim(),
    amount: kind === "Finanças" ? (f.get("type") === "Despesa" ? -Math.abs(raw) : Math.abs(raw)) : undefined,
    date: f.get("date"),
    category: String(f.get("category") || "").trim(),
    status: kind === "Metas" ? "andamento" : "pendente",
    note: String(f.get("note") || "").trim(),
    progress,
  });
  save();
  e.target.closest(".modal-backdrop").remove();
  render();
  toast("Registro salvo com sucesso");
}

function profile() {
  const p = state.profile;
  const options = Object.entries(CURRENCIES)
    .map(([code, c]) => `<option value="${code}" ${p.currency === code ? "selected" : ""}>${esc(c.label)}</option>`).join("");
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" onclick="closeModal(event)">
      <form class="modal" onsubmit="saveProfile(event)">
        <button type="button" class="close" onclick="closeModal(event,true)">${ICON.close}</button>
        <span class="modal-kicker">PREFERÊNCIAS</span>
        <h2>Seu perfil</h2>
        <p>Usado na saudação, no seu avatar e no formato dos valores.</p>
        <label>Nome<input name="name" required value="${esc(p.name)}"></label>
        <label>E-mail<input name="email" type="email" value="${esc(p.email)}"></label>
        <label>Moeda<select name="currency">${options}</select></label>
        <div class="modal-actions">
          <button type="button" class="ghost" onclick="closeModal(event,true)">Cancelar</button>
          <button class="primary">Salvar alterações</button>
        </div>
      </form>
    </div>`);
}

function saveProfile(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  state.profile = {
    name: String(f.get("name") || "").trim() || DEFAULT_PROFILE.name,
    email: String(f.get("email") || "").trim(),
    currency: CURRENCIES[f.get("currency")] ? f.get("currency") : "BRL",
  };
  save();
  e.target.closest(".modal-backdrop").remove();
  render();
  toast("Preferências atualizadas");
}

function exportData() {
  const blob = new Blob([JSON.stringify({ profile: state.profile, items: state.items }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `vitta-dados-${today()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast("Seus dados foram exportados");
}

/* ------------------------------------------------------------------ derivado */

function finances() {
  const all = state.items.filter(x => x.kind === "Finanças");
  const month = all.filter(x => sameMonth(x.date));
  const income = month.filter(x => x.amount > 0).reduce((a, x) => a + x.amount, 0);
  const expense = Math.abs(month.filter(x => x.amount < 0).reduce((a, x) => a + x.amount, 0));
  const balance = all.reduce((a, x) => a + (x.amount || 0), 0);
  const upcoming = all
    .filter(x => x.amount < 0 && !["pago", "recebido"].includes(x.status) && isDate(x.date) && dayDiff(x.date) >= 0)
    .sort(byDate)[0];
  return {
    all, month, income, expense, balance, upcoming,
    incomeCount: month.filter(x => x.amount > 0).length,
    expenseCount: month.filter(x => x.amount < 0).length,
    savingRate: income ? Math.round((income - expense) / income * 100) : 0,
    budgetUsed: income ? Math.min(100, Math.round(expense / income * 100)) : 0,
  };
}

/* Saldo acumulado no fim de cada um dos últimos 12 dias.
   A base da barra fica abaixo do menor valor para a variação ficar visível. */
function flowSeries(items) {
  const days = Array.from({ length: 12 }, (_, i) => shift(i - 11));
  let running = items
    .filter(x => isDate(x.date) && x.date < days[0])
    .reduce((a, x) => a + (x.amount || 0), 0);
  const values = days.map(d => {
    running += items.filter(x => x.date === d).reduce((a, x) => a + (x.amount || 0), 0);
    return running;
  });
  const lo = Math.min(...values), hi = Math.max(...values);
  const base = lo - (hi - lo || Math.abs(hi) || 1) * 0.4;
  return { days, values, height: v => Math.round((v - base) / (hi - base || 1) * 100) };
}

function notifications() {
  const list = [];
  const f = finances();
  const next = state.items.filter(x => x.kind === "Agenda" && isDate(x.date) && dayDiff(x.date) >= 0).sort(byDate)[0];
  if (next) {
    const d = dayDiff(next.date);
    list.push(`${next.title} ${d === 0 ? "é hoje" : d === 1 ? "é amanhã" : `em ${d} dias`}.`);
  }
  if (f.upcoming) list.push(`${f.upcoming.title} vence em ${dayLabel(f.upcoming.date).replace(/.$/, "")}.`);
  if (f.budgetUsed >= 80) list.push(`Você já usou ${f.budgetUsed}% da sua receita do mês.`);
  const pending = state.items.filter(x => x.kind === "Meu dia" && !isDone(x)).length;
  if (pending) list.push(`${pending} tarefa${pending > 1 ? "s" : ""} ainda pendente${pending > 1 ? "s" : ""}.`);
  return list;
}

/* ----------------------------------------------------------------- estrutura */

function shell(content) {
  const p = state.profile;
  const notices = notifications();
  return `
  <div class="app">
    <aside class="side ${state.menu ? "side-open" : ""}">
      <button class="logo" onclick="active('Visão geral')">
        <b>${ICON.spark}</b><span>vitta</span>
      </button>
      <div class="workspace">
        <i class="avatar">${esc(initials(p.name))}</i>
        <span><b>Espaço pessoal</b><small>organização completa</small></span>
      </div>
      <nav>${NAV.map(([name, ic]) => `
        <button class="nav-item ${state.active === name ? "selected" : ""}" onclick="active('${esc(name)}')">
          <i>${ICON[ic]}</i>${esc(name)}
        </button>`).join("")}
      </nav>
      <div class="side-footer">
        <button class="side-link" onclick="profile()"><i>${ICON.settings}</i>Configurações</button>
        <div class="upgrade">
          <span>${ICON.spark}</span>
          <b>Vitta Pro</b>
          <p>Mais clareza para seus objetivos.</p>
          <button onclick="toast('Planos estarão disponíveis em breve')">Ver benefícios</button>
        </div>
        <button class="mini-user" onclick="profile()">
          <i class="avatar">${esc(initials(p.name))}</i>
          <span><b>${esc(p.name)}</b><small>Meu perfil</small></span>
          <em>•••</em>
        </button>
      </div>
    </aside>
    ${state.menu ? `<div class="scrim" onclick="toggleMenu()"></div>` : ""}
    <section class="main">
      <header>
        <button class="mobile" onclick="toggleMenu()" aria-label="Abrir menu">${ICON.menu}</button>
        <label class="finder">
          <span>${ICON.search}</span>
          <input value="${esc(state.query)}" oninput="onSearch(this.value)" placeholder="Buscar registros, metas ou tarefas...">
          <kbd>⌘K</kbd>
        </label>
        <div class="top-actions">
          <button class="icon-btn notif ${notices.length ? "has-dot" : ""}" onclick="toggleNotice()" aria-label="Notificações">${ICON.bell}</button>
          <button class="top-avatar" onclick="profile()">${esc(initials(p.name))}</button>
        </div>
        ${state.notice ? `<div class="pop">
          <b>Notificações</b>
          ${notices.length ? notices.map(n => `<p>${esc(n)}</p>`).join("") : `<p>Tudo em dia por aqui.</p>`}
          <button onclick="toggleNotice()">Fechar</button>
        </div>` : ""}
      </header>
      ${content}
    </section>
  </div>`;
}

const stat = (ic, label, value, hint) => `
  <article class="stat">
    <i>${ICON[ic]}</i>
    <small>${esc(label)}</small>
    <b>${esc(value)}</b>
    <span>${esc(hint)}</span>
  </article>`;

const progressBar = v => `<i class="track"><em style="width:${Math.min(100, Math.max(0, Number(v) || 0))}%"></em></i>`;

/* --------------------------------------------------------------------- telas */

function overview() {
  const now = new Date();
  const f = finances();
  const flow = flowSeries(f.all);
  const tasks = state.items.filter(x => x.kind === "Meu dia" && (x.date === today() || !isDone(x))).slice(0, 5);
  const events = state.items.filter(x => x.kind === "Agenda" && isDate(x.date) && dayDiff(x.date) >= 0).sort(byDate).slice(0, 4);
  const goals = state.items.filter(x => x.kind === "Metas").sort((a, b) => (b.progress || 0) - (a.progress || 0)).slice(0, 3);
  const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(now);

  return `
  <div class="page">
    <div class="intro">
      <div>
        <p>${esc(fullDate(now).toUpperCase())}</p>
        <h1>${esc(greeting(now.getHours()))}, ${esc(firstName(state.profile.name))}</h1>
        <h2>Seu dia está sob controle.</h2>
      </div>
      <div class="actions">
        <button class="ghost" onclick="exportData()">${ICON.download} Exportar dados</button>
        <button class="primary" onclick="modal('Finanças')">${ICON.plus} Adicionar registro</button>
      </div>
    </div>

    <section class="stat-grid">
      ${stat("layers", "Patrimônio total", money(f.balance), `${f.all.length} lançamentos registrados`)}
      ${stat("down", "Receitas do mês", money(f.income), `${f.incomeCount} entrada${f.incomeCount === 1 ? "" : "s"} em ${monthName}`)}
      ${stat("up", "Despesas do mês", money(f.expense), `${f.expenseCount} saída${f.expenseCount === 1 ? "" : "s"} em ${monthName}`)}
      ${stat("spark", "Economia do mês", money(f.income - f.expense), `${f.savingRate}% da sua receita`)}
    </section>

    <section class="dashboard-grid">
      <article class="card flow">
        <div class="card-title">
          <div><b>Visão financeira</b><small>Saldo acumulado nos últimos 12 dias</small></div>
          <button onclick="active('Finanças')">Ver finanças ${ICON.right}</button>
        </div>
        <div class="flow-value">
          <strong>${esc(money(f.income - f.expense))}</strong>
          <span>saldo de ${esc(monthName)}</span>
        </div>
        <div class="bars">${flow.values.map((v, i) => `
          <i style="height:${Math.max(6, flow.height(v))}%" title="${esc(dayLabel(flow.days[i]))} · saldo ${esc(money(v))}"></i>`).join("")}
        </div>
        <div class="chart-labels">
          <span>${esc(dayLabel(flow.days[0]))}</span>
          <span>${esc(dayLabel(flow.days[4]))}</span>
          <span>${esc(dayLabel(flow.days[8]))}</span>
          <span>Hoje</span>
        </div>
      </article>

      <article class="card focus">
        <div class="card-title"><div><b>Foco de hoje</b><small>Um passo de cada vez</small></div></div>
        <div class="focus-list">${tasks.length ? tasks.map(x => `
          <button onclick="toggle('${esc(x.id)}')">
            <i class="${isDone(x) ? "complete" : ""}">${isDone(x) ? ICON.check : ""}</i>
            <span>${esc(x.title)}<small>${esc(x.category)}</small></span>
          </button>`).join("") : `<p class="muted-line">Nenhuma tarefa para hoje.</p>`}
        </div>
        <button class="text-action" onclick="active('Meu dia')">Abrir meu dia ${ICON.right}</button>
      </article>
    </section>

    <section class="dashboard-grid lower">
      <article class="card">
        <div class="card-title">
          <div><b>Próximos compromissos</b><small>Agenda dos próximos dias</small></div>
          <button onclick="active('Agenda')">Ver agenda ${ICON.right}</button>
        </div>
        <div class="agenda-list">${events.length ? events.map(x => `
          <div>
            <time><b>${parseDate(x.date).getDate()}</b><small>${esc(monthAbbr(x.date))}</small></time>
            <span><b>${esc(x.title)}</b><small>${esc(x.note || dayLabel(x.date))}</small></span>
            <em>${esc(x.category)}</em>
          </div>`).join("") : `<p class="muted-line">Nada agendado por enquanto.</p>`}
        </div>
      </article>

      <article class="card">
        <div class="card-title">
          <div><b>Metas em movimento</b><small>Continue avançando</small></div>
          <button onclick="active('Metas')">Ver metas ${ICON.right}</button>
        </div>
        ${goals.length ? goals.map(x => `
          <div class="compact-goal">
            <div><span>${esc(x.title)}<small>${esc(x.note || x.category)}</small></span><b>${Number(x.progress) || 0}%</b></div>
            ${progressBar(x.progress)}
          </div>`).join("") : `<p class="muted-line">Nenhuma meta cadastrada.</p>`}
      </article>
    </section>
  </div>`;
}

function record(x) {
  const done = isDone(x);
  const tail = x.kind === "Metas"
    ? `<div class="row-progress">${progressBar(x.progress)}<b>${Number(x.progress) || 0}%</b></div>`
    : x.amount !== undefined
      ? `<b class="${x.amount > 0 ? "positive" : "negative"}">${x.amount > 0 ? "+" : ""}${esc(money(x.amount))}</b>`
      : `<span class="pill">${esc(x.status)}</span>`;
  return `
  <div class="record">
    <button class="check ${done ? "complete" : ""}" onclick="toggle('${esc(x.id)}')" aria-label="Alternar status">${done ? ICON.check : ""}</button>
    <div class="record-icon">${ICON[KIND_ICON[x.kind]] || ICON.layers}</div>
    <div class="record-text">
      <b>${esc(x.title)}</b>
      <span>${esc(x.category)} · ${esc(dayLabel(x.date))}${x.note ? " · " + esc(x.note) : ""}</span>
    </div>
    ${tail}
    <button class="delete" onclick="remove('${esc(x.id)}')" aria-label="Excluir">${ICON.trash}</button>
  </div>`;
}

function modulePage(kind) {
  const tabs = TABS[kind];
  const all = state.items.filter(x => x.kind === kind);
  const list = all.filter(x => matchTab(x, state.tab));
  const f = finances();
  const totalToday = all.filter(x => x.date === today()).length;
  const doneToday = all.filter(x => x.date === today() && isDone(x)).length;

  return `
  <div class="page">
    <div class="module-intro">
      <div>
        <p>ORGANIZAÇÃO PESSOAL</p>
        <h1>${esc(kind)}</h1>
        <h2>${esc(SUBTITLE[kind])}</h2>
      </div>
      <button class="primary" onclick="modal('${esc(kind)}')">${ICON.plus} ${esc(LABELS[kind])}</button>
    </div>

    <div class="module-tabs">${tabs.map(t => `
      <button class="${state.tab === t ? "active" : ""}" onclick="setTab('${esc(t)}')">${esc(t)}</button>`).join("")}
    </div>

    ${kind === "Finanças" ? `<section class="summary">
      <article><small>Saldo disponível</small><b>${esc(money(f.balance))}</b><span>${f.all.length} lançamentos registrados</span></article>
      <article><small>Orçamento do mês</small><b>${f.budgetUsed}% utilizado</b>${progressBar(f.budgetUsed)}</article>
      <article><small>Próximo vencimento</small><b>${f.upcoming ? esc(dayLabel(f.upcoming.date)) : "Nada previsto"}</b><span>${f.upcoming ? esc(f.upcoming.title) : "Nenhuma conta em aberto"}</span></article>
    </section>` : ""}

    ${kind === "Hábitos" ? `<section class="habit-score">
      <span>SEU RITMO</span>
      <b>${doneToday}/${totalToday} hábitos concluídos hoje</b>
      ${progressBar(pct(doneToday, totalToday))}
    </section>` : ""}

    <article class="records card">
      <div class="records-head">
        <div>
          <b>${kind === "Finanças" ? "Movimentações" : "Seu acompanhamento"}</b>
          <small>${list.length} registro${list.length === 1 ? "" : "s"} em “${esc(state.tab)}”</small>
        </div>
        <button class="outline" onclick="modal('${esc(kind)}')">${ICON.plus} Adicionar</button>
      </div>
      ${list.length ? list.map(record).join("") : `
        <div class="empty-state">
          <b>Ainda não há registros aqui</b>
          <p>Comece adicionando o primeiro item.</p>
          <button class="primary" onclick="modal('${esc(kind)}')">Adicionar agora</button>
        </div>`}
    </article>
  </div>`;
}

function reports() {
  const f = finances();
  const tasks = state.items.filter(x => x.kind === "Meu dia");
  const doneTasks = tasks.filter(isDone).length;
  const productivity = pct(doneTasks, tasks.length);
  const goals = state.items.filter(x => x.kind === "Metas");
  const avgGoal = goals.length ? Math.round(goals.reduce((a, x) => a + (Number(x.progress) || 0), 0) / goals.length) : 0;
  const healthy = f.savingRate >= 25;

  return `
  <div class="page">
    <div class="module-intro">
      <div>
        <p>INTELIGÊNCIA PESSOAL</p>
        <h1>Relatórios</h1>
        <h2>Entenda seus padrões e avance com clareza.</h2>
      </div>
      <button class="primary" onclick="exportData()">${ICON.download} Baixar relatório</button>
    </div>

    <section class="report-cards">
      ${stat("spark", "Taxa de economia", `${f.savingRate}%`, "Meta sugerida: 25%")}
      ${stat("layers", "Registros ativos", String(state.items.length), "Em toda a sua vida")}
      ${stat("check", "Produtividade", `${productivity}%`, `${doneTasks} de ${tasks.length} tarefas concluídas`)}
      ${stat("target", "Progresso das metas", `${avgGoal}%`, `${goals.length} meta${goals.length === 1 ? "" : "s"} em acompanhamento`)}
    </section>

    <article class="card insights">
      <div>
        <span>INSIGHT DA SEMANA</span>
        <h3>${healthy ? "Você está cuidando bem do seu dinheiro." : "Dá para apertar um pouco as despesas."}</h3>
        <p>${healthy
      ? `Você guardou ${f.savingRate}% da sua receita neste mês e suas metas avançaram para ${avgGoal}% em média.`
      : `Suas despesas consumiram ${f.budgetUsed}% da receita do mês. Cortar 10% já colocaria você na faixa saudável de 25% de economia.`}</p>
        <button class="link-back" onclick="exportData()">Exportar meus dados ${ICON.right}</button>
      </div>
      <div class="insight-orb">${ICON.chart}</div>
    </article>
  </div>`;
}

function search() {
  const q = state.query.toLowerCase();
  const list = state.items.filter(x =>
    String(x.title || "").toLowerCase().includes(q) || String(x.category || "").toLowerCase().includes(q));
  return `
  <div class="page search-page">
    <p>BUSCA GLOBAL</p>
    <h1>Resultados para “${esc(state.query)}”</h1>
    <button class="link-back" onclick="clearQuery()">Limpar busca</button>
    <article class="card">${list.length ? list.map(x => `
      <button class="search-result" onclick="active('${esc(x.kind)}')">
        <i>${ICON[KIND_ICON[x.kind]] || ICON.layers}</i>
        <span><b>${esc(x.title)}</b><small>${esc(x.kind)} · ${esc(x.category)}</small></span>
        <em>Ver ${ICON.right}</em>
      </button>`).join("") : `
      <div class="empty-state">
        <b>Nenhum resultado encontrado</b>
        <p>Tente outra palavra-chave.</p>
      </div>`}
    </article>
  </div>`;
}

/* -------------------------------------------------------------------- render */

function render() {
  const content = state.query ? search()
    : state.active === "Visão geral" ? overview()
      : state.active === "Relatórios" ? reports()
        : modulePage(state.active);
  $("#app").innerHTML = shell(content);
  if (state.query) {
    const f = $(".finder input");
    if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length) }
  }
}

/* ------------------------------------------------------------------- atalhos */

function focusFinder() {
  const f = $(".finder input");
  if (f) f.focus();
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    const open = document.querySelector(".modal-backdrop");
    if (open) return open.remove();
    if (state.notice) { state.notice = false; render() }
    return;
  }
  if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); return focusFinder() }
  const el = document.activeElement;
  if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
  if (document.querySelector(".modal-backdrop")) return;
  if (e.key === "/") { e.preventDefault(); return focusFinder() }
  if ((e.key === "n" || e.key === "N") && LABELS[state.active]) modal(state.active);
});

Object.assign(window, {
  active, setTab, toggle, remove, removeConfirmed, modal, closeModal, createRecord,
  profile, saveProfile, exportData, toggleMenu, toggleNotice, onSearch, clearQuery,
  toast, state, render,
});

render();
