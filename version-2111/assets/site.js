(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var next = slider.querySelector("[data-hero-next]");
        var prev = slider.querySelector("[data-hero-prev]");
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
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

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var region = scope.querySelector("[data-filter-region]");
            var type = scope.querySelector("[data-filter-type]");
            var category = scope.querySelector("[data-filter-category]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

            function valueOf(element, fallback) {
                return element ? element.value : fallback;
            }

            function filterCards() {
                var query = valueOf(input, "").trim().toLowerCase();
                var regionValue = valueOf(region, "all");
                var typeValue = valueOf(type, "all");
                var categoryValue = valueOf(category, "all");

                cards.forEach(function (card) {
                    var title = (card.getAttribute("data-title") || "").toLowerCase();
                    var desc = (card.getAttribute("data-desc") || "").toLowerCase();
                    var matchQuery = !query || title.indexOf(query) !== -1 || desc.indexOf(query) !== -1;
                    var matchRegion = regionValue === "all" || card.getAttribute("data-region") === regionValue;
                    var matchType = typeValue === "all" || card.getAttribute("data-type") === typeValue;
                    var matchCategory = categoryValue === "all" || card.getAttribute("data-category") === categoryValue;
                    card.classList.toggle("hidden-card", !(matchQuery && matchRegion && matchType && matchCategory));
                });
            }

            [input, region, type, category].forEach(function (element) {
                if (!element) {
                    return;
                }
                element.addEventListener("input", filterCards);
                element.addEventListener("change", filterCards);
            });
        });
    }

    function initMoviePlayer(playerId, mediaUrl) {
        var player = document.getElementById(playerId);
        if (!player || !mediaUrl) {
            return;
        }
        var video = player.querySelector("video");
        var overlay = player.querySelector("[data-play-button]");
        var hlsInstance = null;
        var attached = false;

        function attach() {
            if (attached || !video) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = mediaUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(mediaUrl);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = mediaUrl;
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playRequest = video.play();
            if (playRequest && typeof playRequest.catch === "function") {
                playRequest.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
