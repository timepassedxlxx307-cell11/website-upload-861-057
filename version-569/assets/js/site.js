(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(text) {
        return String(text || "").toLowerCase().trim();
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobilePanel = document.querySelector("[data-mobile-panel]");
        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                mobilePanel.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            }

            function play() {
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5000);
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                play();
            }

            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    restart();
                });
            });
            show(0);
            play();
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-card]"));
            if (!input || !cards.length) {
                return;
            }
            input.addEventListener("input", function () {
                var keyword = normalize(input.value);
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search-card"));
                    card.classList.toggle("is-hidden", keyword && haystack.indexOf(keyword) === -1);
                });
            });
        });
    });
})();
