(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var button = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(nextIndex) {
            index = nextIndex;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var nextIndex = Number(dot.getAttribute("data-hero-dot"));
                show(nextIndex);
            });
        });
        window.setInterval(function () {
            show((index + 1) % slides.length);
        }, 5200);
    }

    function setupSearch() {
        var input = document.querySelector("[data-search-input]");
        var clear = document.querySelector("[data-search-clear]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
        var empty = document.querySelector("[data-no-result]");
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var preset = params.get("q") || "";
        if (preset) {
            input.value = preset;
        }
        function filter() {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var matched = !keyword || text.indexOf(keyword) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }
        input.addEventListener("input", filter);
        if (clear) {
            clear.addEventListener("click", function () {
                input.value = "";
                filter();
                input.focus();
            });
        }
        filter();
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupSearch();
    });

    window.initializeMoviePlayer = function (streamUrl, posterUrl) {
        var video = document.querySelector(".js-player");
        var cover = document.querySelector("[data-player-cover]");
        if (!video || !streamUrl) {
            return;
        }
        if (posterUrl) {
            video.setAttribute("poster", posterUrl);
        }
        var bound = false;
        function bind() {
            if (bound) {
                return;
            }
            bound = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function play() {
            bind();
            if (cover) {
                cover.classList.add("hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("hidden");
            }
        });
    };
})();
