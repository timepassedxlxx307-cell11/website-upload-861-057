(function () {
  var body = document.body;
  var navToggle = document.querySelector('[data-nav-toggle]');

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      body.classList.toggle('nav-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function activate(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
      });
    });

    window.setInterval(function () {
      if (slides.length > 1) {
        activate((current + 1) % slides.length);
      }
    }, 5200);
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var searchInput = scope.querySelector('[data-local-search]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var typeSelect = scope.querySelector('[data-filter-type]');
    var grid = scope.nextElementSibling;
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card, .horizontal-card, .rank-item')) : [];
    var empty = grid && grid.nextElementSibling ? grid.nextElementSibling : null;

    function applyFilter() {
      var query = normalize(searchInput ? searchInput.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].join(' '));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
        var show = matchQuery && matchYear && matchType;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [searchInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && searchInput) {
      searchInput.value = q;
      applyFilter();
    }
  });
})();
