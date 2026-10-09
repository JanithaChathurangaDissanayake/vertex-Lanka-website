"use strict";
 
/* =========================
   1. SETUP & HELPERS
========================= */
 
document.documentElement.classList.add("js");
 
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));
 
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;
 
// True on laptops/desktops with a mouse, false on phones and tablets
const finePointer = window.matchMedia(
  "(hover: hover) and (pointer: fine)"
).matches;
 
 
/* =========================
   2. MOBILE MENU
========================= */
 
const menuButton = $("#menuButton");
const navMenu = $("#navMenu");
 
if (menuButton && navMenu) {
  const setMenu = (open) => {
    navMenu.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", String(open));
  };
 
  setMenu(false);
 
  menuButton.addEventListener("click", () => {
    setMenu(!navMenu.classList.contains("open"));
  });
 
  // Close when a link is clicked
  navMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
 
  // Close with the Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
}
 
 
/* =========================
   3. ACTIVE NAVIGATION LINK
========================= */
 
// "/about.html", "/about" and "/about.html?x=1" all become "about"
const normalizePage = (path) => {
  const page = path.split(/[?#]/)[0].split("/").pop();
  return (page || "index").replace(/\.html$/, "");
};
 
const currentPage = normalizePage(window.location.pathname);
 
// Product detail pages highlight the "Products" link
const activePage = ["sims", "shop", "invoice"].includes(currentPage)
  ? "products"
  : currentPage;
 
$$(".nav-menu a").forEach((link) => {
  const href = link.getAttribute("href") || "";
 
  // Skip empty, "#" and external links
  if (!href || href.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(href)) {
    return;
  }
 
  const linkPage = normalizePage(href);
 
  if (linkPage === currentPage || linkPage === activePage) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }
});
 
 
/* =========================
   4. SCROLL ANIMATIONS
 
   Each section gets its own animation style, so the page feels
   different as you scroll from frame to frame. Animations are
   assigned here automatically - no HTML changes needed.
 
   Format: [selector, animation (or list to alternate), stagger in ms]
 
   Available animations:
   fade-up | from-left | from-right | zoom-in | flip-up | blur-in | clip-reveal
 
   The FIRST matching rule wins, so put specific rules first.
   You can also set data-anim="..." and data-delay="120" in HTML by hand.
========================= */
 
const SCROLL_ANIMATIONS = [
  // Home
  [".hero-visual", "zoom-in"],
  [".section-heading", "fade-up"],
  [".services-grid .service-card", "fade-up", 80],
  [".products-grid .product-card", ["zoom-in", "from-left", "from-right"], 120],
  [".industries-grid .industry-card", "flip-up", 130],
  [".why-content", "from-left"],
  [".why-item", "from-right", 110],
  [".process-card", "blur-in", 120],
  [".cta-box", "zoom-in"],
 
  // About
  [".about-hero-content", "fade-up"],
  [".about-intro-title", "from-left"],
  [".about-intro-text", "from-right"],
  [".principle-card", "flip-up", 110],
  [".capabilities-content", "from-left"],
  [".capability-item", "from-right", 80],
 
  // Products page (content and visual swap sides on alternate sections)
  [".products-page-hero-content", "fade-up"],
  [".alternate-section .product-feature-content", "from-right"],
  [".alternate-section .product-feature-visual", "from-left"],
  [".product-feature-content", "from-left"],
  [".product-feature-visual", "from-right"],
 
  // Product detail pages
  [".product-page-hero-content", "from-left"],
  [".product-page-hero-visual", "zoom-in"],
  [".product-overview-grid > :first-child", "from-left"],
  [".product-overview-text", "from-right"],
  [".feature-card", "flip-up", 90],
  [".product-benefits-content", "from-left"],
  [".benefit-item", "from-right", 110],
  [".real-product-preview", "clip-reveal"],
 
  // Contact
  [".contact-hero-content", "fade-up"],
  [".contact-form-wrapper", "from-left"],
  [".contact-info", "from-right"]
];
 
const ANIM_DURATION = 900; // must be a little longer than the CSS transition
const MAX_STAGGER = 450;   // long grids never wait more than this
 
const assignAnimations = () => {
  SCROLL_ANIMATIONS.forEach(([selector, animation, stagger = 0]) => {
    const counters = new Map(); // position of each element inside its parent
 
    $$(selector).forEach((element) => {
      if (element.dataset.anim) return;
 
      const parent = element.parentElement;
      const position = counters.get(parent) || 0;
      counters.set(parent, position + 1);
 
      const type = Array.isArray(animation)
        ? animation[position % animation.length]
        : animation;
 
      // The old .reveal style is replaced by the richer data-anim style
      element.classList.remove("reveal");
      element.dataset.anim = type;
 
      if (!element.dataset.delay && stagger) {
        element.style.setProperty(
          "--d",
          `${Math.min(position * stagger, MAX_STAGGER)}ms`
        );
      }
    });
  });
};
 
 
/* =========================
   5. HERO HEADLINE WORD REVEAL
   Splits the main heading into words that slide up one by one.
========================= */
 
const splitHeading = (heading) => {
  const text = heading.textContent.trim().replace(/\s+/g, " ");
 
  heading.setAttribute("aria-label", text); // screen readers read the full title
  heading.textContent = "";
 
  text.split(" ").forEach((word, index, words) => {
    const wrap = document.createElement("span");
    const inner = document.createElement("span");
 
    wrap.className = "w";
    wrap.setAttribute("aria-hidden", "true");
    inner.textContent = word;
    inner.style.setProperty("--i", index);
 
    wrap.appendChild(inner);
    heading.appendChild(wrap);
 
    if (index < words.length - 1) heading.append(" ");
  });
 
  heading.classList.add("split");
};
 
if (!reducedMotion) {
  assignAnimations();
 
  $$(
    ".hero h1, .about-hero h1, .products-page-hero h1, " +
    ".product-page-hero h1, .contact-hero h1"
  ).forEach(splitHeading);
}
 
 
/* =========================
   Reveal observer
========================= */
 
const revealTargets = $$("[data-anim], .reveal, .split");
 
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
 
        const element = entry.target;
        element.classList.add("visible");
        revealObserver.unobserve(element);
 
        // Once the entrance finishes, hand the element back to its normal
        // CSS so hover effects (lift, tilt, glow) work without interference.
        if (element.dataset.anim) {
          const delay = parseFloat(element.style.getPropertyValue("--d")) || 0;
 
          window.setTimeout(() => {
            element.removeAttribute("data-anim");
            element.classList.remove("visible");
            element.style.removeProperty("--d");
          }, ANIM_DURATION + delay);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
 
  revealTargets.forEach((element) => revealObserver.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add("visible"));
}
 
 
/* =========================
   6. SCROLL PROGRESS, HEADER SHADOW, PARALLAX
========================= */
 
let progressBar = $(".progress");
 
if (!progressBar) {
  progressBar = document.createElement("div");
  progressBar.className = "progress";
  progressBar.setAttribute("aria-hidden", "true");
  document.body.prepend(progressBar);
}
 
const header = $(".site-header");
 
// Floating "back to top" button, so long pages are easy to leave
const toTop = document.createElement("button");
toTop.className = "to-top";
toTop.type = "button";
toTop.setAttribute("aria-label", "Back to top");
toTop.innerHTML = "<span aria-hidden=\"true\">↑</span>";
toTop.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })
);
document.body.appendChild(toTop);
 
// Gentle depth on the hero visuals. Add data-parallax="0.05" to any element
// in your HTML to use it elsewhere (keep values between 0.03 and 0.12).
$$(".tech-card, .product-screenshot").forEach((element) => {
  if (!element.dataset.parallax) element.dataset.parallax = "0.05";
});
 
const parallaxItems = reducedMotion ? [] : $$("[data-parallax]");
 
let scrollTicking = false;
 
const updateOnScroll = () => {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
 
  progressBar.style.transform = `scaleX(${maxScroll > 0 ? scrollY / maxScroll : 0})`;
 
  if (header) header.classList.toggle("scrolled", scrollY > 8);
  toTop.classList.toggle("show", scrollY > 700);
 
  // Parallax only matters near the top; clamp so it never runs away
  const offset = Math.min(scrollY, window.innerHeight);
 
  parallaxItems.forEach((item) => {
    const speed = parseFloat(item.dataset.parallax) || 0;
    item.style.transform = `translate3d(0, ${offset * speed}px, 0)`;
  });
 
  scrollTicking = false;
};
 
const requestScrollUpdate = () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(updateOnScroll);
};
 
window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate, { passive: true });
updateOnScroll();
 
 
/* =========================
   7. CARD TILT + SPOTLIGHT, MAGNETIC BUTTONS
   Mouse devices only. One shared listener keeps it light.
========================= */
 
if (!reducedMotion && finePointer) {
  const CARD_SELECTOR =
    ".service-card, .product-card, .industry-card, " +
    ".process-card, .feature-card, .principle-card";
  const MAX_TILT = 5;        // degrees
  const MAGNET_PULL = 0.25;  // how strongly buttons follow the cursor
 
  $$(CARD_SELECTOR).forEach((card) => card.classList.add("tilt-ready"));
 
  let activeCard = null;
  let activeButton = null;
  let lastEvent = null;
  let pointerTicking = false;
 
  const resetCard = (card) => {
    if (!card) return;
    card.style.removeProperty("--rx");
    card.style.removeProperty("--ry");
  };
 
  const resetButton = (button) => {
    if (button) button.style.translate = "";
  };
 
  const handlePointer = () => {
    pointerTicking = false;
    if (!lastEvent) return;
 
    const { clientX, clientY, target } = lastEvent;
    const card = target.closest ? target.closest(CARD_SELECTOR) : null;
    const button = target.closest ? target.closest(".button") : null;
 
    if (card !== activeCard) {
      resetCard(activeCard);
      activeCard = card;
    }
 
    if (button !== activeButton) {
      resetButton(activeButton);
      activeButton = button;
    }
 
    if (card) {
      const rect = card.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
 
      card.style.setProperty("--mx", `${clientX - rect.left}px`);
      card.style.setProperty("--my", `${clientY - rect.top}px`);
      card.style.setProperty("--rx", `${(0.5 - y) * 2 * MAX_TILT}deg`);
      card.style.setProperty("--ry", `${(x - 0.5) * 2 * MAX_TILT}deg`);
    }
 
    if (button) {
      const rect = button.getBoundingClientRect();
      const dx = clientX - (rect.left + rect.width / 2);
      const dy = clientY - (rect.top + rect.height / 2);
      button.style.translate = `${dx * MAGNET_PULL}px ${dy * MAGNET_PULL}px`;
    }
  };
 
  document.addEventListener(
    "pointermove",
    (event) => {
      lastEvent = event;
      if (!pointerTicking) {
        pointerTicking = true;
        window.requestAnimationFrame(handlePointer);
      }
    },
    { passive: true }
  );
 
  document.documentElement.addEventListener("mouseleave", () => {
    resetCard(activeCard);
    resetButton(activeButton);
    activeCard = null;
    activeButton = null;
  });
}
 
 
/* =========================
   8. HERO NETWORK ANIMATION
   Softly moving nodes joined by thin orange lines (software / AI / IoT
   theme). Lines reach toward the cursor on desktop. It only runs while
   the hero is on screen, and is skipped for reduced-motion visitors.
========================= */
 
const initNetwork = (host) => {
  const canvas = document.createElement("canvas");
  canvas.className = "net-canvas";
  canvas.setAttribute("aria-hidden", "true");
  host.prepend(canvas);
 
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const mouse = { x: -9999, y: -9999 };
 
  let width = 0;
  let height = 0;
  let nodes = [];
  let linkDistance = 130;
  let raf = 0;
  let last = 0;
 
  const makeNode = () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: 1.4 + Math.random() * 1.4
  });
 
  const resize = () => {
    width = host.clientWidth;
    height = host.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
 
    const small = width < 768;
    linkDistance = small ? 100 : 135;
 
    // Fewer nodes on small screens keeps it light and uncluttered
    const target = Math.max(
      16,
      Math.min(small ? 26 : 56, Math.round((width * height) / 20000))
    );
 
    while (nodes.length < target) nodes.push(makeNode());
    nodes.length = target;
  };
 
  const frame = (now) => {
    const step = Math.min((now - last) / 16.7, 3); // keeps speed steady
    last = now;
 
    ctx.clearRect(0, 0, width, height);
 
    nodes.forEach((n) => {
      n.x += n.vx * step;
      n.y += n.vy * step;
 
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    });
 
    ctx.lineWidth = 1;
 
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
 
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
 
        if (dist < linkDistance) {
          ctx.strokeStyle = `rgba(255,138,0,${(1 - dist / linkDistance) * 0.28})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
 
      // Nodes near the cursor connect to it
      const mouseDist = Math.hypot(a.x - mouse.x, a.y - mouse.y);
 
      if (mouseDist < 170) {
        ctx.strokeStyle = `rgba(255,138,0,${(1 - mouseDist / 170) * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
 
      ctx.fillStyle = "rgba(255,138,0,0.65)";
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
 
    raf = window.requestAnimationFrame(frame);
  };
 
  const start = () => {
    if (raf) return;
    last = performance.now();
    raf = window.requestAnimationFrame(frame);
  };
 
  const stop = () => {
    window.cancelAnimationFrame(raf);
    raf = 0;
  };
 
  resize();
  window.addEventListener("resize", resize, { passive: true });
 
  if (finePointer) {
    host.addEventListener(
      "pointermove",
      (event) => {
        const rect = host.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
      },
      { passive: true }
    );
 
    host.addEventListener("pointerleave", () => {
      mouse.x = mouse.y = -9999;
    });
  }
 
  // Run only while the section is visible (saves battery and CPU)
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      start();
      canvas.classList.add("on");
    } else {
      stop();
    }
  }).observe(host);
};
 
if (!reducedMotion && "IntersectionObserver" in window) {
  $$(
    ".hero, .about-hero, .products-page-hero, " +
    ".contact-hero, .product-page-hero"
  ).forEach(initNetwork);
}
 