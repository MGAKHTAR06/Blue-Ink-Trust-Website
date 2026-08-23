document.addEventListener("DOMContentLoaded", () => {
  // --------------------
  // Footer year
  // --------------------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // --------------------
  // Mobile nav
  // --------------------
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // --------------------
  // HERO slideshow (behind banner text)
  // --------------------
  document.querySelectorAll("[data-hero-slideshow]").forEach((slideshow) => {
    const slides = Array.from(slideshow.querySelectorAll(".hero-slide"));
    if (slides.length <= 1) return;

    let index = 0;

    setInterval(() => {
      slides[index].classList.remove("active");
      index = (index + 1) % slides.length;
      slides[index].classList.add("active");
    }, 3500);
  });

  // --------------------
  // Mini slideshow helper (used in modal banners + normal sections)
  // --------------------
  const runningSlideshows = new Set();

  function startMiniSlideshow(slideshowEl) {
    const slides = Array.from(slideshowEl.querySelectorAll(".mini-slide"));
    if (slides.length <= 1) return;

    // Ensure exactly one active at start
    slides.forEach((s, i) => s.classList.toggle("active", i === 0));

    let index = 0;
    const id = setInterval(() => {
      slides[index].classList.remove("active");
      index = (index + 1) % slides.length;
      slides[index].classList.add("active");
    }, 3500);

    runningSlideshows.add(id);
  }

  function stopAllMiniSlideshows() {
    runningSlideshows.forEach((id) => clearInterval(id));
    runningSlideshows.clear();
  }

  // Start mini slideshows already on the page (not modal)
  document.querySelectorAll("[data-slideshow]").forEach((slideshow) => {
    startMiniSlideshow(slideshow);
  });

  // --------------------
  // Modal (templates + body)
  // --------------------
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalLink = document.getElementById("modalLink");

  function openModalFromCard(card) {
    if (!modal || !modalTitle || !modalBody) return;

    const title = card.getAttribute("data-modal-title") || "More information";
    const templateId = card.getAttribute("data-modal-template");
    const body = card.getAttribute("data-modal-body"); // fallback

    modalTitle.textContent = title;

    // Reset content + stop any previous modal banner timers
    modalBody.innerHTML = "";
    stopAllMiniSlideshows();

    // If template exists, clone it into modalBody
    if (templateId) {
      const tpl = document.getElementById(templateId);
      if (tpl && tpl.content) {
        modalBody.appendChild(tpl.content.cloneNode(true));

        // Start mini slideshows inside THIS modal only
        modalBody.querySelectorAll("[data-slideshow]").forEach((slideshow) => {
          startMiniSlideshow(slideshow);
        });
      } else {
        // Template ID was set but not found
        modalBody.innerHTML = `<p>Sorry — the content for this project couldn't be found.</p>`;
      }
    } else if (body) {
      // Fallback: allow HTML if you passed it in data-modal-body
      modalBody.innerHTML = body;
      modalBody.querySelectorAll("[data-slideshow]").forEach((slideshow) => {
        startMiniSlideshow(slideshow);
      });
    } else {
      modalBody.innerHTML = `<p>More information coming soon.</p>`;
    }

    // Default CTA link (you can customize later per project if you want)
    if (modalLink) {
      modalLink.href = "contact.html";
      modalLink.textContent = "Support this project";
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    // Prevent background page scrolling while modal open
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");

    // Clear modal content and stop timers (prevents stacking)
    if (modalBody) modalBody.innerHTML = "";
    stopAllMiniSlideshows();

    // Re-enable background scroll
    document.body.style.overflow = "";
  }

  // Clickable project cards
  document.querySelectorAll(".card.clickable").forEach((card) => {
    card.addEventListener("click", () => openModalFromCard(card));
  });

  if (modal) {
    // Close modal when clicking anything with data-close="true"
    modal.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.getAttribute && target.getAttribute("data-close") === "true") {
        closeModal();
      }

      // If user clicks the backdrop (outside the modal card) close it
      if (target === modal) closeModal();
    });

    // ESC to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
  }

  // --------------------
  // Contact form demo
  // --------------------
  const msgForm = document.getElementById("messageForm");
  const formMsg = document.getElementById("formMsg");

  if (msgForm) {
    msgForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (formMsg) formMsg.textContent = "Thanks! Your message has been received (demo).";
      msgForm.reset();
    });
  }
});

// =========================
// Home Hero Slideshow (auto)
// =========================
(function () {
  const slidesWrap = document.getElementById("slides");
  if (!slidesWrap) return;

  const slides = Array.from(slidesWrap.querySelectorAll(".slide"));
  const dots = Array.from(document.querySelectorAll(".dot"));
  const prevBtn = document.getElementById("prevSlide");
  const nextBtn = document.getElementById("nextSlide");

  let current = slides.findIndex(s => s.classList.contains("is-active"));
  if (current < 0) current = 0;

  const show = (i) => {
    slides[current].classList.remove("is-active");
    dots[current]?.classList.remove("is-active");

    current = (i + slides.length) % slides.length;

    slides[current].classList.add("is-active");
    dots[current]?.classList.add("is-active");
  };

  const next = () => show(current + 1);
  const prev = () => show(current - 1);

  // Auto play
  let timer = setInterval(next, 5000);

  const resetTimer = () => {
    clearInterval(timer);
    timer = setInterval(next, 5000);
  };

  // Controls
  nextBtn?.addEventListener("click", () => { next(); resetTimer(); });
  prevBtn?.addEventListener("click", () => { prev(); resetTimer(); });

  dots.forEach((d, idx) => {
    d.addEventListener("click", () => { show(idx); resetTimer(); });
  });

  // Pause on hover (optional but feels premium)
  slidesWrap.addEventListener("mouseenter", () => clearInterval(timer));
  slidesWrap.addEventListener("mouseleave", () => resetTimer());
})();
