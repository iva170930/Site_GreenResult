const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");
const dropdownTriggers = document.querySelectorAll(".nav-trigger");

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const FORCE_TOP_KEY = "forceScrollTopOnNextPage";

if (menu) {
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("http")) {
      return;
    }
    link.addEventListener("click", () => {
      sessionStorage.setItem(FORCE_TOP_KEY, "1");
    });
  });
}

window.addEventListener("pageshow", () => {
  const shouldForceTop = sessionStorage.getItem(FORCE_TOP_KEY) === "1";
  if (shouldForceTop) {
    sessionStorage.removeItem(FORCE_TOP_KEY);
  }

  if (shouldForceTop && !window.location.hash) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }
});

const headerNode = document.querySelector(".header");
if (headerNode) {
  const syncHeaderScrollState = () => {
    headerNode.classList.toggle("scrolled", window.scrollY > 50);
  };
  syncHeaderScrollState();
  window.addEventListener("scroll", syncHeaderScrollState, { passive: true });
}

function setActiveMenuItem() {
  if (!menu) {
    return;
  }

  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = menu.querySelectorAll("a[href]");
  const servicesPages = new Set([
    "service.html",
    "services.html",
    "service-finishing.html",
    "service-electrics.html",
    "service-hydraulics.html",
    "service-floors.html"
  ]);

  let hasActiveServicesLink = false;

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:")) {
      return;
    }

    const linkPath = href.split("/").pop();
    const isActive = linkPath === currentPath;

    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }

    if (link.closest(".dropdown-menu") && isActive) {
      hasActiveServicesLink = true;
    }
  });

  const isServicesRoute = servicesPages.has(currentPath);
  const shouldHighlightServices = hasActiveServicesLink || isServicesRoute;

  dropdownTriggers.forEach((trigger) => {
    trigger.classList.toggle("is-active", shouldHighlightServices);
    if (shouldHighlightServices) {
      trigger.setAttribute("aria-current", "page");
    } else {
      trigger.removeAttribute("aria-current");
    }
  });
}

setActiveMenuItem();

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

dropdownTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const parent = trigger.closest(".nav-item");
    if (!parent) {
      return;
    }

    const isOpen = parent.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", String(isOpen));

    dropdownTriggers.forEach((otherTrigger) => {
      const otherParent = otherTrigger.closest(".nav-item");
      if (otherTrigger !== trigger && otherParent) {
        otherParent.classList.remove("is-open");
        otherTrigger.setAttribute("aria-expanded", "false");
      }
    });
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav-item")) {
    dropdownTriggers.forEach((trigger) => {
      const parent = trigger.closest(".nav-item");
      if (parent) {
        parent.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  }
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

function observeReveals(root = document) {
  root.querySelectorAll(".reveal").forEach((element) => {
    if (!element.classList.contains("is-visible")) {
      revealObserver.observe(element);
    }
  });
}

observeReveals();

window.observeReveals = observeReveals;

const yearSlot = document.getElementById("year");

if (yearSlot) {
  yearSlot.textContent = new Date().getFullYear();
}

// Portfolio lightbox (home page)
const portfolioItems = document.querySelectorAll(".portfolio-item");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

if (portfolioItems.length && lightbox && lightboxImg) {
  const lightboxClose = lightbox.querySelector(".lightbox-close");
  const lightboxPrev = lightbox.querySelector(".lightbox-prev");
  const lightboxNext = lightbox.querySelector(".lightbox-next");
  const lightboxBg = lightbox.querySelector(".lightbox-bg");
  const srcs = Array.from(portfolioItems).map((item) => item.dataset.src || "");
  let currentIndex = 0;

  const openLightbox = (index) => {
    currentIndex = index;
    lightboxImg.src = srcs[currentIndex];
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  };

  const showPrev = () => {
    currentIndex = (currentIndex - 1 + srcs.length) % srcs.length;
    lightboxImg.src = srcs[currentIndex];
  };

  const showNext = () => {
    currentIndex = (currentIndex + 1) % srcs.length;
    lightboxImg.src = srcs[currentIndex];
  };

  portfolioItems.forEach((item, i) => item.addEventListener("click", () => openLightbox(i)));
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxBg) lightboxBg.addEventListener("click", closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener("click", showPrev);
  if (lightboxNext) lightboxNext.addEventListener("click", showNext);

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("active")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showPrev();
    if (event.key === "ArrowRight") showNext();
  });
}

// Reviews slider (home page)
const reviewCards = document.querySelectorAll(".review-card");
const dots = document.querySelectorAll(".dot");
const reviewsPrev = document.querySelector(".reviews-prev");
const reviewsNext = document.querySelector(".reviews-next");
let reviewIndex = 0;
let reviewTimer;

if (reviewCards.length && dots.length && reviewsPrev && reviewsNext) {
  const showReview = (index) => {
    reviewCards.forEach((card) => card.classList.remove("active"));
    dots.forEach((dot) => dot.classList.remove("active"));
    reviewIndex = (index + reviewCards.length) % reviewCards.length;
    reviewCards[reviewIndex].classList.add("active");
    dots[reviewIndex].classList.add("active");
  };

  const startReviewTimer = () => {
    clearInterval(reviewTimer);
    reviewTimer = setInterval(() => showReview(reviewIndex + 1), 4000);
  };

  reviewsPrev.addEventListener("click", () => {
    showReview(reviewIndex - 1);
    startReviewTimer();
  });

  reviewsNext.addEventListener("click", () => {
    showReview(reviewIndex + 1);
    startReviewTimer();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showReview(Number(dot.dataset.index || 0));
      startReviewTimer();
    });
  });

  startReviewTimer();
}
