(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var panel = document.querySelector("[data-nav-panel]");
        var search = document.querySelector(".nav-search");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            if (search) {
                search.classList.toggle("is-open");
            }
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        restart();
    }

    function initFilters() {
        var input = document.querySelector("[data-filter-input]");
        var type = document.querySelector("[data-filter-type]");
        var cards = selectAll("[data-card-list] [data-movie-card]");
        if (!cards.length || (!input && !type)) {
            return;
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var typeValue = type ? type.value : "";
            cards.forEach(function (card) {
                var text = card.getAttribute("data-search-text") || "";
                var cardType = card.getAttribute("data-type") || "";
                var matchedText = !query || text.indexOf(query) !== -1;
                var matchedType = !typeValue || cardType.indexOf(typeValue) !== -1;
                card.classList.toggle("is-filter-hidden", !(matchedText && matchedType));
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        if (type) {
            type.addEventListener("change", apply);
        }
    }

    function movieCard(movie) {
        return [
            '<article class="movie-card">',
            '    <a href="' + movie.url + '" class="movie-card__cover" aria-label="观看' + escapeHtml(movie.title) + '">',
            '        <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="movie-card__play">▶</span>',
            '        <span class="movie-card__duration">' + escapeHtml(movie.duration) + '</span>',
            '    </a>',
            '    <div class="movie-card__body">',
            '        <a class="movie-card__title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
            '        <p class="movie-card__desc">' + escapeHtml(movie.description) + '</p>',
            '        <div class="movie-card__meta">',
            '            <span>' + escapeHtml(movie.year || "热播") + '</span>',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '            <span>' + escapeHtml(movie.genre) + '</span>',
            '        </div>',
            '    </div>',
            '</article>'
        ].join("\n");
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[character];
        });
    }

    function initSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var status = document.querySelector("[data-search-status]");
        var input = document.querySelector("[data-search-page-input]");
        if (!results || !window.MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        if (input) {
            input.value = query;
        }
        if (!query) {
            return;
        }
        var keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
        var matched = window.MOVIES.filter(function (movie) {
            var text = movie.searchText.toLowerCase();
            return keywords.every(function (keyword) {
                return text.indexOf(keyword) !== -1;
            });
        });
        if (status) {
            status.textContent = matched.length ? "搜索结果" : "没有找到相关影片";
        }
        results.innerHTML = matched.slice(0, 240).map(movieCard).join("\n");
    }

    document.addEventListener("DOMContentLoaded", function () {
        initNavigation();
        initHero();
        initFilters();
        initSearchPage();
    });
})();
