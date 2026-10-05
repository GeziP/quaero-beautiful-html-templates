/**
 * Quaero corporate header/footer: sync title + page counter, tint chrome from active slide background.
 * Works with deck-stage (slidechange), .slide.is-active (Studio/Signal), and .slide.active (most vanilla decks).
 */
(function () {
  "use strict";

  const cfg = window.__QUAERO_CHROME__ || {};
  const root = document.documentElement;

  const headerTitle = document.getElementById("qhi-header-title");
  const headerPage = document.getElementById("qhi-header-page");
  const headerEl = document.querySelector(".qhi-header");
  const footerEl = document.querySelector(".quaero-footer");

  if (cfg.frameX) root.style.setProperty("--frame-x", cfg.frameX);
  if (cfg.frameInnerX) root.style.setProperty("--frame-inner-x", cfg.frameInnerX);
  if (cfg.chromeTop) root.style.setProperty("--chrome-top", cfg.chromeTop);
  if (cfg.chromeBottom) root.style.setProperty("--chrome-bottom", cfg.chromeBottom);
  if (cfg.chromeHeaderHeight) {
    root.style.setProperty("--chrome-header-height", cfg.chromeHeaderHeight);
  }
  if (cfg.chromeFooterHeight) {
    root.style.setProperty("--chrome-footer-height", cfg.chromeFooterHeight);
  }

  /** Hide deck-stage's built-in bottom overlay (duplicate slide counter) — shadow DOM is open. */
  function hideDeckStageOverlays() {
    if (cfg.hideDeckOverlay === false) return;
    document.querySelectorAll("deck-stage").forEach(function (el) {
      const sr = el.shadowRoot;
      if (!sr) return;
      const over = sr.querySelector(".overlay");
      if (over) over.style.setProperty("display", "none", "important");
    });
  }

  function alignStageChrome(reference) {
    const stage = document.querySelector("deck-stage");
    if (!stage || !reference) return 1;
    const canvas = stage.shadowRoot && stage.shadowRoot.querySelector(".canvas");
    const rect = (canvas || reference).getBoundingClientRect();
    const scale = rect.width / reference.offsetWidth;
    if (!scale || !rect.height) return 1;
    function stageLength(value, fallback) {
      if (typeof value !== "string") return fallback;
      const n = parseFloat(value);
      if (!Number.isFinite(n)) return fallback;
      if (value.endsWith("vh")) return n * rect.height / 100;
      if (value.endsWith("vw")) return n * rect.width / 100;
      if (value.endsWith("px")) return n * 1.5 * scale;
      return fallback;
    }
    // Keep chrome on the slide, including when the stage is letterboxed.
    // The previous viewport-fixed frame drifted from the content on resize.
    const frame = typeof cfg.stageFramePx === "number" ? cfg.stageFramePx * scale : stageLength(cfg.frameX, 120 * scale);
    const inner = stageLength(cfg.frameInnerX, 18 * scale);
    [headerEl, footerEl].forEach(function (el) {
      if (!el) return;
      el.style.left = `${rect.left + frame}px`;
      el.style.right = `${window.innerWidth - rect.right + frame}px`;
      el.style.paddingLeft = el.style.paddingRight = `${inner}px`;
      el.style.boxSizing = "border-box";
      el.style.minHeight = "0";
    });
    if (headerEl) {
      headerEl.style.top = `${rect.top + stageLength(cfg.chromeTop, rect.height * 0.016)}px`;
      headerEl.style.height = `${stageLength(cfg.chromeHeaderHeight, rect.height * 0.054)}px`;
    }
    if (footerEl) {
      footerEl.style.bottom = `${window.innerHeight - rect.bottom + stageLength(cfg.chromeBottom, 0)}px`;
      footerEl.style.height = `${stageLength(cfg.chromeFooterHeight, rect.height * 0.08)}px`;
      const logo = footerEl.querySelector(".logo-img");
      const text = footerEl.querySelector(".conf-text");
      if (logo) {
        logo.style.height = `${rect.height * 0.05}px`;
        logo.style.minHeight = "0";
        logo.style.marginRight = `${28.8 * scale}px`;
      }
      if (text) text.style.fontSize = `${17.5 * scale}px`;
    }
    if (headerTitle) headerTitle.style.fontSize = `${22 * scale}px`;
    if (headerPage) headerPage.style.fontSize = `${18 * scale}px`;
    return scale;
  }

  function computeSafeInsets(extraScale = 1) {
    const extraTop = (typeof cfg.safeTopExtraPx === "number" ? cfg.safeTopExtraPx : 8) * extraScale;
    const extraBottom =
      (typeof cfg.safeBottomExtraPx === "number" ? cfg.safeBottomExtraPx : 8) * extraScale;
    const headerRect = headerEl
      ? headerEl.getBoundingClientRect()
      : { bottom: 0 };
    const footerRect = footerEl
      ? footerEl.getBoundingClientRect()
      : { top: window.innerHeight };
    return {
      topInset: Math.max(0, Math.ceil(headerRect.bottom + extraTop)),
      bottomInset: Math.max(
        0,
        Math.ceil(window.innerHeight - footerRect.top + extraBottom),
      ),
    };
  }

  function applySafeAreaToSlides(slides) {
    const stage = document.querySelector("deck-stage");
    const reference = stage && (stage.querySelector("[data-deck-active]") || slides[0]);
    const chromeScale = alignStageChrome(reference);
    const insets = computeSafeInsets(stage ? chromeScale * 1.5 : 1);
    const rect = reference ? reference.getBoundingClientRect() : null;
    const scale = rect && reference.offsetHeight ? rect.height / reference.offsetHeight : 1;
    // deck-stage renders a native canvas under a viewport scale. Chrome is in
    // viewport pixels, while slide padding is in native canvas pixels.
    const topInset = rect ? Math.max(0, insets.topInset - rect.top) / (scale || 1) : insets.topInset;
    const bottomInset = rect ? Math.max(0, insets.bottomInset - (window.innerHeight - rect.bottom)) / (scale || 1) : insets.bottomInset;
    slides.forEach(function (slide) {
      if (!(slide instanceof HTMLElement)) return;
      if (slide.dataset.quaeroSafeApplied !== "1") {
        const cs = getComputedStyle(slide);
        slide.dataset.quaeroBasePt = String(Number.parseFloat(cs.paddingTop) || 0);
        slide.dataset.quaeroBasePb = String(Number.parseFloat(cs.paddingBottom) || 0);
        slide.dataset.quaeroSafeApplied = "1";
      }
      const basePt = Number(slide.dataset.quaeroBasePt || 0);
      const basePb = Number(slide.dataset.quaeroBasePb || 0);
      slide.style.boxSizing = "border-box";
      slide.style.paddingTop = `${basePt + topInset}px`;
      slide.style.paddingBottom = `${basePb + bottomInset}px`;
    });
  }

  function normalizeTitle(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .replace(/^\d+\s*/, "")
      .trim();
  }

  function extractSlideTitle(slide) {
    if (!slide) return "PRESENTATION";
    const fromDataLabel = normalizeTitle(slide.getAttribute("data-label"));
    if (fromDataLabel) return fromDataLabel;
    const fromScreen = normalizeTitle(slide.getAttribute("data-screen-label"));
    if (fromScreen) return fromScreen;
    const heading = slide.querySelector("h1, h2, h3");
    const fromHeading = normalizeTitle(heading ? heading.textContent : "");
    if (fromHeading) return fromHeading;
    return "PRESENTATION";
  }

  function parseRgb(color) {
    const parts = color && color.match(/\d+(\.\d+)?/g);
    if (!parts || parts.length < 3) return null;
    return {
      r: Number(parts[0]),
      g: Number(parts[1]),
      b: Number(parts[2]),
    };
  }

  function relativeLuminance(r, g, b) {
    function channel(v) {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  }

  function getComputedSlideBackground(slide) {
    const fallback = cfg.fallbackBg || "rgb(242, 238, 223)";
    if (!slide) return fallback;
    let node = slide;
    while (node && node !== document.body) {
      const bg = getComputedStyle(node).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
      node = node.parentElement;
    }
    return fallback;
  }

  function applyChrome(slide, index, total) {
    if (!slide) return;
    const bg = getComputedSlideBackground(slide);
    const rgb = parseRgb(bg);
    const threshold =
      typeof cfg.luminanceThreshold === "number" ? cfg.luminanceThreshold : 0.45;
    const dark = rgb ? relativeLuminance(rgb.r, rgb.g, rgb.b) < threshold : false;

    root.style.setProperty("--qhi-chrome-bg", bg);
    root.style.setProperty(
      "--qhi-chrome-border",
      dark ? "rgba(242, 238, 223, 0.26)" : "rgba(42, 36, 27, 0.24)",
    );
    root.style.setProperty("--qhi-chrome-text", dark ? "#F2EEDF" : "#2A241B");
    root.style.setProperty(
      "--qhi-chrome-subtext",
      dark ? "rgba(242, 238, 223, 0.72)" : "#5C5345",
    );

    if (headerTitle) headerTitle.textContent = extractSlideTitle(slide).toUpperCase();
    if (headerPage) {
      headerPage.textContent =
        String(index + 1).padStart(2, "0") +
        " / " +
        String(Math.max(1, total)).padStart(2, "0");
    }
  }

  function collectSlides() {
    const stage = document.querySelector("deck-stage");
    if (stage) {
      const directSections = Array.from(stage.querySelectorAll(":scope > section"));
      if (directSections.length) return directSections;
      const kids = Array.from(stage.children).filter(function (el) {
        return el.matches && el.matches("section.slide, .slide");
      });
      if (kids.length) return kids;
    }
    return Array.from(document.querySelectorAll(".slide"));
  }

  function findActiveSlide(slides) {
    const stage = document.querySelector("deck-stage");
    if (stage) {
      const marked = stage.querySelector("[data-deck-active]");
      if (marked) return marked;
    }
    const byIs = slides.find(function (s) {
      return s.classList && s.classList.contains("is-active");
    });
    if (byIs) return byIs;
    const byActive = slides.find(function (s) {
      return s.classList && s.classList.contains("active");
    });
    if (byActive) return byActive;
    if (window.QuaeroExport) return window.QuaeroExport.currentSlide();
    return slides[0] || null;
  }

  function resolveIndex(active, slides) {
    if (!active) return 0;
    const fromAttr = active.getAttribute("data-deck-slide");
    if (fromAttr != null && fromAttr !== "") {
      const n = Number(fromAttr);
      if (!Number.isNaN(n)) return n;
    }
    const fromDataIndex = active.getAttribute("data-index");
    if (fromDataIndex != null && fromDataIndex !== "") {
      const n = Number(fromDataIndex);
      if (!Number.isNaN(n)) return n;
    }
    const i = slides.indexOf(active);
    return i >= 0 ? i : 0;
  }

  let rafScheduled = false;
  function scheduleSync() {
    if (rafScheduled) return;
    rafScheduled = true;
    requestAnimationFrame(function () {
      rafScheduled = false;
      syncFromCurrentSlide();
    });
  }

  function syncFromCurrentSlide() {
    const slides = collectSlides();
    applySafeAreaToSlides(slides);
    const total = slides.length || 1;
    const active = findActiveSlide(slides);
    const index = resolveIndex(active, slides);
    applyChrome(active, index, total);
  }

  const stage = document.querySelector("deck-stage");
  if (stage) {
    stage.addEventListener("slidechange", function (event) {
      const detail = event.detail || {};
      const slides = collectSlides();
      applySafeAreaToSlides(slides);
      const slide =
        detail.slide ||
        stage.querySelector("[data-deck-active]") ||
        findActiveSlide(slides);
      const index = Number(detail.index);
      const total = Number(detail.total);
      applyChrome(
        slide,
        Number.isFinite(index) ? index : resolveIndex(slide, slides),
        Number.isFinite(total) && total > 0 ? total : slides.length || 1,
      );
    });
  }

  const slidesForObserver = collectSlides();
  slidesForObserver.forEach(function (el) {
    try {
      const mo = new MutationObserver(function () {
        scheduleSync();
      });
      mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    } catch (_) {}
  });

  document.addEventListener("keyup", function (e) {
    if (
      e.key === "ArrowRight" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "PageDown" ||
      e.key === "PageUp" ||
      e.key === " " ||
      e.key === "Home" ||
      e.key === "End"
    ) {
      scheduleSync();
    }
  });

  document.addEventListener("click", scheduleSync);
  document.addEventListener("scroll", scheduleSync, true);
  window.addEventListener("resize", function () {
    hideDeckStageOverlays();
    scheduleSync();
  });

  hideDeckStageOverlays();
  requestAnimationFrame(function () {
    hideDeckStageOverlays();
    syncFromCurrentSlide();
  });
})();
