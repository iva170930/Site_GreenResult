const serviceId = document.body.dataset.serviceId || "bathroom_turnkey";
const service = servicesCatalog[serviceId];

if (!service) {
  throw new Error(`Service "${serviceId}" not found in catalog`);
}

document.title = `${service.title} - GREEN-RESULT`;

const descriptionMeta = document.querySelector('meta[name="description"]');
if (descriptionMeta) {
  descriptionMeta.setAttribute("content", service.description);
}

document.getElementById("service-tag").textContent = service.badge;
document.getElementById("service-title").textContent = service.title;
document.getElementById("service-desc").textContent = service.description;
document.getElementById("service-price").textContent = service.price;

const imageFallbackMap = {
  bathroom_turnkey: ["images/bathroom.jpg", "images/hero.jpg"],
  electric: ["images/kitchen.jpg.jpg", "images/hero.jpg"],
  plumbing: ["images/plumbing.jpg.jpg", "images/hero.jpg"],
  finishing_walls_floors: ["images/hero.jpg", "images/kitchen.jpg.jpg"]
};

function getFallbackFor(serviceKey, index = 0) {
  const list = imageFallbackMap[serviceKey] || ["images/hero.jpg"];
  return list[index % list.length];
}

const mainImage = document.getElementById("service-img");
mainImage.src = service.image;
mainImage.alt = service.title;
mainImage.onerror = () => {
  mainImage.onerror = null;
  mainImage.src = getFallbackFor(service.id, 0);
};

const subservicesRoot = document.getElementById("service-subservices");
const benefitsRoot = document.getElementById("service-benefits");
const stepsRoot = document.getElementById("service-steps");
const relatedRoot = document.getElementById("related-services");
const detailRoot = document.getElementById("service-detail");
const resultRoot = document.getElementById("service-result");

subservicesRoot.innerHTML = service.subservices.map((item) => `<li>${item}</li>`).join("");

benefitsRoot.innerHTML = service.benefits.map((item) => `
  <article class="feature-card reveal">
    <span class="feature-badge">${service.badge}</span>
    <p>${item}</p>
  </article>
`).join("");

stepsRoot.innerHTML = service.steps.map((step) => `<li>${step}</li>`).join("");

relatedRoot.innerHTML = Object.values(servicesCatalog)
  .filter((item) => item.id !== service.id)
  .map((item) => `
    <a class="feature-card reveal" href="${item.url}">
      <span class="feature-badge">${item.badge}</span>
      <h3>${item.title}</h3>
      <p>${item.short}</p>
    </a>
  `).join("");

if (detailRoot) {
  detailRoot.innerHTML = `
    <div class="service-detail-grid">
      ${service.detailBlocks.map((block, blockIndex) => {
        if (block.type === "image") {
          const fallbackSrc = getFallbackFor(service.id, blockIndex + 1);
          return `
            <figure class="service-detail-image-wrap reveal">
              <img
                src="${block.src}"
                alt="${block.alt}"
                loading="lazy"
                onerror="this.onerror=null;this.src='${fallbackSrc}'"
              >
            </figure>
          `;
        }

        return `
          <article class="service-detail-card reveal">
            <h3>${block.heading}</h3>
            <ul>
              ${block.items.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

if (resultRoot) {
  resultRoot.textContent = service.result || "";
}

if (window.observeReveals) {
  window.observeReveals(document);
}
