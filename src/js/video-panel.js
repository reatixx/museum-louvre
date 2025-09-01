function loadYouTubeAPI() {
  return new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

    let resolved = false;

    const checkYT = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(checkYT);
        resolved = true;
        resolve(window.YT);
      }
    }, 100);

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    if (typeof window.onYouTubeIframeAPIReady === 'function') {
      window.onYouTubeIframeAPIReady = null;
    }
    window.onYouTubeIframeAPIReady = () => {
      if (!resolved) {
        clearInterval(checkYT);
        resolved = true;
        resolve(window.YT);
      }
    };

    setTimeout(() => {
      if (!resolved) {
        clearInterval(checkYT);
        reject(new Error('YouTube API loading timed out'));
      }
    }, 30000);
  });
}

function setInitialValues() {
  const seekBar = document.querySelector('.video__seek-bar');
  const volumeBar = document.querySelector('.video__volume-bar');
  const width = window.innerWidth;

  if (seekBar) {
    if (width <= 480) seekBar.value = 40;
    else if (width <= 768) seekBar.value = 31;
    else if (width <= 1024) seekBar.value = 40;
    else seekBar.value = 54;
    updateSeekBarBackground(seekBar);
  }

  if (volumeBar) {
    if (width <= 480) volumeBar.value = 40;
    else if (width <= 768) volumeBar.value = 40;
    else if (width <= 1024) volumeBar.value = 40;
    else volumeBar.value = 45;
    updateSeekBarBackground(volumeBar);
  }
}

function updateSeekBarBackground(el) {
  if (!el) return;
  const val = el.value;
  el.style.background = `linear-gradient(to right, #710707 ${val}%, #c4c4c4 ${val}%)`;
}

window.addEventListener('load', setInitialValues);
window.addEventListener('resize', setInitialValues);

const seekBar = document.querySelector('.video__seek-bar');
const volumeBar = document.querySelector('.video__volume-bar');
if (seekBar) seekBar.addEventListener('input', () => updateSeekBarBackground(seekBar));
if (volumeBar) volumeBar.addEventListener('input', () => updateSeekBarBackground(volumeBar));

export class VideoPanel {
  constructor(sectionId = 'video') {
    this.videoSection = document.getElementById(sectionId);
    this.playButtonPanel = this.videoSection.querySelector('.video__control-button--play');
    this.bigPlayButton = this.videoSection.querySelector('.video__play-button');
    this.seekBar = this.videoSection.querySelector('.video__seek-bar');
    this.volumeButton = this.videoSection.querySelector('.video__control-button--volume');
    this.volumeBar = this.videoSection.querySelector('.video__volume-bar');
    this.fullscreenButton = this.videoSection.querySelector('.video__control-button--fullscreen');
    this.videoMain = this.videoSection.querySelector('.video__main');
    this.mainWrapper = this.videoSection.querySelector('.video__main-wrapper');
    this.mainPanel = this.videoSection.querySelector('.video__main-panel');
    this.cover = this.videoSection.querySelector('.video__cover');

    this.isPlaying = false;
    this.isMuted = false;
    this.playbackRateTimeout = null;
    this.isInitialSeekSet = true;
  }

  async init() {
    try {
      const YT = await loadYouTubeAPI();
      const iframe = this.videoSection.querySelector('.video__main iframe');

      this.player = new YT.Player(iframe, {
        playerVars: {
          origin: window.location.origin,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          fs: 0,
          disablekb: 1,
          playsinline: 1,
          showinfo: 0,
          autohide: 1,
        },
        events: {
          onReady: this.onPlayerReady.bind(this),
          onStateChange: this.onPlayerStateChange.bind(this),
        }
      });
    } catch (err) {
      console.error('Не удалось инициализировать YouTube Player:', err);
    }
  }

  onPlayerReady() {
    setInitialValues();
    const width = window.innerWidth;
    let initialVolume = width <= 1024 ? 40 : 45;
    this.player.setVolume(initialVolume);
    this.updateVolumeBar();
    updateSeekBarBackground(this.seekBar);

    this.setupEventListeners();
    requestAnimationFrame(this.updateProgressLoop.bind(this));
  }

  onPlayerStateChange(event) {
    const YT = window.YT;
    if (event.data === YT.PlayerState.ENDED) {
      this.pauseVideoUI();
      this.player.seekTo(0, true);
      this.showCover();
      this.showBigPlayButton();
      this.isInitialSeekSet = true;
    }
    if (event.data === YT.PlayerState.PLAYING) {
      this.isPlaying = true;
      this.isInitialSeekSet = false;
      this.updatePlayButton(true);
      this.hideBigPlayButton();
      this.hideCover();
      if (this.seekBar.value > 0 && this.player.getCurrentTime() === 0) {
        const duration = this.player.getDuration();
        const newTime = (this.seekBar.value / 100) * duration;
        this.player.seekTo(newTime, true);
      }
    }
    if (event.data === YT.PlayerState.PAUSED) {
      this.isPlaying = false;
      this.updatePlayButton(false);
      this.showBigPlayButton();
    }
  }

  playVideoUI() {
    this.player.playVideo();
    this.isPlaying = true;
    this.isInitialSeekSet = false;
    this.updatePlayButton(true);
    this.hideBigPlayButton();
    this.hideCover();
  }

  pauseVideoUI() {
    this.player.pauseVideo();
    this.isPlaying = false;
    this.updatePlayButton(false);
    this.showBigPlayButton();
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pauseVideoUI();
    } else {
      this.playVideoUI();
    }
  }

  updatePlayButton(playing) {
    const use = this.playButtonPanel.querySelector('use');
    if (playing) {
      use.setAttribute('href', './assets/img/icon/sprite.svg#pause');
      use.setAttribute('xlink:href', './assets/img/icon/sprite.svg#pause');
      this.playButtonPanel.setAttribute('aria-label', 'Pause video');
    } else {
      use.setAttribute('href', './assets/img/icon/sprite.svg#play-panel');
      use.setAttribute('xlink:href', './assets/img/icon/sprite.svg#play-panel');
      this.playButtonPanel.setAttribute('aria-label', 'Play video');
    }
  }

  updateFullscreenButton(isFullscreen) {
    const use = this.fullscreenButton.querySelector('use');
    if (isFullscreen) {
      use.setAttribute('href', './assets/img/icon/sprite.svg#fullscreen_exit');
      use.setAttribute('xlink:href', './assets/img/icon/sprite.svg#fullscreen_exit');
      this.fullscreenButton.setAttribute('aria-label', 'Exit fullscreen');
    } else {
      use.setAttribute('href', './assets/img/icon/sprite.svg#fullscreen');
      use.setAttribute('xlink:href', './assets/img/icon/sprite.svg#fullscreen');
      this.fullscreenButton.setAttribute('aria-label', 'Enter fullscreen');
    }
  }

  hideBigPlayButton() {
    if (this.bigPlayButton) this.bigPlayButton.style.display = 'none';
  }

  showBigPlayButton() {
    if (this.bigPlayButton) this.bigPlayButton.style.display = 'block';
  }

  hideCover() {
    if (this.cover) {
      this.cover.style.display = 'none';
    }
  }

  showCover() {
    if (this.cover) {
      this.cover.style.display = 'block';
    }
  }

  updateSeekBar() {
    if (!this.player || this.player.getDuration() === 0 || this.isInitialSeekSet) {
      updateSeekBarBackground(this.seekBar);
      return;
    }
    const current = this.player.getCurrentTime();
    const duration = this.player.getDuration();
    this.seekBar.value = (current / duration) * 100;
    updateSeekBarBackground(this.seekBar);
  }

  updateProgressLoop() {
    this.updateSeekBar();
    requestAnimationFrame(this.updateProgressLoop.bind(this));
  }

  updateVolumeIcon() {
    const use = this.volumeButton.querySelector('use');
    if (this.isMuted || this.volumeBar.value == 0) {
      use.setAttribute('href', './assets/img/icon/sprite.svg#mute');
      use.setAttribute('xlink:href', './assets/img/icon/sprite.svg#mute');
    } else {
      use.setAttribute('href', './assets/img/icon/sprite.svg#sound');
      use.setAttribute('xlink:href', './assets/img/icon/sprite.svg#sound');
    }
    this.volumeButton.setAttribute('aria-label', this.isMuted ? 'Unmute video' : 'Mute video');
  }

  updateVolumeBar() {
    if (!this.player) {
      setInitialValues();
      return;
    }
    const vol = this.player.getVolume();
    this.volumeBar.value = vol;
    this.isMuted = this.player.isMuted();
    this.updateVolumeIcon();
    updateSeekBarBackground(this.volumeBar);
  }

  changePlaybackRate(delta) {
    if (!this.player) return;
    let rate = this.player.getPlaybackRate() + delta;
    if (rate < 0.25) rate = 0.25;
    if (rate > 2) rate = 2;
    this.player.setPlaybackRate(rate);
    this.showPlaybackRate(rate);
  }

  showPlaybackRate(rate) {
    let div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '50%';
    div.style.left = '50%';
    div.style.transform = 'translate(-50%, -50%)';
    div.style.padding = '10px 20px';
    div.style.background = 'rgba(0,0,0,0.7)';
    div.style.color = 'white';
    div.style.fontSize = '24px';
    div.style.borderRadius = '10px';
    div.style.zIndex = '1000';
    div.textContent = `${rate}x`;
    this.videoMain.appendChild(div);

    clearTimeout(this.playbackRateTimeout);
    this.playbackRateTimeout = setTimeout(() => {
      div.remove();
    }, 1500);
  }

  setupEventListeners() {
    this.playButtonPanel.addEventListener('click', () => this.togglePlayPause());
    if (this.bigPlayButton) {
      this.bigPlayButton.addEventListener('click', () => this.togglePlayPause());
    }
    this.videoMain.addEventListener('click', (e) => {
      if (e.target.closest('.video__control-button--play, .video__play-button, .video__seek-bar, .video__volume-bar, .video__control-button--volume, .video__control-button--fullscreen')) {
        return;
      }
      this.togglePlayPause();
    });

    this.seekBar.addEventListener('input', () => {
      if (!this.player) return;
      this.isInitialSeekSet = false;
      const duration = this.player.getDuration();
      const newTime = (this.seekBar.value / 100) * duration;
      this.player.seekTo(newTime, true);
      updateSeekBarBackground(this.seekBar);
      if (this.seekBar.value >= 100) {
        this.pauseVideoUI();
      }
    });

    this.volumeButton.addEventListener('click', () => {
      if (!this.player) return;
      if (this.isMuted) {
        this.player.unMute();
        this.isMuted = false;
      } else {
        this.player.mute();
        this.isMuted = true;
      }
      this.updateVolumeIcon();
    });

    this.volumeBar.addEventListener('input', () => {
      if (!this.player) return;
      const vol = this.volumeBar.value;
      this.player.setVolume(vol);
      if (vol == 0) {
        this.isMuted = true;
        this.player.mute();
      } else {
        this.isMuted = false;
        this.player.unMute();
      }
      this.updateVolumeIcon();
      updateSeekBarBackground(this.volumeBar);
    });

    this.fullscreenButton.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        if (this.mainWrapper.requestFullscreen) {
          this.mainWrapper.requestFullscreen();
        }
      } else {
        document.exitFullscreen();
      }
    });

    document.addEventListener('fullscreenchange', () => {
      const isFullscreen = !!document.fullscreenElement;
      this.updateFullscreenButton(isFullscreen);

      if (isFullscreen) {
        this.mainPanel.style.display = 'flex';
        this.mainPanel.style.visibility = 'visible';
        this.mainPanel.style.position = 'absolute';
        this.mainPanel.style.bottom = '0';
        this.mainPanel.style.zIndex = '100';
        const iframe = this.videoMain.querySelector('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.maxWidth = 'none';
        iframe.style.maxHeight = 'none';
      } else {
        this.mainPanel.style.display = '';
        this.mainPanel.style.visibility = '';
        this.mainPanel.style.position = '';
        this.mainPanel.style.bottom = '';
        this.mainPanel.style.zIndex = '';
        const iframe = this.videoMain.querySelector('iframe');
        iframe.style.width = '';
        iframe.style.height = '';
        iframe.style.maxWidth = '';
        iframe.style.maxHeight = '';
      }
    });

    document.addEventListener('keydown', (e) => {
      const code = e.code.toLowerCase();
      const key = e.key.toLowerCase();

      if (['space', 'spacebar'].includes(code)) {
        e.preventDefault();
        this.togglePlayPause();
      } else if (key === 'm' || key === 'ь') {
        e.preventDefault();
        this.volumeButton.click();
      } else if (key === 'f') {
        e.preventDefault();
        this.fullscreenButton.click();
      } else if (e.shiftKey && (key === ',' || key === 'б')) {
        e.preventDefault();
        this.changePlaybackRate(-0.25);
      } else if (e.shiftKey && (key === '.' || key === 'ю')) {
        e.preventDefault();
        this.changePlaybackRate(0.25);
      }
    });
  }
}

window.addEventListener('load', () => {
  const videoPanel = new VideoPanel('video');
  videoPanel.init();
});