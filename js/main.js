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
