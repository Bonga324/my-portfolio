// main.js - shared site behavior (mobile nav + FormSubmit redirect helper + scrollspy)

(() => {
  function initMobileNav() {
    const nav = document.querySelector(".site-nav");
    const navBtn = document.querySelector(".nav-toggle");
    if (!nav || !navBtn) return;

    const navLinks = nav.querySelectorAll(".nav-links a");

    function closeNav() {
      nav.classList.remove("open");
      navBtn.setAttribute("aria-expanded", "false");
    }

    navBtn.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      navBtn.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.forEach(a => a.addEventListener("click", closeNav));

    document.addEventListener("click", (e) => {
      if (!nav.contains(e.target)) closeNav();
    });
  }

  function initFormSubmitNextUrl() {
    // Auto-set FormSubmit redirect to /thankyou.html on the CURRENT origin
    // Works on localhost and deployed domains.
    const forms = document.querySelectorAll('form[action^="https://formsubmit.co/"]');
    if (!forms.length) return;

    forms.forEach(form => {
      const next = form.querySelector('input[name="_next"]');
      if (!next) return;

      const val = (next.value || "").trim();
      if (!val || val.includes("your-domain.com")) {
        next.value = `${window.location.origin}/thankyou.html`;
      }
    });
  }

  function initScrollSpy() {
    // Scrollspy for one-page anchors (index.html).
    const nav = document.querySelector(".site-nav");
    if (!nav) return;

    const links = Array.from(nav.querySelectorAll('.nav-links a[href^="#"]'));
    if (!links.length) return;

    const ids = links
      .map(a => a.getAttribute("href").slice(1))
      .filter(Boolean);

    const sections = ids
      .map(id => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return;

    function setActive(id) {
      links.forEach(a => {
        const match = a.getAttribute("href") === `#${id}`;
        a.classList.toggle("active", match);
        if (match) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) setActive(visible.target.id);
    }, {
      threshold: [0.15, 0.25, 0.35, 0.5, 0.65],
      rootMargin: `-${64 + 12}px 0px -55% 0px`
    });

    sections.forEach(sec => observer.observe(sec));

    const hash = (window.location.hash || "").replace("#", "");
    if (hash && document.getElementById(hash)) setActive(hash);
    else setActive(sections[0].id);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMobileNav();
    initFormSubmitNextUrl();
    initScrollSpy();
  });
})();