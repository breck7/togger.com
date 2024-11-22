let staticNoise = document.querySelector(".static-noise")
let channelName = document.querySelector(".channel-name")
let muteIcon = document.querySelector(".muteIcon")
let videoId = document.querySelector(".video-id")
let control = document.querySelector(".control")
let powerScreen = document.querySelector(".power-screen")
let info = document.querySelector(".info")

class Togger {
  constructor() {
    this.videoList = [
      "WMvLf2fmqKs",
      "B_yKuCll8u4",
      "1aZb81NZJbk",
      "HybD8aCKIMw",
    ]
    this.currentVideoIndex = 0
    this.isPoweredOn = true
    this.addVolumeIndicator()
    this.bindKeyboardControls()
    this.addRemoteControl()
  }

  setPlayer(player) {
    this.player = player
    // Show initial volume state once player is ready
    setTimeout(() => this.showVolumeIndicator(), 1000)
  }

  bindToResize() {
    window.addEventListener("resize", () => this.resizePlayer(), true)
  }

  bindKeyboardControls() {
    document.addEventListener("keydown", (event) => {
      if (!this.player || !this.isPoweredOn) return

      switch (event.key.toLowerCase()) {
        case "arrowleft":
          this.previousChannel()
          break
        case "arrowright":
          this.nextChannel()
          break
        case "arrowup":
          this.increaseVolume()
          break
        case "arrowdown":
          this.decreaseVolume()
          break
        case "m":
          this.toggleMute()
          break
        case "p":
          this.togglePower()
          break
      }
    })
  }

  nextChannel() {
    this.currentVideoIndex =
      (this.currentVideoIndex + 1) % this.videoList.length
    this.playStream()
  }

  previousChannel() {
    this.currentVideoIndex =
      (this.currentVideoIndex - 1 + this.videoList.length) %
      this.videoList.length
    this.playStream()
  }

  showVolumeIndicator() {
    if (!this.player) return

    const volume = this.player.getVolume()
    const isMuted = this.player.isMuted()

    const volumeIndicator = document.querySelector(".volume-indicator")

    volumeIndicator.textContent = isMuted ? "MUTED" : `Volume: ${volume}%`
    volumeIndicator.style.display = "block"

    // Clear existing timeout if there is one
    if (this.volumeTimeout) {
      clearTimeout(this.volumeTimeout)
    }

    // Hide the indicator after 2 seconds
    this.volumeTimeout = setTimeout(() => {
      volumeIndicator.style.display = "none"
    }, 2000)
  }

  increaseVolume() {
    const currentVolume = this.player.getVolume()
    this.player.setVolume(Math.min(100, currentVolume + 10))
    this.showVolumeIndicator()
  }

  decreaseVolume() {
    const currentVolume = this.player.getVolume()
    this.player.setVolume(Math.max(0, currentVolume - 10))
    this.showVolumeIndicator()
  }

  toggleMute() {
    if (this.player.isMuted()) {
      this.player.unMute()
      if (muteIcon) muteIcon.style.display = "none"
    } else {
      this.player.mute()
      if (muteIcon) muteIcon.style.display = "block"
    }
    this.showVolumeIndicator()
  }

  togglePower() {
    this.isPoweredOn = !this.isPoweredOn
    if (this.isPoweredOn) {
      this.powerOn()
    } else {
      this.powerOff()
    }
  }

  playStream() {
    if (!this.isPoweredOn) return

    const { player } = this
    const currentVideo = this.videoList[this.currentVideoIndex]
    player.loadVideoById(currentVideo)
    player.setVolume(100)
    player.setPlaybackRate(1)
  }

  resizePlayer() {
    let p = document.querySelector("#player")
    p.style.top = -window.innerHeight * 0.5 + "px"
    p.style.left =
      (window.innerWidth -
        Math.min(window.innerHeight * 1.777, window.innerWidth)) /
        2 +
      "px"
    this.player.setSize(
      Math.min(window.innerHeight * 1.777, window.innerWidth),
      window.innerHeight * 2,
    )
  }

  powerOn() {
    if (powerScreen) powerScreen.style.display = "none"
    this.playStream()
  }

  powerOff() {
    if (powerScreen) powerScreen.style.display = "block"
    this.player.stopVideo()
    staticNoise.style.opacity = 1
  }

  getChannelName(videoData) {
    const videoId = videoData.video_id
    const username = videoData.author
    const videoUrl = `https://youtube.com/watch?v=${videoId}`

    if (username)
      return `<a href="${videoUrl}" target="_blank">youtube@${username}</a>`

    return `<a href="${videoUrl}" target="_blank">youtube${videoId}</a>`
  }

  onPlayerStateChange(event) {
    if (!this.isPoweredOn) return

    staticNoise.style.opacity = 1
    if (event.data == YT.PlayerState.UNSTARTED) {
      videoId.textContent = "UNSTARTED"
    } else if (event.data == YT.PlayerState.ENDED) {
      videoId.textContent = "ENDED"
      this.nextChannel() // Auto-play next video when current one ends
    } else if (event.data == YT.PlayerState.PLAYING) {
      staticNoise.style.opacity = 0
      videoId.textContent = this.player.getVideoData().video_id

      const videoData = this.player.getVideoData()
      console.log(videoData)

      if (channelName) {
        channelName.innerHTML = this.getChannelName(videoData)
      }
    } else if (event.data == YT.PlayerState.PAUSED) {
      videoId.textContent = "PAUSED"
    } else if (event.data == YT.PlayerState.BUFFERING) {
      videoId.textContent = "BUFFERING"
    } else if (event.data == YT.PlayerState.CUED) {
      videoId.textContent = "VIDEO CUED"
    }
  }

  onReady(event) {
    this.playStream() // Start playing as soon as the player is ready
  }

  addVolumeIndicator() {
    // Create volume indicator element
    const volumeIndicator = document.createElement("div")
    volumeIndicator.className = "volume-indicator"
    volumeIndicator.style.cssText = `
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  display: none;
  z-index: 1000;
`
    document.body.appendChild(volumeIndicator)
  }

  addRemoteControl() {
    // Create remote container
    const remote = document.createElement("div")
    remote.style.cssText = `
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    width: 256px;
    background: #1f2937;
    border-radius: 0.75rem;
    padding: 1rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    border: 2px solid #374151;
    z-index: 1000;
  `

    // Add brand name
    const brand = document.createElement("div")
    brand.style.cssText = `
    text-align: center;
    margin-bottom: 1rem;
    color: #f59e0b;
    font-weight: bold;
    font-size: 0.875rem;
  `
    brand.textContent = ""
    remote.appendChild(brand)

    // Add IR emitter
    const irEmitter = document.createElement("div")
    irEmitter.style.cssText = `
    position: absolute;
    top: -0.25rem;
    left: 50%;
    transform: translateX(-50%);
    width: 2rem;
    height: 0.75rem;
    background: black;
    border-radius: 0.125rem;
  `
    remote.appendChild(irEmitter)

    // Helper function to create buttons
    function createButton(text, key, options = {}) {
      const button = document.createElement("button")
      button.style.cssText = `
      width: ${options.large ? "3rem" : "3.5rem"};
      height: ${options.large ? "3rem" : "3.5rem"};
      border-radius: 9999px;
      background: ${options.isPower ? "#dc2626" : "#374151"};
      border: 2px solid ${options.isPower ? "#b91c1c" : "#4b5563"};
      box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.25);
      color: ${options.isPower ? "#fee2e2" : "#d1d5db"};
      font-size: ${options.small ? "0.875rem" : "1.125rem"};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.1s;
    `

      // Add power symbol if it's the power button
      if (options.isPower) {
        button.innerHTML = `
        <div style="
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 9999px;
          border: 2px solid #fee2e2;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 0.5rem; height: 1rem; background: #fee2e2;"></div>
        </div>
      `
      } else {
        button.textContent = text
      }

      button.addEventListener("click", () => {
        button.style.transform = "scale(0.95)"
        setTimeout(() => (button.style.transform = "scale(1)"), 100)

        // Simulate keyboard press
        document.dispatchEvent(new KeyboardEvent("keydown", { key }))
      })

      return button
    }

    // Create button rows container
    function createButtonRow(buttons) {
      const row = document.createElement("div")
      row.style.cssText = `
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 1.5rem;
    `
      buttons.forEach((button) => row.appendChild(button))
      return row
    }

    // Add power button
    const powerRow = createButtonRow([
      createButton("", "p", { isPower: true, large: true }),
    ])
    remote.appendChild(powerRow)

    // Add channel buttons
    const channelRow = createButtonRow([
      createButton("CH-", "ArrowLeft"),
      createButton("CH+", "ArrowRight"),
    ])
    remote.appendChild(channelRow)

    // Add volume buttons
    const volumeRow = createButtonRow([
      createButton("VOL-", "ArrowDown"),
      createButton("VOL+", "ArrowUp"),
    ])
    remote.appendChild(volumeRow)

    // Add mute button
    const muteRow = createButtonRow([
      createButton("MUTE", "m", { small: true }),
    ])
    remote.appendChild(muteRow)

    // Add remote to page
    document.body.appendChild(remote)

    // Handle window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        remote.style.display = "none"
      } else {
        remote.style.display = "block"
      }
    })
  }
}

function onYouTubeIframeAPIReady() {
  const togger = new Togger()
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
  })

  togger.setPlayer(player)
  togger.resizePlayer()
  togger.bindToResize()
}

// Load the YouTube IFrame API
var scriptUrl = "https://www.youtube.com/iframe_api"
var tag = document.createElement("script")
tag.src = scriptUrl
var firstScriptTag = document.getElementsByTagName("script")[0]
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
