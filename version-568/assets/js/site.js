(function () {
  function closest(element, selector) {
    while (element && element !== document) {
      if (element.matches(selector)) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  }

  function setupMobileNavigation() {
    var button = document.querySelector('.nav-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function setupSearchForms() {
    document.querySelectorAll('.search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || input.value.trim() !== '') {
          return;
        }
        event.preventDefault();
        window.location.href = form.getAttribute('action') || 'search.html';
      });
    });
  }

  function setupImageFallbacks() {
    document.querySelectorAll('.poster-frame img, .hero-media img').forEach(function (image) {
      image.addEventListener('error', function () {
        var frame = closest(image, '.poster-frame') || closest(image, '.hero-media');
        if (frame) {
          frame.classList.add('image-missing');
        }
      });
      if (image.complete && image.naturalWidth === 0) {
        var frame = closest(image, '.poster-frame') || closest(image, '.hero-media');
        if (frame) {
          frame.classList.add('image-missing');
        }
      }
    });
  }

  function setupCarousel() {
    var carousel = document.querySelector('[data-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-dot]'));
    var prev = carousel.querySelector('[data-carousel-prev]');
    var next = carousel.querySelector('[data-carousel-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-carousel-dot')) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.video-start');
      var message = shell.querySelector('[data-player-message]');
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute('data-video-url');
      var hls = null;
      var loaded = false;

      function setMessage(text) {
        if (message) {
          message.textContent = text;
        }
      }

      function loadSource() {
        if (loaded || !source) {
          return;
        }
        loaded = true;
        setMessage('正在加载高清内容...');
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            shell.classList.add('is-ready');
            setMessage('');
          });
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setMessage('视频加载失败，请稍后重试');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          shell.classList.add('is-ready');
          setMessage('');
        } else {
          setMessage('当前浏览器暂不支持播放，请更换浏览器再试');
        }
      }

      button.addEventListener('click', function () {
        loadSource();
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {
            setMessage('请再次点击播放');
          });
        }
      });

      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });

      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="poster-frame" href="' + escapeHtml(movie.detail_path) + '" data-title="' + escapeHtml(movie.title) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
      '<span class="poster-play">播放</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-meta-line"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.rating) + ' 分</span></div>',
      '<h3><a href="' + escapeHtml(movie.detail_path) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.one_line) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function setupSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var title = page.querySelector('[data-search-title]');
    var results = page.querySelector('[data-search-results]');
    var input = document.querySelector('.page-search input[name="q"]');
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var lowerQuery = query.toLowerCase();
    var matched = window.SEARCH_MOVIES.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.one_line,
        movie.summary,
        movie.region,
        movie.genre,
        movie.category,
        String(movie.year),
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();
      return haystack.indexOf(lowerQuery) !== -1;
    });
    if (title) {
      title.textContent = '“' + query + '”的搜索结果（' + matched.length + '）';
    }
    if (results) {
      if (!matched.length) {
        results.innerHTML = '<div class="category-overview-card"><h2>未找到相关影片</h2><p>可以尝试更短的片名、类型、地区或年份。</p></div>';
      } else {
        results.innerHTML = matched.slice(0, 120).map(movieCard).join('');
        setupImageFallbacks();
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNavigation();
    setupSearchForms();
    setupImageFallbacks();
    setupCarousel();
    setupPlayers();
    setupSearchPage();
  });
})();
