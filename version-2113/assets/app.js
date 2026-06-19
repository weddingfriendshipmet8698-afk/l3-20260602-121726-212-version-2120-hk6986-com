(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var movieSearch = document.querySelector('.movie-search');
  var typeFilter = document.querySelector('.type-filter');
  var yearFilter = document.querySelector('.year-filter');
  var categoryFilter = document.querySelector('.category-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var noResults = document.querySelector('.no-results');

  function yearMatches(year, selected) {
    var value = Number(year);

    if (!selected) {
      return true;
    }

    if (selected.indexOf('-') > -1) {
      var parts = selected.split('-').map(Number);
      return value >= parts[0] && value <= parts[1];
    }

    return String(value) === selected;
  }

  function filterCards() {
    var query = movieSearch ? movieSearch.value.trim().toLowerCase() : '';
    var type = typeFilter ? typeFilter.value : '';
    var year = yearFilter ? yearFilter.value : '';
    var category = categoryFilter ? categoryFilter.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var title = card.getAttribute('data-title') || '';
      var cardType = card.getAttribute('data-type') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var cardCategory = card.getAttribute('data-category') || '';
      var ok = true;

      if (query && title.indexOf(query) === -1) {
        ok = false;
      }

      if (type && cardType !== type) {
        ok = false;
      }

      if (!yearMatches(cardYear, year)) {
        ok = false;
      }

      if (category && cardCategory !== category) {
        ok = false;
      }

      card.style.display = ok ? '' : 'none';

      if (ok) {
        visible += 1;
      }
    });

    if (noResults) {
      noResults.style.display = visible ? 'none' : 'block';
    }
  }

  [movieSearch, typeFilter, yearFilter, categoryFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    }
  });

  if (movieSearch) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q) {
      movieSearch.value = q;
    }
  }

  if (cards.length) {
    filterCards();
  }
})();
