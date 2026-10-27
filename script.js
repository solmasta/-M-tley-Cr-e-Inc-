// EDIT THIS: all of the site's content lives here. These are placeholders.
const GUILD = {
  stats: [
    { value: "2020", label: "Founded" },
    { value: "50+", label: "Members over the years" },
    { value: "1000s", label: "Late nights" },
    { value: "1", label: "Family" },
  ],
  timeline: [
    { date: "The Beginning", title: "The first recruit", text: "A tiny group, a guild tag, and big plans." },
    { date: "The Grind", title: "Finding our groove", text: "Raids, runs and a roster that kept growing." },
    { date: "The Glory", title: "Our biggest night", text: "The one everyone still talks about." },
    { date: "Today", title: "Still here", text: "The tag may fade, the friendships don't." },
  ],
  crew: [
    { name: "Guild Master", role: "Founder", text: "Started it all. Held it together." },
    { name: "Officer One", role: "Officer", text: "Kept the raids on time (mostly)." },
    { name: "Officer Two", role: "Officer", text: "Voice of reason and keeper of the loot rules." },
    { name: "The Tank", role: "Member", text: "Never let anyone fall." },
    { name: "The Healer", role: "Member", text: "Always one heal short, always one heal enough." },
    { name: "The Wildcard", role: "Member", text: "Chaos incarnate. We loved it." },
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
