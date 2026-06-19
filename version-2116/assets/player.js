function startMoviePlayer(source) {
  function boot() {
    var video = document.querySelector(".movie-video");
    var cover = document.querySelector(".player-cover");
    var button = document.querySelector(".player-start");
    var started = false;
    function loadAndPlay() {
      if (!video || started) return;
      started = true;
      if (cover) cover.classList.add("is-hidden");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }
      video.src = source;
      video.play().catch(function () {});
    }
    if (button) button.addEventListener("click", loadAndPlay);
    if (cover) cover.addEventListener("click", loadAndPlay);
    if (video) video.addEventListener("click", function () {
      if (!started) loadAndPlay();
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
}
