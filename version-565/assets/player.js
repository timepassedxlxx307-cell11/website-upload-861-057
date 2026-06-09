(function () {
  function start(sourceUrl) {
    var video = document.getElementById('movie-video');
    var layer = document.getElementById('play-layer');
    var button = document.getElementById('play-button');

    if (!video || !sourceUrl) {
      return;
    }

    function prepare() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }

      video.setAttribute('data-ready', '1');
    }

    function begin() {
      prepare();

      if (layer) {
        layer.classList.add('is-hidden');
      }

      var playResult = video.play();

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          video.controls = true;
        });
      }
    }

    if (layer) {
      layer.addEventListener('click', begin);
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        begin();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });
  }

  window.MoviePlayer = {
    start: start
  };
})();
