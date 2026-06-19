(function () {
    var body = document.body;
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
            body.classList.toggle('mobile-open', mobilePanel.classList.contains('is-open'));
        });
    }

    document.querySelectorAll('form[action="./search.html"]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (input) {
                input.value = input.value.trim();
            }
        });
    });

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function setupFilters() {
        var scope = document.querySelector('[data-filter-scope]');
        if (!scope) {
            return;
        }

        var search = scope.querySelector('[data-filter-search]');
        var region = scope.querySelector('[data-filter-region]');
        var type = scope.querySelector('[data-filter-type]');
        var year = scope.querySelector('[data-filter-year]');
        var clear = scope.querySelector('[data-filter-clear]');
        var count = scope.querySelector('[data-filter-count]');
        var empty = document.querySelector('[data-filter-empty]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-item]'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && search) {
            search.value = initialQuery;
        }

        function selected(select) {
            return select ? normalize(select.value) : '';
        }

        function apply() {
            var query = search ? normalize(search.value) : '';
            var selectedRegion = selected(region);
            var selectedType = selected(type);
            var selectedYear = selected(year);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchRegion = !selectedRegion || normalize(card.dataset.region) === selectedRegion;
                var matchType = !selectedType || normalize(card.dataset.type) === selectedType;
                var matchYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
                var matched = matchQuery && matchRegion && matchType && matchYear;

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '当前显示 ' + visible + ' 部影片';
            }

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [search, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (clear) {
            clear.addEventListener('click', function () {
                if (search) {
                    search.value = '';
                }
                if (region) {
                    region.value = '';
                }
                if (type) {
                    type.value = '';
                }
                if (year) {
                    year.value = '';
                }
                apply();
            });
        }

        apply();
    }

    function setupHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                show(position);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    function setupPlayer() {
        var player = document.querySelector('[data-player]');
        var video = document.getElementById('movie-player');
        var startButton = document.querySelector('[data-player-start]');

        if (!player || !video || !startButton) {
            return;
        }

        var source = video.getAttribute('data-src');
        var hlsInstance = null;
        var isLoaded = false;

        function attachSource() {
            if (isLoaded || !source) {
                return Promise.resolve();
            }

            isLoaded = true;
            player.classList.add('is-ready');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                return new Promise(function (resolve) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            resolve();
                        }
                    });
                    window.setTimeout(resolve, 1800);
                });
            }

            video.src = source;
            return Promise.resolve();
        }

        function playVideo() {
            attachSource().then(function () {
                var request = video.play();
                if (request && typeof request.catch === 'function') {
                    request.catch(function () {
                        player.classList.remove('is-playing');
                    });
                }
            });
        }

        startButton.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            playVideo();
        });

        player.addEventListener('click', function (event) {
            if (event.target === video || event.target === player || event.target.closest('.video-frame')) {
                if (video.paused) {
                    playVideo();
                }
            }
        });

        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                player.classList.remove('is-playing');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    setupFilters();
    setupHero();
    setupPlayer();
}());
