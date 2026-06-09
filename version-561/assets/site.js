
(function() {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;
  function setHeroSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function(slide, i) {
      slide.classList.toggle('is-active', i === activeSlide);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle('is-active', i === activeSlide);
    });
  }
  dots.forEach(function(dot, i) {
    dot.addEventListener('click', function() {
      setHeroSlide(i);
    });
  });
  if (slides.length > 1) {
    setInterval(function() {
      setHeroSlide(activeSlide + 1);
    }, 5600);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search-input'));
  var searchPanel = document.querySelector('.search-panel');
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }
  function renderSearch(value) {
    if (!searchPanel) {
      return;
    }
    var query = normalize(value);
    if (!query || !window.MOVIE_SEARCH_INDEX) {
      searchPanel.classList.remove('is-open');
      searchPanel.innerHTML = '';
      return;
    }
    var results = window.MOVIE_SEARCH_INDEX.filter(function(item) {
      return normalize(item.title + ' ' + item.year + ' ' + item.region + ' ' + item.type + ' ' + item.genre + ' ' + item.category).indexOf(query) !== -1;
    }).slice(0, 24);
    searchPanel.innerHTML = results.map(function(item) {
      return '<a class="search-result" href="' + item.url + '">' +
        '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">' +
        '<span><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</p><p>' + escapeHtml(item.oneLine || item.genre) + '</p></span>' +
        '</a>';
    }).join('') || '<div class="search-result"><span></span><span><h3>暂无匹配内容</h3><p>换一个关键词继续搜索</p></span></div>';
    searchPanel.classList.add('is-open');
  }
  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function(ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[ch];
    });
  }
  searchInputs.forEach(function(input) {
    input.addEventListener('input', function() {
      renderSearch(input.value);
    });
    input.addEventListener('focus', function() {
      renderSearch(input.value);
    });
  });
  document.addEventListener('click', function(event) {
    if (!searchPanel) {
      return;
    }
    var insideSearch = event.target.closest('.top-search') || event.target.closest('.search-panel');
    if (!insideSearch) {
      searchPanel.classList.remove('is-open');
    }
  });

  Array.prototype.slice.call(document.querySelectorAll('.card-filter-scope')).forEach(function(scope) {
    var toolbar = scope.previousElementSibling;
    if (!toolbar || !toolbar.classList.contains('list-toolbar')) {
      return;
    }
    var buttons = Array.prototype.slice.call(toolbar.querySelectorAll('.filter-button'));
    var search = toolbar.querySelector('.local-card-search');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-row'));
    var currentFilter = '全部';
    function applyFilter() {
      var term = normalize(search ? search.value : '');
      cards.forEach(function(card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));
        var filterPass = currentFilter === '全部' || text.indexOf(normalize(currentFilter)) !== -1;
        var searchPass = !term || text.indexOf(term) !== -1;
        card.classList.toggle('is-filter-hidden', !(filterPass && searchPass));
      });
    }
    buttons.forEach(function(button) {
      button.addEventListener('click', function() {
        buttons.forEach(function(item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        currentFilter = button.getAttribute('data-filter') || '全部';
        applyFilter();
      });
    });
    if (search) {
      search.addEventListener('input', applyFilter);
    }
  });
})();
