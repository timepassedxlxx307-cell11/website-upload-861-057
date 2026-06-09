(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (video) {
            var url = video.getAttribute("data-hls") || "";
            var box = video.closest(".player-box");
            var button = box ? box.querySelector("[data-play-button]") : null;
            var prepared = false;
            var hls = null;

            function prepare() {
                if (prepared || !url) {
                    return;
                }
                prepared = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else {
                    video.src = url;
                }
            }

            function begin() {
                prepare();
                if (button) {
                    button.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        if (button) {
                            button.classList.remove("is-hidden");
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener("click", begin);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    begin();
                }
            });
            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
            });
            video.addEventListener("pause", function () {
                if (button && video.currentTime === 0) {
                    button.classList.remove("is-hidden");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    });
})();
