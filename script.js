// EDIT THIS: all of the site's content lives here. These are placeholders.
const GUILD = {
  stats: [
    { value: "2020", label: "Founded" },
    { value: "248", label: "Discord members" },
    { value: "1000s", label: "Raid nights" },
    { value: "1", label: "Family" },
  ],
  timeline: [
    { date: "The Beginning", title: "The guild tag goes up", text: "A few friends, a guild charter and a very loud first night." },
    { date: "The Grind", title: "Learning to raid", text: "Dungeons, first pulls and a lot of learning the hard way." },
    { date: "The Glory", title: "The kill everyone remembers", text: "The boss that finally went down. Replace with the real one." },
    { date: "Today", title: "Still here", text: "Tags fade, expansions end, the friendships stay." },
  ],
  // From the lyrics of "Brothers of Azeroth". Add roles and real stories.
  crew: [
    { name: "Solmotley", role: "Leader", text: "Solmotley leads, we'll never fall." },
    { name: "Kuddless Bubba", role: "Always by our side", text: "Stands with the guild, every night." },
    { name: "Bean", role: "Open hearts", text: "Bean and Doc, hearts open wide." },
    { name: "Doc", role: "Open hearts", text: "Bean and Doc, hearts open wide." },
    { name: "Ley", role: "Charging in", text: "Ley and Kizzy, charging in." },
    { name: "Kizzy", role: "Charging in", text: "Ley and Kizzy, charging in." },
    { name: "Grim", role: "Day and night", text: "Grim and Code fight day and night." },
    { name: "Code", role: "Day and night", text: "Grim and Code fight day and night." },
    { name: "Chislev", role: "Wisdom", text: "Chislev's wisdom lights our path." },
  ],
};

const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.textContent = html;
  return n;
};

GUILD.stats.forEach(s => {
  const d = el("div", "stat");
  d.append(el("b", "", s.value), el("span", "", s.label));
  document.getElementById("stats").append(d);
});

GUILD.timeline.forEach(t => {
  const li = el("li");
  li.append(el("time", "", t.date), el("h3", "", t.title), el("p", "", t.text));
  document.getElementById("timeline-list").append(li);
});

GUILD.crew.forEach(m => {
  const c = el("article", "card");
  c.append(el("div", "avatar", m.name[0]), el("h3", "", m.name), el("div", "role", m.role), el("p", "", m.text));
  document.getElementById("crew-list").append(c);
});

// Wall of Fame (stored in this browser only)
const KEY = "guild-wall";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const save = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };
let posts = load();

function renderWall() {
  const ul = document.getElementById("wall-list");
  ul.replaceChildren();
  posts.slice().reverse().forEach(p => {
    const li = el("li");
    li.append(el("b", "", p.name + ": "), document.createTextNode(p.msg));
    ul.append(li);
  });
}

document.getElementById("wall-form").addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("wall-name");
  const msg = document.getElementById("wall-msg");
  posts.push({ name: name.value.trim(), msg: msg.value.trim() });
  save(posts);
  renderWall();
  e.target.reset();
});

renderWall();

// Live Discord stats, fetched in the visitor's browser. Falls back silently.
(async () => {
  try {
    const r = await fetch("https://discord.com/api/v9/invites/9A5HTbq2h?with_counts=true");
    if (!r.ok) return;
    const d = await r.json();
    const g = d.guild;
    if (!g) return;
    document.getElementById("c-name").textContent = g.name;
    if (g.icon) {
      const img = document.getElementById("c-icon");
      img.src = `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`;
      img.hidden = false;
    }
    const counts = document.getElementById("c-counts");
    counts.replaceChildren();
    const dot = document.createElement("span");
    dot.className = "dot";
    counts.append(dot, `${d.approximate_presence_count} online · ${d.approximate_member_count} members`);
  } catch {}
})();
