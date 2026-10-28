// EDIT THIS: the site's content lives here.
const GUILD = {
  stats: [
    { value: "4+", label: "Years together" },
    { value: "248", label: "Discord members" },
    { value: "Aug 2026", label: "First full clear" },
  ],
  timeline: [
    { date: "June 10, 2022", title: "The server is created", text: "Mötley Crüe Inc. gets its Discord server." },
    { date: "June 30, 2022", title: "The record begins", text: "The first report goes up in #logs-for-dayz." },
    { date: "July 2022", title: "More raiders post their nights", text: "Other raiders start adding their own reports to #logs-for-dayz." },
    { date: "June 9, 2024", title: "Who has what", text: "Guildies list their professions in #guild-bank-item-requests so recipes can be shared." },
    { date: "September 5, 2024", title: "Tips and guides", text: "Leyenelf posts the first guide in #tips-tricks-and-guides, a warlock macro write-up." },
    { date: "August 4, 2026", title: "Siege of Orgrimmar cleared", text: "Leyenelf posted it: \"GARY DOWN! FIRST FULL CLEAR BABY!\"" },
    { date: "Encore", title: "The Final Tour", text: "Thank you for every night." },
  ],
  // From the lyrics of "Brothers of Azeroth". Add roles and real stories.
  crew: [
    { name: "Solmotley", role: "Leader", text: "Solmotley leads, we'll never fall." },
    { name: "Kuddless Bubba", role: "Always by our side", text: "Stands with the guild, every night." },
    { name: "Bean", role: "Open hearts", text: "Bean and Doc, hearts open wide." },
    { name: "Doc", role: "Open hearts", text: "Bean and Doc, hearts open wide." },
    { name: "Ley (Leyenelf)", role: "Charging in", text: "Ley and Kizzy, charging in. Posted the first guide in the tips channel and the Siege of Orgrimmar clear." },
    { name: "Kizzy", role: "Charging in", text: "Ley and Kizzy, charging in. A maxed potion master with max cooking, plus leatherworking, enchanting and inscription alts." },
    { name: "Grim", role: "Day and night", text: "Grim and Code fight day and night." },
    { name: "Code", role: "Day and night", text: "Grim and Code fight day and night." },
    { name: "Chislev", role: "Wisdom", text: "Chislev's wisdom lights our path." },
  ],
};

const $ = id => document.getElementById(id);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};

GUILD.stats.forEach(s => {
  const d = el("div", "stat");
  d.append(el("b", "", s.value), el("span", "", s.label));
  $("stats").append(d);
});

GUILD.timeline.forEach(t => {
  const li = el("li");
  li.append(el("time", "", t.date), el("h3", "", t.title), el("p", "", t.text));
  $("timeline-list").append(li);
});

GUILD.crew.forEach(m => {
  const c = el("article", "card");
  c.append(el("div", "role", m.role), el("h3", "", m.name), el("p", "", m.text));
  $("crew-list").append(c);
});

// ---- Farewell wall ----
// Shared across viewers when the host page provides the `db` capability and the
// viewer may write. Otherwise it falls back to this browser's localStorage.
const KEY = "guild-wall";
const LOCAL_NOTE = "Leave a line for the guild. It is saved in this browser only.";
const form = $("wall-form");
const note = $("wall-note");
const list = $("wall-list");
let shared = null; // a db collection when the shared wall is in use

function renderWall(posts) {
  list.replaceChildren();
  if (!posts.length) {
    list.append(el("li", "empty", "No messages yet. Be the first to say goodbye."));
    return;
  }
  posts.forEach(p => {
    const li = el("li");
    li.append(el("b", "", p.name + ": "), document.createTextNode(p.msg));
    list.append(li);
  });
}

const local = {
  load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } },
  save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} },
};

function useLocalWall() {
  shared = null;
  form.hidden = false;
  note.textContent = LOCAL_NOTE;
  renderWall(local.load().slice().reverse());
}

async function initWall() {
  useLocalWall();
  try {
    const db = await window.claude?.use?.("db");
    if (!db) return;
    const user = await window.claude.use("user");
    const canWrite = user ? await user.can("data.write") : null;
    const col = db.collection("wall");
    shared = col;
    note.textContent = "Leave a line for the guild: a memory, a shout-out, a thank you. Everyone here can read it.";
    if (canWrite === false) {
      form.hidden = true;
      note.textContent = "Messages for the guild appear here. Ask Sol for contributor access to add yours.";
    }
    col.orderBy("at", "desc").limit(300).onSnapshot(
      snap => renderWall(snap.docs.map(d => d.data())),
      useLocalWall
    );
  } catch {
    useLocalWall();
  }
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const name = $("wall-name").value.trim();
  const msg = $("wall-msg").value.trim();
  if (!name || !msg) return;
  if (shared) {
    try {
      await shared.add({ name, msg, at: Date.now() });
      form.reset();
    } catch {
      form.hidden = true;
      note.textContent = "Messages can't be added from this view. Ask Sol for contributor access.";
    }
    return;
  }
  const posts = local.load();
  posts.push({ name, msg });
  local.save(posts);
  renderWall(posts.slice().reverse());
  form.reset();
});

initWall();

// ---- Live Discord stats (works on a normal website; hosts that block it fall back silently) ----
(async () => {
  try {
    const r = await fetch("https://discord.com/api/v9/invites/9A5HTbq2h?with_counts=true");
    if (!r.ok) return;
    const d = await r.json();
    const g = d.guild;
    if (!g) return;
    $("c-name").textContent = g.name;
    if (g.icon) {
      $("c-icon").src = `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`;
      $("c-icon").hidden = false;
    }
    const counts = $("c-counts");
    counts.replaceChildren();
    counts.append(el("span", "dot"), `${d.approximate_presence_count} online · ${d.approximate_member_count} members`);
  } catch {}
})();
