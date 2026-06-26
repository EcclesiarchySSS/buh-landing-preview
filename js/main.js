// Отправка формы заявки на бэкенд: POST /api/lead → подтверждение пользователю.
const form = document.getElementById("lead-form");
const status = form.querySelector(".form-status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!form.consent.checked) {
    status.textContent = "Нужно согласие на обработку персональных данных.";
    return;
  }

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
  }
});
