// Compass Staff Directory Filter - content.js
// Hides staff cards whose name contains any of the configured filter phrases

const DEFAULT_FILTERS = [
  "(DOE Integration)",
  "(Program Kaartdijin)",
  "Kaartdijin",
  "(STIMS)"
];

let activeFilters = [...DEFAULT_FILTERS];
let observer = null;

// Load filters from storage, then start
chrome.storage.sync.get({ filters: DEFAULT_FILTERS }, (data) => {
  activeFilters = data.filters;
  applyFilters();
  startObserver();
});

// Listen for filter updates from the popup
chrome.storage.onChanged.addListener((changes) => {
  if (changes.filters) {
    activeFilters = changes.filters.newValue;
    applyFilters();
  }
});

/**
 * Check whether a staff card's name matches any active filter.
 * Matching is case-insensitive.
 */
function shouldHideCard(cardEl) {
  // The staff name is inside an anchor that links to Records/User.aspx
  const nameLink = cardEl.querySelector('a[href*="User.aspx"]');
  if (!nameLink) return false;

  const name = nameLink.textContent.trim();
  return activeFilters.some(
    (phrase) => name.toLowerCase().includes(phrase.toLowerCase())
  );
}

/**
 * Hide or show a single card element.
 * We mark hidden cards with a data attribute so we can easily toggle them.
 */
function processCard(cardEl) {
  if (shouldHideCard(cardEl)) {
    cardEl.style.display = "none";
    cardEl.dataset.compassFiltered = "true";
  } else if (cardEl.dataset.compassFiltered) {
    // Previously hidden — re-show in case filters changed
    cardEl.style.display = "";
    delete cardEl.dataset.compassFiltered;
  }
}

/**
 * Scan all current staff cards on the page and apply filtering.
 * Staff cards are MuiGrid items that contain a User.aspx link.
 */
function applyFilters() {
  // Each staff card is a MuiGrid-item div.
  // We identify them by the presence of a Records/User.aspx link inside.
  const cards = document.querySelectorAll(
    'div.MuiGrid-item a[href*="User.aspx"]'
  );

  cards.forEach((link) => {
    // Walk up to the top-level MuiGrid-item card container
    const card = link.closest("div.MuiGrid-item");
    if (card) processCard(card);
  });
}

/**
 * Watch the DOM for new cards being injected by the React app
 * (pagination, search, sort all re-render the list dynamically).
 */
function startObserver() {
  if (observer) observer.disconnect();

  observer = new MutationObserver((mutations) => {
    let shouldScan = false;

    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        // Check if any added node is or contains a staff card
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (
              node.querySelector?.('a[href*="User.aspx"]') ||
              node.matches?.("div.MuiGrid-item")
            ) {
              shouldScan = true;
              break;
            }
          }
        }
      }
      if (shouldScan) break;
    }

    if (shouldScan) applyFilters();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
