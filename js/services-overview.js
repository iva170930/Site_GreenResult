const servicesGrid = document.getElementById("services-grid");

if (servicesGrid) {
  servicesGrid.innerHTML = Object.values(servicesCatalog).map((service) => `
    <a class="feature-card reveal" href="${service.url}">
      <span class="feature-badge">${service.badge}</span>
      <h3>${service.title}</h3>
      <p>${service.short}</p>
      <ul class="service-mini-list">
        ${service.subservices.slice(0, 3).map((item) => `<li>${item}</li>`).join("")}
      </ul>
      <span class="service-link">Подробнее</span>
    </a>
  `).join("");

  if (window.observeReveals) {
    window.observeReveals(servicesGrid);
  }
}
