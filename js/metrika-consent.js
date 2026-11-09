"use strict";

(() => {
  const COUNTER_ID = 114153116;
  const STORAGE_KEY = "nte-metrika-consent";
  const TAG_SRC = "https://mc.yandex.ru/metrika/tag.js?id=" + COUNTER_ID;
  const ACCEPTED = "accepted";
  const DECLINED = "declined";

  const readChoice = () => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "";
    } catch (error) {
      return "";
    }
  };

  const writeChoice = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      /* private mode: consent still applies for this visit */
    }
  };

  const isYandexMetrikaUrl = (url) => /mc\.yandex\.(ru|com)/.test(String(url || ""));

  const muteMetrikaNetwork = () => {
    if (window.__nteMetrikaMuted) return;
    window.__nteMetrikaMuted = true;
    const open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      this.__nteBlockYm = isYandexMetrikaUrl(url);
      if (this.__nteBlockYm) return;
      return open.apply(this, arguments);
    };
    const send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function () {
      if (this.__nteBlockYm) return;
      return send.apply(this, arguments);
    };
    if (navigator.sendBeacon) {
      const beacon = navigator.sendBeacon.bind(navigator);
      navigator.sendBeacon = function (url, data) {
        if (isYandexMetrikaUrl(url)) return true;
        return beacon(url, data);
      };
    }
    if (window.fetch) {
      const origFetch = window.fetch.bind(window);
      window.fetch = function (input, init) {
        const url = typeof input === "string" ? input : (input && input.url) || "";
        if (isYandexMetrikaUrl(url)) {
          return Promise.resolve(new Response("", { status: 204 }));
        }
        return origFetch(input, init);
      };
    }
    const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
    if (desc && desc.set && !window.__nteMetrikaImageMuted) {
      window.__nteMetrikaImageMuted = true;
      Object.defineProperty(HTMLImageElement.prototype, "src", {
        configurable: true,
        enumerable: desc.enumerable,
        get: desc.get,
        set: function (value) {
          if (isYandexMetrikaUrl(value)) return;
          desc.set.call(this, value);
        }
      });
    }
  };

  const startMetrika = () => {
    if (window.__nteMetrikaStopped || readChoice() === DECLINED) return;
    if (window.__nteMetrikaStarted) return;
    const already = [...document.scripts].some((script) => script.src === TAG_SRC);
    if (already) {
      window.__nteMetrikaStarted = true;
      return;
    }
    window.__nteMetrikaStarted = true;

    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (let j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) return;
      }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, "script", TAG_SRC, "ym");

    window.ym(COUNTER_ID, "init", {
      ssr: true,
      webvisor: true,
      clickmap: true,
      ecommerce: "dataLayer",
      referrer: document.referrer,
      url: location.href,
      accurateTrackBounce: true,
      trackLinks: true
    });
  };

  const stopMetrika = () => {
    window.__nteMetrikaStopped = true;
    window.__nteMetrikaStarted = false;
    window.ym = function () {};
    window.ym.a = [];
    muteMetrikaNetwork();
    [...document.querySelectorAll("script")].forEach((script) => {
      if ((script.src || "").indexOf("mc.yandex.ru") !== -1) script.remove();
    });
    clearMetrikaCookies();
  };

  const clearMetrikaCookies = () => {
    const host = location.hostname.replace(/^www\./, "");
    const domains = ["", location.hostname, "." + host];
    document.cookie.split(";").forEach((part) => {
      const name = part.split("=")[0].trim();
      if (!name || (name.indexOf("_ym") !== 0 && name.indexOf("ym_") !== 0 && name !== "mdd")) return;
      domains.forEach((domain) => {
        document.cookie = name + "=; Max-Age=0; path=/" + (domain ? "; domain=" + domain : "");
      });
    });
  };

  const hideBar = () => {
    const bar = document.getElementById("analyticsConsent");
    if (bar) bar.remove();
    document.body.classList.remove("has-analytics-consent");
  };

  const showBar = () => {
    if (document.getElementById("analyticsConsent")) return;
    document.body.classList.add("has-analytics-consent");
    const bar = document.createElement("div");
    bar.id = "analyticsConsent";
    bar.className = "analytics-consent";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-labelledby", "analyticsConsentTitle");
    bar.setAttribute("aria-describedby", "analyticsConsentText");
    bar.innerHTML =
      '<div class="analytics-consent-copy">' +
        '<p class="analytics-consent-kicker" id="analyticsConsentTitle">Аналитика сайта</p>' +
        '<p id="analyticsConsentText">Яндекс Метрика считает посещения с помощью необязательных cookie. Имя, телефон и тексты заявок в запись не попадают. Для заявки и практик это не нужно.</p>' +
      "</div>" +
      '<div class="analytics-consent-actions">' +
        '<a class="analytics-consent-more" href="/#privacy">Подробнее</a>' +
        '<button type="button" class="analytics-consent-btn" data-choice="declined">Отклонить</button>' +
        '<button type="button" class="analytics-consent-btn is-accept" data-choice="accepted">Принять</button>' +
      "</div>";
    document.body.appendChild(bar);
    bar.querySelectorAll("[data-choice]").forEach((button) => {
      button.addEventListener("click", () => applyChoice(button.getAttribute("data-choice")));
    });
  };

  const applyChoice = (choice) => {
    if (choice !== ACCEPTED && choice !== DECLINED) return;
    writeChoice(choice);
    hideBar();
    if (choice === ACCEPTED) {
      window.__nteMetrikaStopped = false;
      startMetrika();
      return;
    }
    clearMetrikaCookies();
    if (window.__nteMetrikaStarted) {
      stopMetrika();
      location.reload();
    }
  };

  const boot = () => {
    const choice = readChoice();
    if (choice === ACCEPTED) startMetrika();
    else if (choice !== DECLINED) showBar();

    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-analytics-consent]");
      if (!trigger) return;
      event.preventDefault();
      showBar();
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
