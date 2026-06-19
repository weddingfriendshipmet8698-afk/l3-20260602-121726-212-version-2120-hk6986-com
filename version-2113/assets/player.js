(function () {
  var frame = document.querySelector('[data-player-frame]');

  if (!frame) {
    return;
  }

  var video = frame.querySelector('video');
  var cover = frame.querySelector('[data-player-cover]');
  var playButton = frame.querySelector('[data-play-button]');
  var source = video ? video.getAttribute('data-src') : '';
  var hlsInstance = null;
  var isLoaded = false;

  function loadSource() {
    if (!video || !source || isLoaded) {
      return;
    }

    isLoaded = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }
  }

  function playVideo() {
    loadSource();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }

  if (playButton) {
    playButton.addEventListener('click', playVideo);
  }

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
