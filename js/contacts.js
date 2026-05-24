const formMain = document.getElementById("contacts-form-main");

if (formMain) {
  const nameInput = document.getElementById("c-name");
  const emailInput = document.getElementById("c-email");
  const phoneInput = document.getElementById("c-phone");
  const messageInput = document.getElementById("c-message");
  const toast = document.getElementById("contact-toast");
  const statusNode = document.getElementById("contacts-form-status");
  const submitButton = formMain.querySelector('button[type="submit"]');

  const fields = [
    {
      input: nameInput,
      error: document.getElementById("err-name"),
      validate: (value) => value.trim().length >= 2,
      message: "Введите имя (минимум 2 символа)."
    },
    {
      input: emailInput,
      error: document.getElementById("err-email"),
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: "Введите корректный email."
    },
    {
      input: phoneInput,
      error: document.getElementById("err-phone"),
      validate: (value) => /^\+48\s\d{3}\s\d{3}\s\d{3}$/.test(value),
      message: "Введите телефон в формате +48 500 000 000."
    },
    {
      input: messageInput,
      error: document.getElementById("err-message"),
      validate: (value) => value.trim().length >= 8,
      message: "Добавьте описание задачи (от 8 символов)."
    }
  ];

  function setStatus(text, type = "info") {
    if (!statusNode) return;
    statusNode.textContent = text;
    statusNode.dataset.state = type;
  }

  function setFieldState(field, isValid) {
    const wrapper = field.input.closest(".field-control");
    if (!wrapper) return;

    wrapper.classList.toggle("has-error", !isValid);
    field.error.textContent = isValid ? "" : field.message;
    field.input.setAttribute("aria-invalid", String(!isValid));
  }

  function validateField(field) {
    const isValid = field.validate(field.input.value);
    setFieldState(field, isValid);
    return isValid;
  }

  function formatPolishPhone(rawValue) {
    const digits = rawValue.replace(/\D/g, "");
    let normalized = digits;

    if (normalized.startsWith("48")) {
      normalized = normalized.slice(2);
    }
    if (normalized.length > 9) {
      normalized = normalized.slice(0, 9);
    }

    const parts = [];
    if (normalized.length > 0) parts.push(normalized.slice(0, 3));
    if (normalized.length > 3) parts.push(normalized.slice(3, 6));
    if (normalized.length > 6) parts.push(normalized.slice(6, 9));

    return `+48${parts.length ? ` ${parts.join(" ")}` : ""}`;
  }

  phoneInput.addEventListener("input", () => {
    const start = phoneInput.selectionStart || 0;
    phoneInput.value = formatPolishPhone(phoneInput.value);
    phoneInput.setSelectionRange(Math.min(start + 1, phoneInput.value.length), Math.min(start + 1, phoneInput.value.length));
    validateField(fields[2]);
  });

  fields.forEach((field) => {
    field.input.addEventListener("blur", () => validateField(field));
    field.input.addEventListener("input", () => {
      if (field.input === phoneInput) return;
      validateField(field);
    });
  });

  formMain.addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstInvalid = fields.find((field) => !validateField(field));
    if (firstInvalid) {
      firstInvalid.input.focus();
      setStatus("Проверьте поля формы.", "error");
      return;
    }

    const formData = new FormData(formMain);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      company: String(formData.get("company") || "").trim()
    };

    try {
      if (submitButton) submitButton.disabled = true;
      setStatus("Отправка...", "loading");

      const response = await fetch("/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Ошибка отправки.");
      }

      setStatus("Сообщение успешно отправлено.", "success");
      formMain.reset();

      if (toast) {
        toast.textContent = "Сообщение успешно отправлено.";
        toast.classList.add("is-visible");
        setTimeout(() => {
          toast.classList.remove("is-visible");
        }, 2200);
      }
    } catch (error) {
      setStatus(error.message || "Ошибка отправки. Попробуйте позже.", "error");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}
