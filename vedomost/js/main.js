// --- Заявка: проверка полей → POST /api/lead → ответ пользователю ---
// Бэкенд (backend/app.py) пишет заявку в SQLite и шлёт аудитору в Telegram.
// На превью (GitHub Pages) бэкенда нет — сработает ветка «напишите в Telegram».
const form = document.getElementById("lead-form");
const status = form.querySelector(".form-status");
const button = form.querySelector("button[type=submit]");

function setStatus(text, kind) {
  status.className = "form-status mono" + (kind ? " " + kind : "");
  status.textContent = text;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!form.name.value.trim()) {
    setStatus("УКАЖИТЕ ИМЯ", "err");
    form.name.focus();
    return;
  }
  if (form.phone.value.replace(/\D/g, "").length < 10) {
    setStatus("УКАЖИТЕ ТЕЛЕФОН", "err");
    form.phone.focus();
    return;
  }
  if (!form.consent.checked) {
    setStatus("НУЖНО СОГЛАСИЕ НА ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ", "err");
    return;
  }

  button.disabled = true;
  setStatus("ОТПРАВЛЯЕМ…");

  try {
    const res = await fetch("/api/lead", { method: "POST", body: new FormData(form) });
    const data = await res.json();
    if (data.ok) {
      form.reset();
      setStatus("ЗАЯВКА ОТПРАВЛЕНА — НАШ СПЕЦИАЛИСТ СВЯЖЕТСЯ С ВАМИ В БЛИЖАЙШЕЕ ВРЕМЯ", "ok");
    } else if (res.status === 429) {
      setStatus("СЛИШКОМ МНОГО ПОПЫТОК — ПОДОЖДИТЕ МИНУТУ ИЛИ ПОЗВОНИТЕ НАМ", "err");
    } else {
      setStatus("ПРОВЕРЬТЕ ИМЯ И ТЕЛЕФОН И ПОПРОБУЙТЕ ЕЩЁ РАЗ", "err");
    }
  } catch {
    setStatus("НЕ УДАЛОСЬ ОТПРАВИТЬ — ПОЗВОНИТЕ НАМ ИЛИ НАПИШИТЕ В TELEGRAM", "err");
  } finally {
    button.disabled = false;
  }
});

// Один вопрос открыт за раз — лист вопросов остаётся коротким.
const items = document.querySelectorAll(".faq-item");
items.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    items.forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

// --- Cookie-согласие + отложенная загрузка Яндекс.Метрики (152-ФЗ) ---
// Метрику грузим ТОЛЬКО после согласия пользователя. Пока счётчика нет —
// при null загрузка пропускается, ошибок не будет.
// TODO ЗАКАЗЧИК: подставить id счётчика Яндекс.Метрики (ТЗ §5.5).
const YM_COUNTER_ID = null;
const CONSENT_KEY = "cookie-consent";
const banner = document.getElementById("cookie-banner");

function loadMetrika() {
  if (!YM_COUNTER_ID) return;
  (function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
    m[i].l = 1 * new Date();
    k = e.createElement(t); a = e.getElementsByTagName(t)[0];
    k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
  })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
  window.ym(YM_COUNTER_ID, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true });
}

function readConsent() {
  try { return localStorage.getItem(CONSENT_KEY); } catch { return null; }
}

function saveConsent(value) {
  try { localStorage.setItem(CONSENT_KEY, value); } catch { /* приватный режим — спросим снова */ }
  banner.hidden = true;
}

if (banner) {
  const consent = readConsent();
  if (consent === "all") {
    loadMetrika();
  } else if (!consent) {
    banner.hidden = false;
  }
  banner.querySelector("#cookie-accept").addEventListener("click", () => {
    saveConsent("all");
    loadMetrika();
  });
  banner.querySelector("#cookie-decline").addEventListener("click", () => {
    saveConsent("necessary");
  });
}
