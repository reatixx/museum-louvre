document.addEventListener('DOMContentLoaded', () => {
  if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  const grid = document.querySelector('.video__iframes');
  const slides = Array.from(grid.children);
  const prevBtn = document.querySelector('.video__arrow--prev');
  const nextBtn = document.querySelector('.video__arrow--next');
  const dotsContainer = document.querySelector('.video__dots');
  const players = {};

  function getPerPage() {
    return window.innerWidth >= 1024 ? 3 : 2;
  }

  let perPage = getPerPage();
  let page = 0;
  let totalPages = slides.length - perPage + 1;

  function initPlayers() {
    document.querySelectorAll('.video__thumbnail iframe').forEach((iframe) => {
      const playerId = iframe.id;
      iframe.style.display = 'block';
      players[playerId] = new YT.Player(playerId, {
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    });
  }

  function onPlayerReady(event) {}

  function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      const thumbnail = event.target.getIframe().closest('.video__thumbnail');
      thumbnail.querySelector('.video__youtube-button').style.display = 'none';
      thumbnail.querySelector('.video__cover').style.opacity = '0';
      thumbnail.querySelector('.video__panel-wrapper').style.opacity = '0';
    }
  }

  if (typeof YT !== 'undefined' && YT.loaded) {
    initPlayers();
  } else {
    window.onYouTubeIframeAPIReady = initPlayers;
  }

  function showPage() {
    perPage = getPerPage();
    totalPages = slides.length - perPage + 1;
    if (page > totalPages - 1) page = totalPages - 1;
    if (page < 0) page = 0;
    slides.forEach((slide, i) => {
      slide.style.display = (i >= page && i < page + perPage) ? 'block' : 'none';
    });
    updateDots();
  }

  function updateDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('span');
      dot.className = 'video__dot' + (i === page ? ' video__dot--active' : '');
      dot.addEventListener('click', () => {
        page = i;
        showPage();
        stopAllVideos();
      });
      dotsContainer.appendChild(dot);
    }
  }

  prevBtn?.addEventListener('click', () => {
    page = (page - 1 + totalPages) % totalPages;
    showPage();
    stopAllVideos();
  });

  nextBtn?.addEventListener('click', () => {
    page = (page + 1) % totalPages;
    showPage();
    stopAllVideos();
  });

  function stopAllVideos() {
    Object.values(players).forEach(player => {
      try {
        player.stopVideo();
      } catch (e) {
        console.error('Error stopping video:', e);
      }
    });

    document.querySelectorAll('.video__youtube-button').forEach(btn => {
      btn.style.display = '';
    });
    document.querySelectorAll('.video__cover').forEach(cover => {
      cover.style.opacity = '1';
      cover.style.display = 'block';
    });
    document.querySelectorAll('.video__panel-wrapper').forEach(panel => {
      panel.style.opacity = '1';
      panel.style.display = 'flex';
    });
  }

  document.querySelectorAll('.video__youtube-button').forEach(btn => {
    btn.addEventListener('click', function () {
      const thumbnail = this.closest('.video__thumbnail');
      const iframe = thumbnail.querySelector('iframe');
      const playerId = iframe.id;

      stopAllVideos();

      if (players[playerId]) {
        players[playerId].playVideo();
      } else {
        iframe.src = iframe.src.includes('autoplay=0')
          ? iframe.src.replace('autoplay=0', 'autoplay=1')
          : iframe.src + '&autoplay=1';
      }
    });
  });

  window.addEventListener('resize', () => {
    showPage();
  });

  showPage();
});