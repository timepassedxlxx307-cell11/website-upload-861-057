(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    document.querySelectorAll('img[data-cover]').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-missing');
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length > 1) {
      var current = 0;
      var showSlide = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          showSlide(i);
        });
      });
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
      showSlide(0);
    }

    document.querySelectorAll('[data-player]').forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('[data-play-button]');
      if (!video || !button) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var loaded = false;
      var hlsInstance = null;
      var loadVideo = function () {
        if (loaded || !stream) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      };
      var startVideo = function () {
        loadVideo();
        box.classList.add('is-playing');
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {});
        }
      };
      button.addEventListener('click', startVideo);
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        } else {
          video.pause();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });

    var searchInput = document.querySelector('[data-search-input]');
    var typeSelect = document.querySelector('[data-search-type]');
    var results = document.querySelector('[data-search-results]');
    if (searchInput && results && typeof SITE_CATALOG !== 'undefined') {
      var render = function () {
        var keyword = searchInput.value.trim().toLowerCase();
        var selectedType = typeSelect ? typeSelect.value : '';
        var list = SITE_CATALOG.filter(function (movie) {
          var text = [movie.t, movie.r, movie.y, movie.g, movie.k].join(' ').toLowerCase();
          var matchText = !keyword || text.indexOf(keyword) !== -1;
          var matchType = !selectedType || movie.p === selectedType;
          return matchText && matchType;
        }).slice(0, 80);
        if (!list.length) {
          results.innerHTML = '<div class="content-block"><p>暂无匹配影片，可尝试更换关键词或分类。</p></div>';
          return;
        }
        results.innerHTML = list.map(function (movie) {
          return '<article class="rank-item">' +
            '<span class="rank-num">' + movie.i + '</span>' +
            '<div><h3><a href="movie/movie-' + movie.i + '.html">' + movie.t + '</a></h3>' +
            '<p>' + movie.y + ' · ' + movie.r + ' · ' + movie.g + '</p></div>' +
            '<a class="primary-btn" href="movie/movie-' + movie.i + '.html">立即观看</a>' +
            '</article>';
        }).join('');
      };
      searchInput.addEventListener('input', render);
      if (typeSelect) {
        typeSelect.addEventListener('change', render);
      }
      render();
    }
  });
})();
