const contactModalMarkup = `
  <div class="contact-modal" id="contact-modal" aria-hidden="true">
    <div class="contact-modal-panel contact-modal-panel-site">
      <button class="modal-close modal-close-site" type="button" id="contact-modal-close" aria-label="Закрыть форму">×</button>

      <div class="contact-modal-intro">
        <p class="eyebrow contact-modal-eyebrow">Связь с нами</p>
        <h2 class="contact-modal-title">Хотите узнать цену?<br>Напишите нам</h2>
        <p class="contact-modal-text">Оставьте контакты и короткое описание задачи. Мы свяжемся с вами и подготовим предложение под объект в Польше.</p>
      </div>

      <form class="contact-form contact-form-site" id="contact-form">
        <div class="form-field form-field-site">
          <label for="contact-name">Имя: *</label>
          <input id="contact-name" name="name" type="text" placeholder="например: Иван Иванович" required>
        </div>

        <div class="form-field form-field-site">
          <label for="contact-email">e-mail адрес: *</label>
          <input id="contact-email" name="email" type="email" placeholder="например: ivanov@gmail.com" required>
        </div>

        <div class="form-field form-field-site">
          <label for="contact-phone">Телефон: *</label>
          <input id="contact-phone" name="phone" type="tel" placeholder="+48 500 000 000" required>
        </div>

        <div class="form-field form-field-site">
          <label for="contact-message">Коротко о задаче:</label>
          <textarea id="contact-message" name="message" rows="5" placeholder="Опишите помещение, объём работ и желаемые сроки" required></textarea>
        </div>

        <input type="text" name="company" tabindex="-1" autocomplete="off" style="display:none">

        <button class="contact-submit contact-submit-site" type="submit">Отправить заявку</button>
        <p class="contact-form-caption" id="contact-modal-status" aria-live="polite">Отправка без перезагрузки страницы.</p>
      </form>
    </div>
  </div>
`;

document.body.insertAdjacentHTML("beforeend", contactModalMarkup);

const contactModal = document.getElementById("contact-modal");
const contactForm = document.getElementById("contact-form");
const closeModalButton = document.getElementById("contact-modal-close");
const modalStatus = document.getElementById("contact-modal-status");
const modalSubmitButton = contactForm.querySelector('button[type="submit"]');

function setModalStatus(text, type = "info") {
  modalStatus.textContent = text;
  modalStatus.dataset.state = type;
}

function openContactModal() {
  contactModal.classList.add("is-open");
  contactModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeContactModal() {
  contactModal.classList.remove("is-open");
  contactModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function sendTG() {
  openContactModal();
}

closeModalButton.addEventListener("click", closeContactModal);

contactModal.addEventListener("click", (event) => {
  if (event.target === contactModal) closeContactModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && contactModal.classList.contains("is-open")) closeContactModal();
});

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const payload = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    message: String(formData.get("message") || "").trim(),
    company: String(formData.get("company") || "").trim()
  };

  if (!payload.name || !payload.email || !payload.phone || !payload.message) {
    setModalStatus("Заполните все поля формы.", "error");
    return;
  }

  try {
    if (modalSubmitButton) modalSubmitButton.disabled = true;
    setModalStatus("Отправка...", "loading");

    const response = await fetch("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Ошибка отправки.");
    }

    setModalStatus("Сообщение успешно отправлено.", "success");
    contactForm.reset();

    setTimeout(() => {
      closeContactModal();
      setModalStatus("Отправка без перезагрузки страницы.", "info");
    }, 1200);
  } catch (error) {
    setModalStatus(error.message || "Ошибка отправки. Попробуйте позже.", "error");
  } finally {
    if (modalSubmitButton) modalSubmitButton.disabled = false;
  }
});
