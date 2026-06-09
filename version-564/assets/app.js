(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function setupMobileNav() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 4800);
  }

  function setupSearchScopes() {
    document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var empty = scope.querySelector('[data-empty-state]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-card]'));
      var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-button]'));
      var activeFilter = 'all';
      function apply() {
        var term = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
          var searchText = (card.getAttribute('data-search-text') || '').toLowerCase();
          var type = card.getAttribute('data-type') || '';
          var region = card.getAttribute('data-region') || '';
          var matchText = !term || searchText.indexOf(term) !== -1;
          var matchFilter = activeFilter === 'all' || type.indexOf(activeFilter) !== -1 || region.indexOf(activeFilter) !== -1 || searchText.indexOf(activeFilter.toLowerCase()) !== -1;
          var show = matchText && matchFilter;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          buttons.forEach(function (item) {
            item.classList.remove('active');
          });
          button.classList.add('active');
          activeFilter = button.getAttribute('data-filter-value') || 'all';
          apply();
        });
      });
      apply();
    });
  }

  window.initMoviePlayer = function (videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !source) {
      return;
    }
    var attached = false;
    var hlsInstance = null;
    function attach() {
      if (attached) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      attached = true;
    }
    function start() {
      attach();
      overlay.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }
    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('ended', function () {
      overlay.classList.remove('is-hidden');
    });
  };

  ready(function () {
    setupMobileNav();
    setupHeroCarousel();
    setupSearchScopes();
  });
}());
