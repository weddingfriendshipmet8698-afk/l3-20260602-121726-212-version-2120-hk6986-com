(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    var active = 0;
    function showSlide(index) {
      if (!slides.length) return;
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, n) {
        slide.classList.toggle("active", n === active);
      });
      dots.forEach(function (dot, n) {
        dot.classList.toggle("active", n === active);
      });
    }
    dots.forEach(function (dot, n) {
      dot.addEventListener("click", function () {
        showSlide(n);
      });
    });
    if (slides.length) {
      showSlide(0);
      setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    var panel = document.querySelector(".filter-panel");
    if (panel) {
      var input = panel.querySelector("input");
      var year = panel.querySelector("select[name='year']");
      var region = panel.querySelector("select[name='region']");
      var type = panel.querySelector("select[name='type']");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
      function applyFilter() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var r = region ? region.value : "";
        var t = type ? type.value : "";
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type")
          ].join(" ").toLowerCase();
          var visible = true;
          if (q && text.indexOf(q) === -1) visible = false;
          if (y && card.getAttribute("data-year") !== y) visible = false;
          if (r && card.getAttribute("data-region") !== r) visible = false;
          if (t && card.getAttribute("data-type") !== t) visible = false;
          card.classList.toggle("hidden-card", !visible);
        });
      }
      [input, year, region, type].forEach(function (el) {
        if (el) el.addEventListener("input", applyFilter);
        if (el) el.addEventListener("change", applyFilter);
      });
    }
  });
})();
