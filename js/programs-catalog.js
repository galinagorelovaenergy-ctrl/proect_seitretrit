"use strict";

(() => {
  const tabs = [...document.querySelectorAll("[data-programs-tab]")];
  const cards = [...document.querySelectorAll(".program-card")];
  const empty = document.getElementById("programsEmpty");
  if (!tabs.length || !cards.length) return;

  const valid = new Set(tabs.map((tab) => tab.dataset.programsTab));

  const showTab = (id) => {
    const current = valid.has(id) ? id : "adygea";
    tabs.forEach((tab) => {
      const on = tab.dataset.programsTab === current;
      tab.classList.toggle("is-on", on);
      tab.setAttribute("aria-selected", String(on));
    });
    let visible = 0;
    cards.forEach((card) => {
      const archived = card.dataset.archived === "true";
      const match = current === "archive" ? archived : !archived && card.dataset.city === current;
      card.hidden = !match;
      card.classList.toggle("is-hidden", !match);
      if (match) visible += 1;
    });
    if (empty) {
      empty.hidden = visible > 0;
      empty.textContent = current === "archive"
        ? "Пока нет программ в архиве. Завершённые мероприятия остаются во вкладке города, пока их не переведут в архив."
        : "В этом городе пока нет объявленных программ.";
    }
    if (location.hash.slice(1) !== current) {
      history.replaceState(null, "", "#" + current);
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => showTab(tab.dataset.programsTab));
  });

  window.addEventListener("hashchange", () => showTab(location.hash.slice(1)));
  showTab(location.hash.slice(1) || "adygea");
})();
