(function () {
    var headerButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (headerButton && mobilePanel) {
        headerButton.addEventListener('click', function () {
            var opened = mobilePanel.classList.toggle('is-open');
            headerButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    document.querySelectorAll('img').forEach(function (img) {
        img.addEventListener('error', function () {
            var frame = img.closest('.poster-frame');
            if (frame) {
                frame.classList.add('cover-fallback');
            }
            img.remove();
        });
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
                startTimer();
            });
        });

        hero.addEventListener('mouseenter', function () {
            clearInterval(timer);
        });

        hero.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    document.querySelectorAll('[data-filter-bar]').forEach(function (bar) {
        var scope = bar.closest('.section') || document;
        var input = bar.querySelector('[data-filter-input]');
        var regionSelect = bar.querySelector('[data-region-filter]');
        var typeSelect = bar.querySelector('[data-type-filter]');
        var yearSelect = bar.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var empty = scope.querySelector('[data-filter-empty]');
        var urlParams = new URLSearchParams(window.location.search);
        var query = urlParams.get('q') || '';

        function fillSelect(select, attr) {
            if (!select) {
                return;
            }
            var values = cards.map(function (card) {
                return card.getAttribute(attr) || '';
            }).filter(Boolean);
            values = Array.from(new Set(values)).sort(function (a, b) {
                return String(b).localeCompare(String(a), 'zh-Hans-CN');
            });
            values.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        function applyFilter() {
            var text = (input && input.value ? input.value : '').trim().toLowerCase();
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var search = (card.getAttribute('data-search') || '').toLowerCase();
                var ok = true;
                if (text && search.indexOf(text) === -1) {
                    ok = false;
                }
                if (region && card.getAttribute('data-region') !== region) {
                    ok = false;
                }
                if (type && card.getAttribute('data-type') !== type) {
                    ok = false;
                }
                if (year && card.getAttribute('data-year') !== year) {
                    ok = false;
                }
                card.classList.toggle('is-hidden', !ok);
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        fillSelect(regionSelect, 'data-region');
        fillSelect(typeSelect, 'data-type');
        fillSelect(yearSelect, 'data-year');

        if (query && input) {
            input.value = query;
        }

        [input, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    });

    function loadScript(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector('script[data-hls-loader]');
        if (existing) {
            existing.addEventListener('load', callback);
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
        script.async = true;
        script.setAttribute('data-hls-loader', '1');
        script.addEventListener('load', callback);
        document.head.appendChild(script);
    }

    function bindStream(video, stream, done, fail) {
        if (!video || !stream) {
            fail();
            return;
        }
        if (video.getAttribute('data-ready') === '1') {
            done();
            return;
        }
        var nativeType = 'application/vnd.apple.mpegurl';
        if (video.canPlayType(nativeType)) {
            video.src = stream;
            video.setAttribute('data-ready', '1');
            done();
            return;
        }
        loadScript(function () {
            if (window.Hls && window.Hls.isSupported()) {
                if (video._streamInstance) {
                    video._streamInstance.destroy();
                }
                var hls = new window.Hls({ enableWorker: true });
                video._streamInstance = hls;
                hls.loadSource(stream);
                hls.attachMedia(video);
                video.setAttribute('data-ready', '1');
                done();
            } else {
                fail();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var stream = video ? video.getAttribute('data-stream') : '';
        var start = player.querySelector('.player-start');
        var toggle = player.querySelector('[data-player-toggle]');
        var muted = player.querySelector('[data-player-muted]');
        var full = player.querySelector('[data-player-fullscreen]');
        var error = player.querySelector('[data-player-error]');

        function showError() {
            if (error) {
                error.textContent = '暂时无法播放，请稍后再试';
                error.classList.add('is-visible');
            }
        }

        function playVideo() {
            bindStream(video, stream, function () {
                var promise = video.play();
                player.classList.add('is-playing');
                if (promise && promise.catch) {
                    promise.catch(showError);
                }
            }, showError);
        }

        function pauseVideo() {
            if (video) {
                video.pause();
            }
        }

        if (start) {
            start.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                } else {
                    pauseVideo();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
                if (toggle) {
                    toggle.textContent = '暂停';
                }
            });
            video.addEventListener('pause', function () {
                if (toggle) {
                    toggle.textContent = '播放';
                }
            });
        }

        if (toggle) {
            toggle.addEventListener('click', function () {
                if (!video || video.paused) {
                    playVideo();
                } else {
                    pauseVideo();
                }
            });
        }

        if (muted) {
            muted.addEventListener('click', function () {
                if (!video) {
                    return;
                }
                video.muted = !video.muted;
                muted.textContent = video.muted ? '取消静音' : '静音';
            });
        }

        if (full) {
            full.addEventListener('click', function () {
                if (video && video.requestFullscreen) {
                    video.requestFullscreen();
                }
            });
        }
    });
})();
