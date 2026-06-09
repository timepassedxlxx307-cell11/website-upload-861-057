(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = next;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === index);
      });
    }
    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        show(itemIndex);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5200);
    }
  }

  function initSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll(".site-search-form")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var query = input.value.trim();
        if (!query) {
          event.preventDefault();
          input.focus();
          return;
        }
      });
    });
  }

  function initFilter() {
    var grid = document.querySelector("[data-filter-list]");
    if (!grid) {
      return;
    }
    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-filter-select]");
    var empty = document.querySelector("[data-empty]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input && initial) {
      input.value = initial;
    }
    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var category = select ? select.value : "";
      var visible = 0;
      Array.prototype.slice.call(grid.querySelectorAll("[data-search]")).forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var cardCategory = card.getAttribute("data-category") || "";
        var matchText = !query || text.indexOf(query) !== -1;
        var matchCategory = !category || cardCategory === category;
        var shouldShow = matchText && matchCategory;
        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }
    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (select) {
      select.addEventListener("change", applyFilter);
    }
    applyFilter();
  }

  function initPage() {
    initMenu();
    initHero();
    initSearchForms();
    initFilter();
  }

  window.setupMoviePlayer = function (config) {
    var video = document.getElementById(config.videoId || "moviePlayer");
    var overlay = document.getElementById(config.buttonId || "playerOverlay");
    var source = config.source;
    if (!video || !source) {
      return;
    }
    var loaded = false;
    var instance = null;
    function attach() {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(source);
        instance.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }
    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }
    function showOverlay() {
      if (overlay && video.paused) {
        overlay.classList.remove("is-hidden");
      }
    }
    function start() {
      attach();
      video.controls = true;
      hideOverlay();
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          showOverlay();
        });
      }
    }
    if (overlay) {
      overlay.addEventListener("click", function (event) {
        event.preventDefault();
        start();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", showOverlay);
    video.addEventListener("error", showOverlay);
    window.addEventListener("beforeunload", function () {
      if (instance) {
        instance.destroy();
      }
    });
  };

  ready(initPage);
})();
