(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-main-nav]');

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('scrolled', window.scrollY > 18);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  function textValue(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-genre') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-region') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));
  searchInputs.forEach(function (input) {
    var scope = document.querySelector('[data-card-scope]');
    var empty = document.querySelector('[data-empty-state]');
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('[data-title]')) : [];

    function applySearch(value) {
      var words = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = textValue(card);
        var ok = words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      input.value = initial;
      applySearch(initial);
    }

    input.addEventListener('input', function () {
      applySearch(input.value);
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play]');
    if (!video || !button) {
      return;
    }
    var src = video.getAttribute('data-src');
    var ready = false;

    function mount() {
      if (ready || !src) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      ready = true;
    }

    button.addEventListener('click', function () {
      mount();
      box.classList.add('is-playing');
      var playing = video.play();
      if (playing && typeof playing.catch === 'function') {
        playing.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    });

    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      box.classList.remove('is-playing');
    });
  });
})();
