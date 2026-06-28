// --- Появление секций при скролле: split & stagger ---
// Каждой .reveal внутри группы задаём порядковый индекс для каскадной задержки,
// затем включаем класс .in, когда группа попадает в зону видимости.
document.querySelectorAll(".reveal-group").forEach((group) => {
  group.querySelectorAll(".reveal").forEach((el, i) => el.style.setProperty("--i", i));
});

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        entry.target.querySelectorAll?.(".reveal").forEach((el) => el.classList.add("in"));
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
);

document.querySelectorAll(".reveal-group, .reveal").forEach((el) => observer.observe(el));

// --- Отправка формы заявки: POST /api/lead → подтверждение пользователю ---
const form = document.getElementById("lead-form");
const status = form.querySelector(".form-status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!form.consent.checked) {
    status.textContent = "Нужно согласие на обработку персональных данных.";
    return;
  }

  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  status.textContent = "Отправляем…";

  try {
    const res = await fetch("/api/lead", { method: "POST", body: new FormData(form) });
    const data = await res.json();
    if (data.ok) {
      form.reset();
      status.textContent = "Заявка отправлена! Екатерина свяжется с вами в ближайшее время.";
    } else {
      status.textContent = "Проверьте имя и телефон и попробуйте ещё раз.";
    }
  } catch {
    status.textContent = "Не удалось отправить. Попробуйте позже или напишите в Telegram.";
  } finally {
    button.disabled = false;
  }
});

// --- Cookie-согласие + отложенная загрузка Яндекс.Метрики (152-ФЗ) ---
// Метрику грузим ТОЛЬКО после согласия пользователя. На превью счётчика нет —
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

if (banner) {
  const consent = localStorage.getItem(CONSENT_KEY);
  if (consent === "all") {
    loadMetrika();
  } else if (!consent) {
    banner.hidden = false;
  }
  banner.querySelector("#cookie-accept")?.addEventListener("click", () => {
    localStorage.setItem(CONSENT_KEY, "all");
    banner.hidden = true;
    loadMetrika();
  });
  banner.querySelector("#cookie-decline")?.addEventListener("click", () => {
    localStorage.setItem(CONSENT_KEY, "necessary");
    banner.hidden = true;
  });
}
