let staticNoise = document.querySelector(".static-noise");
let smpte = document.querySelector(".smpte");
let channelName = document.querySelector(".channel-name");
let muteIcon = document.querySelector(".muteIcon");
let videoId = document.querySelector(".video-id");
let control = document.querySelector(".control");
let powerScreen = document.querySelector(".power-screen");
let info = document.querySelector(".info");

class Togger {
  constructor() {
    this.videoList = ["B_yKuCll8u4", "1aZb81NZJbk", "HybD8aCKIMw"];
    this.currentVideoIndex = 0;
    this.isPoweredOn = true;
    this.bindKeyboardControls();
  }

  setPlayer(player) {
    this.player = player;
  }

  bindToResize() {
    window.addEventListener("resize", () => this.resizePlayer(), true);
  }

  bindKeyboardControls() {
    document.addEventListener("keydown", (event) => {
      if (!this.player || !this.isPoweredOn) return;

      switch (event.key.toLowerCase()) {
        case "arrowleft":
          this.previousChannel();
          break;
        case "arrowright":
          this.nextChannel();
          break;
        case "arrowup":
          this.increaseVolume();
          break;
        case "arrowdown":
          this.decreaseVolume();
          break;
        case "m":
          this.toggleMute();
          break;
        case "p":
          this.togglePower();
          break;
      }
    });
  }

  nextChannel() {
    this.currentVideoIndex =
      (this.currentVideoIndex + 1) % this.videoList.length;
    this.playStream();
  }

  previousChannel() {
    this.currentVideoIndex =
      (this.currentVideoIndex - 1 + this.videoList.length) %
      this.videoList.length;
    this.playStream();
  }

  increaseVolume() {
    const currentVolume = this.player.getVolume();
    this.player.setVolume(Math.min(100, currentVolume + 10));
    this.showVolumeIndicator();
  }

  decreaseVolume() {
    const currentVolume = this.player.getVolume();
    this.player.setVolume(Math.max(0, currentVolume - 10));
    this.showVolumeIndicator();
  }

  showVolumeIndicator() {
    const volume = this.player.getVolume();
    if (info) {
      info.textContent = `Volume: ${volume}%`;
      info.style.opacity = 1;
      setTimeout(() => {
        info.style.opacity = 0;
      }, 1500);
    }
  }

  toggleMute() {
    if (this.player.isMuted()) {
      this.player.unMute();
      if (muteIcon) muteIcon.style.display = "none";
    } else {
      this.player.mute();
      if (muteIcon) muteIcon.style.display = "block";
    }
  }

  togglePower() {
    this.isPoweredOn = !this.isPoweredOn;
    if (this.isPoweredOn) {
      this.powerOn();
    } else {
      this.powerOff();
    }
  }

  playStream() {
    if (!this.isPoweredOn) return;

    const { player } = this;
    const currentVideo = this.videoList[this.currentVideoIndex];
    player.loadVideoById(currentVideo);
    player.setVolume(100);
    player.setPlaybackRate(1);
  }

  resizePlayer() {
    let p = document.querySelector("#player");
    p.style.top = -window.innerHeight * 0.5 + "px";
    p.style.left =
      (window.innerWidth -
        Math.min(window.innerHeight * 1.777, window.innerWidth)) /
        2 +
      "px";
    this.player.setSize(
      Math.min(window.innerHeight * 1.777, window.innerWidth),
      window.innerHeight * 2,
    );
  }

  powerOn() {
    if (powerScreen) powerScreen.style.display = "none";
    this.playStream();
  }

  powerOff() {
    if (powerScreen) powerScreen.style.display = "block";
    this.player.stopVideo();
    staticNoise.style.opacity = 1;
  }

  onPlayerStateChange(event) {
    if (!this.isPoweredOn) return;

    staticNoise.style.opacity = 1;
    if (event.data == YT.PlayerState.UNSTARTED) {
      videoId.textContent = "UNSTARTED";
    } else if (event.data == YT.PlayerState.ENDED) {
      videoId.textContent = "ENDED";
      this.nextChannel(); // Auto-play next video when current one ends
    } else if (event.data == YT.PlayerState.PLAYING) {
      staticNoise.style.opacity = 0;
      videoId.textContent = this.player.getVideoData().video_id;

      const videoData = this.player.getVideoData();
      console.log(videoData);

      if (document.getElementById("title")) {
        document.getElementById("title").innerText =
          videoData.title + " BY " + videoData.author;
      }

      if (channelName) {
        channelName.textContent = `Channel ${this.currentVideoIndex + 1}`;
      }
    } else if (event.data == YT.PlayerState.PAUSED) {
      videoId.textContent = "PAUSED";
    } else if (event.data == YT.PlayerState.BUFFERING) {
      videoId.textContent = "BUFFERING";
    } else if (event.data == YT.PlayerState.CUED) {
      videoId.textContent = "VIDEO CUED";
    }
  }

  onReady(event) {
    this.playStream(); // Start playing as soon as the player is ready
  }
}

function onYouTubeIframeAPIReady() {
  const togger = new Togger();
  const player = new YT.Player("player", {
    height: 400,
    width: 700,
    playerVars: {
      playsinline: 1,
      disablekb: 1,
      enablejsapi: 1,
      iv_load_policy: 3,
      cc_load_policy: 0,
      controls: 0,
      rel: 0,
      autoplay: 1,
      mute: 1,
    },
    events: {
      onReady: (event) => togger.onReady(event),
      onStateChange: (event) => togger.onPlayerStateChange(event),
      onError: (event) => console.error(event.data),
    },
  });

  togger.setPlayer(player);
  togger.resizePlayer();
  togger.bindToResize();
}

// Load the YouTube IFrame API
var scriptUrl = "https://www.youtube.com/iframe_api";
var tag = document.createElement("script");
tag.src = scriptUrl;
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
