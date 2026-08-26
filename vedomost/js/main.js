// Презентационная версия направления «Ведомость».
// Бэкенда здесь нет: форма проверяет поля и показывает, что заявка ушла бы
// аудитору в Telegram, но никуда не отправляет. Веб-аналитики на демо тоже нет,
// поэтому cookie-баннер не нужен — ничего не пишем и не собираем.

const form = document.getElementById("lead-form");
const status = form.querySelector(".form-status");

function setStatus(text, kind) {
  status.className = "form-status mono" + (kind ? " " + kind : "");
  status.textContent = text;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // honeypot: люди это поле не заполняют
  if (form.website.value) return;

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

  setStatus("ЭТО ДЕМОНСТРАЦИЯ — НА БОЕВОМ САЙТЕ ЗАЯВКА УШЛА БЫ АУДИТОРУ В TELEGRAM", "ok");
  form.reset();
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
