"use strict";

(() => {
  const tabs = [...document.querySelectorAll("[data-articles-tab]")];
  const cards = [...document.querySelectorAll(".article-card")];
  const empty = document.getElementById("articlesEmpty");
  if (!tabs.length || !cards.length) return;

  const valid = new Set(tabs.map((tab) => tab.dataset.articlesTab));

  const showTab = (id) => {
    const current = valid.has(id) ? id : "all";
    tabs.forEach((tab) => {
      const on = tab.dataset.articlesTab === current;
      tab.classList.toggle("is-on", on);
      tab.setAttribute("aria-selected", String(on));
    });
    let visible = 0;
    cards.forEach((card) => {
      const match = current === "all" || card.dataset.category === current;
      card.hidden = !match;
      card.classList.toggle("is-hidden", !match);
      if (match) visible += 1;
    });
    if (empty) empty.hidden = visible > 0;
    if (location.hash.slice(1) !== current) {
      history.replaceState(null, "", "#" + current);
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => showTab(tab.dataset.articlesTab));
  });

  window.addEventListener("hashchange", () => showTab(location.hash.slice(1)));
  showTab(location.hash.slice(1) || "all");
})();
