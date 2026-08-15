
const STORAGE_KEY = "nova-blog-posts-v1";
const THEME_KEY = "nova-blog-theme-v1";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const els = {
  grid: $("#postGrid"),
  empty: $("#emptyState"),
  count: $("#postCount"),
  heroCount: $("#heroCount"),
  search: $("#searchInput"),
  filter: $("#categoryFilter"),
  editor: $("#editorModal"),
  reader: $("#readModal"),
  form: $("#postForm"),
  category: $("#postCategory"),
  title: $("#postTitle"),
  content: $("#postContent"),
  charCount: $("#charCount"),
  readCategory: $("#readCategory"),
  readTitle: $("#readTitle"),
  readDate: $("#readDate"),
  readContent: $("#readContent"),
  deleteBtn: $("#deleteBtn"),
  themeBtn: $("#themeBtn"),
  topbar: $("#topbar")
};

let posts = loadPosts();
let editingId = null;
let readingId = null;

const starterPosts = [
  {
    id: crypto.randomUUID(),
    category: "WEB",
    title: "나만의 블로그를 시작했다",
    content: "서버 없이도 바로 글을 쓰고 저장할 수 있는 개인 블로그를 만들어봤다.\n\n이 글은 예시 데이터다. 삭제하고 내 글을 써도 된다!",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: crypto.randomUUID(),
    category: "DEV",
    title: "작은 프로젝트를 끝까지 만드는 법",
    content: "기능을 왕창 넣기보다 작게 시작하고 실제로 동작하는 상태까지 만드는 게 훨씬 재밌다.\n\n오늘의 목표도 딱 하나만 잡아보자.",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

if (!localStorage.getItem(STORAGE_KEY)) {
  posts = starterPosts;
  savePosts();
}

function loadPosts() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[c]));
}

function formatDate(iso) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric", month: "long", day: "numeric"
  }).format(new Date(iso));
}

function refreshCategories() {
  const current = els.filter.value;
  const categories = [...new Set(posts.map(p => p.category).filter(Boolean))].sort();
  els.filter.innerHTML = `<option value="all">전체</option>` +
    categories.map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join("");
  els.filter.value = categories.includes(current) ? current : "all";
}

function getFilteredPosts() {
  const q = els.search.value.trim().toLowerCase();
  const category = els.filter.value;
  return posts
    .filter(p => category === "all" || p.category === category)
    .filter(p => !q || `${p.title} ${p.content} ${p.category}`.toLowerCase().includes(q))
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function render() {
  refreshCategories();
  const list = getFilteredPosts();

  els.count.textContent = `${posts.length}개의 글`;
  els.heroCount.textContent = posts.length;

  els.grid.innerHTML = list.map(post => `
    <article class="post" data-id="${post.id}">
      <span class="tag">#${escapeHTML(post.category)}</span>
      <h3>${escapeHTML(post.title)}</h3>
      <p>${escapeHTML(post.content)}</p>
      <span class="date">${formatDate(post.createdAt)}</span>
    </article>
  `).join("");

  els.empty.hidden = list.length !== 0;

  $$(".post").forEach((card, i) => {
    card.addEventListener("click", () => openReader(card.dataset.id));
    setTimeout(() => card.classList.add("show"), i * 45);
  });
}

function openModal(el) {
  el.classList.add("open");
  el.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(el) {
  el.classList.remove("open");
  el.setAttribute("aria-hidden", "true");
  if (![els.editor, els.reader].some(x => x.classList.contains("open"))) {
    document.body.style.overflow = "";
  }
}

function openEditor(id = null) {
  editingId = id;
  const post = posts.find(p => p.id === id);

  $("#editorTitle").textContent = post ? "글 수정" : "새 글 작성";
  els.category.value = post?.category ?? "";
  els.title.value = post?.title ?? "";
  els.content.value = post?.content ?? "";
  updateCharCount();
  openModal(els.editor);
  setTimeout(() => els.category.focus(), 100);
}

function openReader(id) {
  const post = posts.find(p => p.id === id);
  if (!post) return;

  readingId = id;
  els.readCategory.textContent = `#${post.category}`;
  els.readTitle.textContent = post.title;
  els.readDate.textContent = formatDate(post.createdAt);
  els.readContent.textContent = post.content;
  openModal(els.reader);
}

function updateCharCount() {
  els.charCount.textContent = `${els.content.value.length.toLocaleString()} / 10,000`;
}

els.form.addEventListener("submit", e => {
  e.preventDefault();

  const category = els.category.value.trim();
  const title = els.title.value.trim();
  const content = els.content.value.trim();

  if (!category || !title || !content) return;

  if (editingId) {
    const index = posts.findIndex(p => p.id === editingId);
    if (index !== -1) {
      posts[index] = {...posts[index], category, title, content};
    }
  } else {
    posts.push({
      id: crypto.randomUUID(),
      category,
      title,
      content,
      createdAt: new Date().toISOString()
    });
  }

  savePosts();
  closeModal(els.editor);
  render();
});

els.content.addEventListener("input", updateCharCount);
els.search.addEventListener("input", render);
els.filter.addEventListener("change", render);

$("#writeBtn").addEventListener("click", () => openEditor());
$("#heroWrite").addEventListener("click", () => openEditor());
$("#emptyWrite").addEventListener("click", () => openEditor());

els.deleteBtn.addEventListener("click", () => {
  const post = posts.find(p => p.id === readingId);
  if (!post) return;

  if (!confirm(`"${post.title}" 글을 삭제할까요?`)) return;

  posts = posts.filter(p => p.id !== readingId);
  savePosts();
  closeModal(els.reader);
  render();
});

$$("[data-close]").forEach(btn => {
  btn.addEventListener("click", () => {
    const modal = document.getElementById(btn.dataset.close);
    closeModal(modal);
  });
});

$$(".modal-backdrop").forEach(backdrop => {
  backdrop.addEventListener("click", e => {
    if (e.target === backdrop) closeModal(backdrop);
  });
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    [els.editor, els.reader].forEach(m => {
      if (m.classList.contains("open")) closeModal(m);
    });
  }
});

function applyTheme(theme) {
  document.documentElement.classList.toggle("light", theme === "light");
  els.themeBtn.textContent = theme === "light" ? "🌙" : "☀️";
  localStorage.setItem(THEME_KEY, theme);
}

els.themeBtn.addEventListener("click", () => {
  applyTheme(document.documentElement.classList.contains("light") ? "dark" : "light");
});

const savedTheme = localStorage.getItem(THEME_KEY);
applyTheme(savedTheme || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));

window.addEventListener("scroll", () => {
  els.topbar.classList.toggle("scrolled", scrollY > 20);
}, {passive:true});

$("#year").textContent = new Date().getFullYear();
render();
