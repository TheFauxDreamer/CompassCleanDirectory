// popup.js

const DEFAULT_FILTERS = [
  "(DOE Integration)",
  "(Program Kaartdijin)",
  "Kaartdijin",
  "(STIMS)"
];

let filters = [];

const listEl = document.getElementById("filter-list");
const inputEl = document.getElementById("new-filter");
const addBtn = document.getElementById("add-btn");
const statusEl = document.getElementById("status");

// Load saved filters on open
chrome.storage.sync.get({ filters: DEFAULT_FILTERS }, (data) => {
  filters = data.filters;
  renderList();
});

function save() {
  chrome.storage.sync.set({ filters }, () => {
    statusEl.textContent = "Saved — reload the Compass tab to apply.";
    statusEl.className = "status ok";
    setTimeout(() => {
      statusEl.textContent = "";
      statusEl.className = "status";
    }, 2500);
  });
}

function renderList() {
  listEl.innerHTML = "";

  if (filters.length === 0) {
    listEl.innerHTML =
      '<div style="color:#aaa;font-size:12px;padding:4px 2px;">No filters — all accounts will be shown.</div>';
    return;
  }

  filters.forEach((phrase, idx) => {
    const item = document.createElement("div");
    item.className = "filter-item";

    const text = document.createElement("span");
    text.className = "filter-text";
    text.title = phrase;
    text.textContent = phrase;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.title = "Remove";
    delBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`;
    delBtn.addEventListener("click", () => {
      filters.splice(idx, 1);
      save();
      renderList();
    });

    item.appendChild(text);
    item.appendChild(delBtn);
    listEl.appendChild(item);
  });
}

function addFilter() {
  const val = inputEl.value.trim();
  if (!val) return;

  if (filters.some((f) => f.toLowerCase() === val.toLowerCase())) {
    statusEl.textContent = "That phrase is already in the list.";
    statusEl.className = "status";
    return;
  }

  filters.push(val);
  inputEl.value = "";
  save();
  renderList();
}

addBtn.addEventListener("click", addFilter);

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addFilter();
});
