/**
 * Pause/play toggles for auto-playing background media (WCAG 2.2.2) and prefers-reduced-motion.
 *
 * Imported by the client scripts of Feature.astro and Video.astro. Markup contract:
 *   [data-media-wrap]            container of one piece of media
 *     <iframe|video data-media data-src="...">   src is only set here, and not at all under reduced motion
 *     [data-media-poster]        optional element shown while an iframe is not playing
 *     <button data-media-toggle data-label-pause="..." data-label-play="...">
 *       [data-icon="pause"] and [data-icon="play"]   one of them is shown: pause while the media plays (the default),
 *                                                    play while it is paused. Local videos report their real state through
 *                                                    the play/pause events; iframes cannot, so they follow the button.
 *     data-media-center on the button moves it to the middle of the container while paused
 *
 * Pausing an iframe replaces its src with about:blank (works for every provider, no player API needed);
 * playing puts the data-src back. Local videos use pause()/play().
 * Every step is null-safe and wrapped in try/catch: component scripts on a page share one bundle, so an
 * uncaught error here would stop the gallery and slider scripts that follow.
 */

type MediaEl = HTMLIFrameElement | HTMLVideoElement;

const BLANK = "about:blank";

/** Gan Jing World embeds only honour mute=1 in the URL, so make sure it is there. */
function withMute(url: string): string {
  if (url.includes("ganjingworld.com") && !url.includes("mute=1")) {
    return url + (url.includes("?") ? "&" : "?") + "mute=1";
  }
  return url;
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setup(btn: HTMLButtonElement, reduce: boolean): void {
  if (btn.dataset.mediaReady) return;
  btn.dataset.mediaReady = "1";

  const wrap = btn.closest<HTMLElement>("[data-media-wrap]");
  const media = wrap ? wrap.querySelector<MediaEl>("[data-media]") : null;
  const src = media ? media.dataset.src || "" : "";
  if (!wrap || !media || !src) return;

  const poster = wrap.querySelector<HTMLElement>("[data-media-poster]");
  const pauseIcon = btn.querySelector<HTMLElement>("[data-icon='pause']");
  const playIcon = btn.querySelector<HTMLElement>("[data-icon='play']");
  const center = btn.hasAttribute("data-media-center");

  let playing = !reduce;
  let touched = false;

  const render = () => {
    const label = (playing ? btn.dataset.labelPause : btn.dataset.labelPlay) || "";
    if (label) {
      btn.setAttribute("aria-label", label);
      btn.title = label;
    }
    btn.dataset.state = playing ? "playing" : "paused";
    if (pauseIcon) pauseIcon.style.display = playing ? "" : "none";
    if (playIcon) playIcon.style.display = playing ? "none" : "";
    if (center) {
      const s = btn.style;
      s.top = playing ? "" : "50%";
      s.left = playing ? "" : "50%";
      s.right = playing ? "" : "auto";
      s.bottom = playing ? "" : "auto";
      s.transform = playing ? "" : "translate(-50%, -50%)";
    }
  };

  const start = () => {
    playing = true;
    if (media instanceof HTMLVideoElement) {
      if (!media.getAttribute("src")) media.src = src;
      const p = media.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Autoplay refused (or interrupted by a quick pause): reflect the real state.
          if (media.paused) {
            playing = false;
            render();
          }
        });
      }
    } else {
      media.src = withMute(src);
    }
    render();
  };

  const stop = () => {
    playing = false;
    if (media instanceof HTMLVideoElement) {
      media.pause();
    } else {
      media.src = BLANK;
      if (poster) poster.style.display = "";
    }
    render();
  };

  if (media instanceof HTMLIFrameElement) {
    // Keep the poster until the embed has loaded so the box is never empty.
    media.addEventListener("load", () => {
      if (playing && poster) poster.style.display = "none";
    });
  }

  if (media instanceof HTMLVideoElement) {
    // The browser can start or pause a muted video on its own (background tab, battery saver, autoplay policy):
    // keep the icon and label in step with what the video is really doing, not with what we last asked for.
    media.addEventListener("playing", () => {
      playing = true;
      render();
    });
    media.addEventListener("pause", () => {
      playing = false;
      render();
    });
  }

  btn.addEventListener("click", () => {
    touched = true;
    if (playing) stop();
    else start();
  });

  render();
  if (reduce) {
    // Not loaded at all: the poster (or the section background) shows and the button starts it.
    if (poster) poster.style.display = "";
    return;
  }

  if (media instanceof HTMLVideoElement) {
    // Defer the video download until after the page has loaded so it never competes with the LCP element.
    const load = () => {
      if (!touched) start();
    };
    if (document.readyState === "complete") load();
    else window.addEventListener("load", load, { once: true });
  } else {
    start();
  }
}

function init(): void {
  try {
    const reduce = prefersReducedMotion();
    document.querySelectorAll<HTMLButtonElement>("button[data-media-toggle]").forEach((btn) => {
      try {
        setup(btn, reduce);
      } catch (e) {
        /* leave this one alone, keep the rest working */
      }
    });
  } catch (e) {
    /* never break the other scripts on the page */
  }
}

init();
