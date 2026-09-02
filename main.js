/* Blue Ink Trust — shared behaviour
   (adapted from the Zaitoon house scripts, with the project modal system) */
(function () {
  "use strict";

  // ---------- Mobile nav toggle ----------
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      // don't collapse when opening the About sub-menu parent on mobile
      if (e.target.tagName === "A" && links.classList.contains("open")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ---------- Scroll reveal ----------
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // ---------- Footer year ----------
  var y = document.getElementById("year");
  if (y) { y.textContent = new Date().getFullYear(); }

  // ---------- Contact form (placeholder handler) ----------
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = document.getElementById("form-note");
      if (note) { note.hidden = false; }
      form.reset();
    });
  }
})();

/* ---------- Slideshows (fade + optional dots/arrows) ---------- */
function initSlideshow(ss) {
  var slides = ss.querySelectorAll(".slide");
  if (slides.length < 2) { if (slides[0]) slides[0].classList.add("active"); return; }
  var dotsWrap = ss.querySelector(".ss-dots");
  var i = 0, timer;
  if (dotsWrap && !dotsWrap.dataset.built) {
    dotsWrap.dataset.built = "1";
    slides.forEach(function (_, idx) {
      var b = document.createElement("button");
      b.className = "ss-dot" + (idx === 0 ? " active" : "");
      b.setAttribute("aria-label", "Go to slide " + (idx + 1));
      b.addEventListener("click", function () { go(idx); reset(); });
      dotsWrap.appendChild(b);
    });
  }
  function go(n) {
    slides[i].classList.remove("active");
    if (dotsWrap) dotsWrap.children[i].classList.remove("active");
    i = (n + slides.length) % slides.length;
    slides[i].classList.add("active");
    if (dotsWrap) dotsWrap.children[i].classList.add("active");
  }
  function reset() { clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 4500); }
  var np = ss.querySelector(".ss-arrow.next");
  var pp = ss.querySelector(".ss-arrow.prev");
  if (np) np.addEventListener("click", function () { go(i + 1); reset(); });
  if (pp) pp.addEventListener("click", function () { go(i - 1); reset(); });
  reset();
}

/* ---------- Mini slideshow (modal banners: .mini-slide) ---------- */
var miniTimers = new Set();
function startMiniSlideshow(el) {
  var slides = Array.prototype.slice.call(el.querySelectorAll(".mini-slide"));
  if (slides.length < 2) return;
  slides.forEach(function (s, idx) { s.classList.toggle("active", idx === 0); });
  var i = 0;
  var id = setInterval(function () {
    slides[i].classList.remove("active");
    i = (i + 1) % slides.length;
    slides[i].classList.add("active");
  }, 3500);
  miniTimers.add(id);
}
function stopAllMini() { miniTimers.forEach(function (id) { clearInterval(id); }); miniTimers.clear(); }

document.querySelectorAll(".slideshow").forEach(initSlideshow);

/* ---------- Project modal ---------- */
(function () {
  var modal = document.getElementById("modal");
  if (!modal) return;
  var modalTitle = document.getElementById("modalTitle");
  var modalBody = document.getElementById("modalBody");
  var modalLink = document.getElementById("modalLink");

  function openFromCard(card) {
    var title = card.getAttribute("data-modal-title") || "More information";
    var templateId = card.getAttribute("data-modal-template");
    modalTitle.textContent = title;
    modalBody.innerHTML = "";
    stopAllMini();

    var tpl = templateId ? document.getElementById(templateId) : null;
    if (tpl && tpl.content) {
      modalBody.appendChild(tpl.content.cloneNode(true));
      modalBody.querySelectorAll("[data-slideshow]").forEach(startMiniSlideshow);
    } else {
      modalBody.innerHTML = "<p>More information coming soon.</p>";
    }
    if (modalLink) { modalLink.href = "contact.html"; }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    modalBody.innerHTML = "";
    stopAllMini();
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".card.clickable, .pcard.clickable").forEach(function (card) {
    card.addEventListener("click", function () { openFromCard(card); });
  });

  modal.addEventListener("click", function (e) {
    var t = e.target;
    if (t === modal || (t.getAttribute && t.getAttribute("data-close") === "true")) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("open")) close();
  });
})();
