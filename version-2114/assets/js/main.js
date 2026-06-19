(function() {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      navMenu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var setSlide = function(index) {
      current = index;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        setSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        setSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  var normalize = function(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  };

  var applyFilters = function(listSelector) {
    var list = document.querySelector(listSelector);

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
    var searchInput = document.querySelector('[data-card-search="' + listSelector + '"]');
    var chipWrap = document.querySelector('[data-filter-buttons="' + listSelector + '"]');
    var activeYear = 'all';

    var refresh = function() {
      var term = normalize(searchInput ? searchInput.value : '');
      cards.forEach(function(card) {
        var text = normalize(card.getAttribute('data-search'));
        var year = card.getAttribute('data-year');
        var matchedText = !term || text.indexOf(term) !== -1;
        var matchedYear = activeYear === 'all' || String(year) === String(activeYear);
        card.classList.toggle('is-hidden', !(matchedText && matchedYear));
      });
    };

    if (searchInput) {
      var query = new URLSearchParams(window.location.search).get('q');
      if (query) {
        searchInput.value = query;
      }
      searchInput.addEventListener('input', refresh);
    }

    if (chipWrap) {
      chipWrap.addEventListener('click', function(event) {
        var button = event.target.closest('[data-year-filter]');
        if (!button) {
          return;
        }
        activeYear = button.getAttribute('data-year-filter') || 'all';
        Array.prototype.slice.call(chipWrap.querySelectorAll('[data-year-filter]')).forEach(function(item) {
          item.classList.toggle('active', item === button);
        });
        refresh();
      });
    }

    refresh();
  };

  Array.prototype.slice.call(document.querySelectorAll('[data-card-search]')).forEach(function(input) {
    var selector = input.getAttribute('data-card-search');
    applyFilters(selector);
  });
})();

window.setupMoviePlayer = function(source) {
  var video = document.getElementById('movieVideo');
  var button = document.getElementById('playButton');
  var started = false;
  var hls;

  if (!video || !button || !source) {
    return;
  }

  var start = function() {
    if (started) {
      var again = video.play();
      if (again && again.catch) {
        again.catch(function() {});
      }
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    button.classList.add('is-hidden');
    video.controls = true;

    var attempt = video.play();
    if (attempt && attempt.catch) {
      attempt.catch(function() {});
    }
  };

  button.addEventListener('click', start);
  video.addEventListener('click', function() {
    if (!started) {
      start();
    }
  });

  window.addEventListener('beforeunload', function() {
    if (hls) {
      hls.destroy();
    }
  });
};
