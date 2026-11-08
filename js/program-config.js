"use strict";

/**
 * Режимы страницы Адыгеи.
 *
 * adygeaMode: "open" — идёт набор на подтверждённый заезд.
 * adygeaMode: "wait" — заезд не предлагаем, собираем запросы на следующие даты.
 *
 * Переключать только вручную. Не менять по календарю.
 * По умолчанию "open", пока владелец отдельно не подтвердит отмену или завершение.
 *
 * После смены значения обновите вкладки главной, каталога и programs/adygea.html.
 */
window.NTE_CONFIG = {
  adygeaMode: "open"
};

window.NTE_ADYGEA = {
  open: {
    title: "Ретрит в Адыгее 17–22 ноября — Новая точка энергии",
    description: "Ретрит Нового Состояния под Майкопом, 17–22 ноября: практики, проживание и питание. 50 000 ₽. Запись на выездную программу.",
    ogTitle: "Ретрит в Адыгее 17–22 ноября — Новая точка энергии",
    ogDescription: "Ретрит Нового Состояния под Майкопом: практики, проживание и питание. 50 000 ₽.",
    h1: "Ретрит Нового Состояния в Адыгее",
    statusLabel: "набор открыт",
    catalogLead: "17–22 ноября 2026",
    catalogPrice: "50 000 ₽",
    homeText: "Ретрит Нового Состояния, 17–22 ноября 2026, под Майкопом. Набор открыт.",
    homeCta: "Подробнее о программе",
    application: "Ретрит Нового Состояния в Адыгее, 17–22 ноября 2026"
  },
  wait: {
    title: "Ретриты в Адыгее — Новая точка энергии",
    description: "Авторские ретриты в Адыгее для восстановления внутреннего ресурса. Следующие даты уточняются. Оставьте запрос — сообщим, когда откроется набор.",
    ogTitle: "Ретриты в Адыгее — Новая точка энергии",
    ogDescription: "Направление Адыгея: лес, тишина и пространство для внутреннего обновления. Следующие даты уточняются.",
    h1: "Ретриты в Адыгее",
    statusLabel: "следующие даты уточняются",
    catalogLead: "следующие даты уточняются",
    catalogPrice: "стоимость уточняется",
    homeText: "Направление Адыгея. Следующие даты уточняются. Можно оставить запрос.",
    homeCta: "Узнать о следующих датах",
    application: "Запрос на следующие даты ретрита в Адыгее"
  }
};

window.nteAdygeaMode = function nteAdygeaMode() {
  return window.NTE_CONFIG && window.NTE_CONFIG.adygeaMode === "wait" ? "wait" : "open";
};

window.nteAdygeaMeta = function nteAdygeaMeta() {
  return window.NTE_ADYGEA[window.nteAdygeaMode()];
};

window.nteApplyAdygeaMode = function nteApplyAdygeaMode() {
  const mode = window.nteAdygeaMode();
  const meta = window.nteAdygeaMeta();
  document.documentElement.setAttribute("data-adygea-mode", mode);

  document.querySelectorAll("[data-show-when]").forEach((el) => {
    el.hidden = el.getAttribute("data-show-when") !== mode;
  });

  document.querySelectorAll("[data-adygea-status]").forEach((el) => {
    el.textContent = meta.statusLabel;
    el.classList.toggle("is-open", mode === "open");
    el.classList.toggle("is-soon", mode === "wait");
    el.classList.remove("is-closed");
  });

  document.querySelectorAll("[data-adygea-dates]").forEach((el) => {
    el.textContent = meta.catalogLead;
  });

  document.querySelectorAll("[data-adygea-price]").forEach((el) => {
    el.textContent = meta.catalogPrice;
  });

  document.querySelectorAll("[data-adygea-home-text]").forEach((el) => {
    el.textContent = meta.homeText;
  });

  document.querySelectorAll("[data-adygea-cta]").forEach((el) => {
    el.textContent = meta.homeCta;
  });

  document.querySelectorAll("input[name='program'][data-adygea-program]").forEach((el) => {
    el.value = meta.application;
  });

  const h1 = document.getElementById("adygeaH1");
  if (h1) h1.textContent = meta.h1;

  if (document.body && document.body.classList.contains("page-program-adygea")) {
    document.title = meta.title;
    const assign = (selector, value) => {
      const node = document.querySelector(selector);
      if (node) node.setAttribute("content", value);
    };
    assign('meta[name="description"]', meta.description);
    assign('meta[property="og:title"]', meta.ogTitle);
    assign('meta[property="og:description"]', meta.ogDescription);
    assign('meta[name="twitter:title"]', meta.ogTitle);
    assign('meta[name="twitter:description"]', meta.ogDescription);

    const eventLd = document.getElementById("adygeaEventJson");
    if (eventLd) {
      if (mode === "open") {
        eventLd.type = "application/ld+json";
      } else {
        eventLd.remove();
      }
    }
  }
};

document.documentElement.setAttribute(
  "data-adygea-mode",
  window.NTE_CONFIG && window.NTE_CONFIG.adygeaMode === "wait" ? "wait" : "open"
);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.nteApplyAdygeaMode);
} else {
  window.nteApplyAdygeaMode();
}
