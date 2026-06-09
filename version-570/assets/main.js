(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector(".js-menu-button");
    var nav = document.querySelector(".js-site-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector(".js-hero");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupLocalFilter() {
    var input = document.querySelector(".js-local-filter");
    var list = document.querySelector(".js-filter-list");
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = card.getAttribute("data-filter-text") || "";
        card.style.display = !q || haystack.indexOf(q) !== -1 ? "" : "none";
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function searchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    var meta = [item.year || "热播", item.region, item.type].filter(Boolean).join(" · ");
    return "<article class=\"movie-card\">" +
      "<a href=\"" + escapeHtml(item.url) + "\" class=\"poster-link\" aria-label=\"观看" + escapeHtml(item.title) + "\">" +
      "<span class=\"poster-wrap\"><img src=\"" + escapeHtml(item.image) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\"><span class=\"poster-shade\"></span><span class=\"play-icon\">▶</span><span class=\"corner-label\">" + escapeHtml(item.category) + "</span></span></a>" +
      "<div class=\"card-content\"><h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3><p>" + escapeHtml(item.oneLine) + "</p><div class=\"card-meta\">" + escapeHtml(meta) + "</div><div class=\"tag-row\">" + tags + "</div></div></article>";
  }

  function setupSearchPage() {
    var input = document.querySelector(".js-search-input");
    var results = document.querySelector(".js-search-results");
    if (!input || !results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function render() {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = "<p class=\"empty-state\">输入关键词后即可查找影片。</p>";
        return;
      }
      var matched = window.SEARCH_INDEX.filter(function (item) {
        return String(item.text || "").toLowerCase().indexOf(q) !== -1;
      }).slice(0, 96);
      results.innerHTML = matched.length ? matched.map(searchCard).join("") : "<p class=\"empty-state\">没有找到相关影片。</p>";
    }
    input.addEventListener("input", render);
    render();
  }

  window.initMoviePlayer = function (wrapperId, playlistUrl) {
    var wrapper = document.getElementById(wrapperId);
    if (!wrapper) {
      return;
    }
    var video = wrapper.querySelector("video");
    var overlay = wrapper.querySelector("[data-play]");
    if (!video || !overlay) {
      return;
    }
    var loaded = false;
    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playlistUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(playlistUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              video.src = playlistUrl;
            }
          }
        });
        return;
      }
      video.src = playlistUrl;
    }
    function start() {
      load();
      wrapper.classList.add("is-playing");
      video.controls = true;
      var playback = video.play();
      if (playback && playback.catch) {
        playback.catch(function () {});
      }
    }
    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
  });
})();
