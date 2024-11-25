let staticNoise = document.querySelector(".static-noise")
let channelName = document.querySelector(".channel-name")
let powerScreen = document.querySelector(".power-screen")
const lodash = _

const defaultCollection = "worldcams"

const makeDeepLink = (platform, channeltitle) =>
  [platform, channeltitle.replace(/\s+/g, "")].join(".")

const makeWarpCastLink = (link) =>
  `<a target="warpcast" class="warpcast" href="${link}">W</span>`

class Togger {
  constructor() {
    this.collectionNames = Array.from(
      new Set(
        this.channels
          .map((c) => c.collections)
          .join(" ")
          .split(" "),
      ),
    )
    const params = new URLSearchParams(window.location.search)
    const startCollection =
      params.get("collection") ||
      params.get("p") ||
      (params.get("v") ? "custom" : "")
    this.loadStreams(startCollection)
    if (params.get("shuffle"))
      this.shuffle()
    this.currentIndex = this.getInitialIndex()
    this.isPoweredOn = true
    this.isMuted = true
    this.addVolumeIndicator()
    this.bindKeyboardControls()
    this.addRemoteControl()
  }

  maybeAddCustomChannel() {
    const params = new URLSearchParams(window.location.search)
    const customVideoId = params.get("v")
    if (!customVideoId) return ""
    this._channels.unshift({
      id: "customDeepLink",
      url: "https://www.youtube.com/watch?v=" + customVideoId,
      channelid: "",
      channeltitle: "",
      status: "off",
      collections: "custom",
      neweststream: customVideoId,
    })
    // const timestamp = params.get("t")
  }

  _channels
  get channels() {
    if (this._channels) return this._channels
    this._channels = channels.slice()
    this.maybeAddCustomChannel()
    return this._channels
  }

  getCollection(collectionName = defaultCollection) {
    const { collectionNames } = this
    if (!collectionNames.includes(collectionName))
      collectionName = defaultCollection
    this.collectionName = collectionName
    return this.channels.filter((c) => c.collections?.includes(collectionName))
  }

  get collectionIndex() {
    return this.collectionNames.indexOf(this.collectionName)
  }

  nextCollection() {
    const { collectionNames, collectionIndex } = this
    const collectionName =
      collectionNames[(collectionIndex + 1) % collectionNames.length]
    this.loadStreams(collectionName)
    this.nextChannel()
    this.showIndicator(collectionName)
  }

  previousCollection() {
    const { collectionNames, collectionIndex } = this
    const collectionName =
      collectionNames[
        (collectionIndex - 1 + collectionNames.length) % collectionNames.length
      ]
    this.loadStreams(collectionName)
    this.previousChannel()
    this.showIndicator(collectionName)
  }

  loadStreams(collectionName) {
    const streams = this.getCollection(collectionName)
    this.streams = streams.map((item) => {
      const channeltitle = item.channeltitle
      const platform = "youtube"
      return {
        ...item,
        link: `https://youtube.com/channel/${item.channelid}`,
        streamLink: item.neweststream,
        platform: "youtube",
        deepLink: makeDeepLink(platform, channeltitle),
      }
    })

    // Remove duplicates using deepLink as the primary key
    this.streams = Array.from(
      new Map(this.streams.map((item) => [item.deepLink, item])).values(),
    )
  }

  getInitialIndex() {
    const params = new URLSearchParams(window.location.search)
    const deepLink = params.get("channel") || params.get("c")
    if (!deepLink) return 0

    const hit = this.streams.findIndex((stream) => stream.deepLink === deepLink)
    return hit > -1 ? hit : 0
  }

  setPlayer(player) {
    this.player = player
    // Show initial volume state once player is ready
    setTimeout(() => this.showVolumeIndicator(), 1000)
  }

  bindToResize() {
    window.addEventListener("resize", () => this.resizePlayer(), true)
  }

  shuffle() {
    this.streams = lodash.shuffle(this.streams)
  }

  bindKeyboardControls() {
    document.addEventListener("keydown", (event) => {
      switch (event.key.toLowerCase()) {
        case "arrowleft":
          this.previousChannel()
          break
        case "arrowright":
          this.nextChannel()
          break
        case "arrowup":
          this.nextCollection()
          break
        case "arrowdown":
          this.previousCollection()
          break
        case "m":
          this.toggleMute()
          break
        case "p":
          this.togglePower()
          break
        case "s":
          this.shuffle()
          this.nextChannel()
          break
      }
    })
  }

  get currentChannel() {
    return this.streams[this.currentIndex]
  }

  nextChannel() {
    this.currentIndex = (this.currentIndex + 1) % this.streams.length
    this.playStream()
  }

  previousChannel() {
    this.currentIndex =
      (this.currentIndex - 1 + this.streams.length) % this.streams.length
    this.playStream()
  }

  get volume() {
    return this.player?.getVolume ? this.player.getVolume() : 100
  }

  showVolumeIndicator() {
    const { volume, isMuted } = this
    this.showIndicator(isMuted ? "MUTED" : `Volume: ${volume}%`)
  }

  showIndicator(message) {
    const indicator = document.querySelector(".indicator")
    indicator.textContent = message
    indicator.style.display = "block"

    if (this.indicatorTimeout) clearTimeout(this.indicatorTimeout)

    // Hide the indicator after 3 seconds
    this.indicatorTimeout = setTimeout(() => {
      indicator.style.display = "none"
    }, 3000)
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

  unmute() {
    this.isMuted = false
    this.player.unMute()
  }

  mute() {
    this.isMuted = true
    this.player.mute()
  }

  toggleMute() {
    if (this.isMuted) this.unmute()
    else this.mute()
    this.showVolumeIndicator()
  }

  togglePower() {
    if (this.isPoweredOn) this.powerOff()
    else this.powerOn()
  }

  playStream() {
    if (!this.isPoweredOn) return
    this.didLoad = false

    const current = this.streams[this.currentIndex]

    channelName.innerHTML = `${current.deepLink} ↺`

    if (current.platform === "youtube") {
      this.player.mute()
      this.player.loadVideoById(current.streamLink)
      this.player.setVolume(100)
      this.player.setPlaybackRate(1)

      // Get current URL parameters
      const params = new URLSearchParams(window.location.search)
      // Update the channel parameter
      params.delete("c")
      params.delete("p")
      params.set("channel", current.deepLink)
      params.set("collection", this.collectionName)

      // Replace state with all parameters
      window.history.replaceState({}, "", `?${params.toString()}`)
    }
  }

  updateChannelDisplay(videoData, isLive) {
    const current = this.streams[this.currentIndex]

    const liveIndicator = isLive
      ? '<span style="color: red; margin-left: 8px;">● LIVE</span>'
      : '<span style="color: white; margin-left: 8px;">OFF-AIR</span>'

    channelName.innerHTML = `
      <a href="${current.link}" target="_blank">
        ${current.deepLink}
      </a>
      ${liveIndicator}
      ${current.warpcast ? makeWarpCastLink(current.warpcast) : ""}
    `
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
    this.addRemoteControl()
  }

  powerOn() {
    this.isPoweredOn = true
    if (powerScreen) powerScreen.style.display = "none"
    this.playStream()
  }

  powerOff() {
    this.isPoweredOn = false
    if (powerScreen) powerScreen.style.display = "block"
    this.player.stopVideo()
    staticNoise.style.opacity = 1
  }

  getChannelName(videoData) {
    const current = this.streams[this.currentIndex]
    return `<a href="${current.link}" target="_blank">${current.platform}@${current.channeltitle}</a>`
  }

  checkIfLive() {
    return this.player.playerInfo.videoData.isLive
  }

  getTimeBasedSeekPosition(duration) {
    // Get current UTC time
    const now = new Date()
    const totalMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()
    const totalSeconds = totalMinutes * 60 + now.getUTCSeconds()

    // If the video duration is available, use modulo to wrap around
    if (duration && duration > 0) {
      return totalSeconds % duration
    }

    return totalSeconds
  }

  onPlayerStateChange(event) {
    if (!this.isPoweredOn) return

    staticNoise.style.opacity = 1
    if (event.data == YT.PlayerState.UNSTARTED) {
      // videoId.textContent = "UNSTARTED"
    } else if (event.data == YT.PlayerState.ENDED) {
      //videoId.textContent = "STREAM ENDED"
      //      this.nextChannel() // Auto-play next video when current one ends
    } else if (event.data == YT.PlayerState.PLAYING) {
      // Get video data and check live status
      const videoData = this.player.getVideoData()
      const isLive = this.checkIfLive()
      if (this.didLoad || isLive) staticNoise.style.opacity = 0

      if (!isLive && !this.didLoad) {
        // For non-live videos, seek to time-based position
        const duration = this.player.getDuration()
        const seekPosition = this.getTimeBasedSeekPosition(duration)
        this.player.seekTo(seekPosition, true)
      }
      if (!this.didLoad && !this.isMuted) {
        this.player.unMute()
      }
      this.didLoad = true

      if (!isLive && this.currentChannel.status === "live") this.reportOffline()

      // videoId.textContent = `${videoData.video_id} ${isLive ? "(LIVE)" : ""}`

      this.updateChannelDisplay(videoData, isLive)
    } else if (event.data == YT.PlayerState.PAUSED) {
      //videoId.textContent = "PAUSED"
    } else if (event.data == YT.PlayerState.BUFFERING) {
      //videoId.textContent = "BUFFERING"
    } else if (event.data == YT.PlayerState.CUED) {
      //videoId.textContent = "VIDEO CUED"
    }
  }

  async reportOffline() {
    try {
      this.currentChannel.status = "off"
      const filename = `channels/${this.currentChannel.id}.scroll`
      const response = await fetch(
        `/set?folderName=togger.com&file=${filename}&line=status off`,
        {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          },
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error("Error reporting channel offline:", error)
    }
  }

  onReady(event) {
    this.playStream() // Start playing as soon as the player is ready
  }

  addVolumeIndicator() {
    // Create volume indicator element
    const volumeIndicator = document.createElement("div")
    volumeIndicator.className = "indicator"
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
    // Remove existing remote if it exists
    const existingRemote = document.querySelector(".remote-control")
    if (existingRemote) {
      existingRemote.remove()
    }

    // Create remote container
    const remote = document.createElement("div")
    remote.className = "remote-control"
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
    user-select: none;
    touch-action: none;
  `

    // Add drag handle
    const dragHandle = document.createElement("div")
    dragHandle.style.cssText = `
    width: 40px;
    height: 4px;
    background: #374151;
    border-radius: 2px;
    cursor: move;
    margin: 0 auto 1rem auto;
    `
    remote.appendChild(dragHandle)

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

    // Helper function to create buttons (remains the same)
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
        document.dispatchEvent(new KeyboardEvent("keydown", { key }))
      })

      return button
    }

    // Create button rows container (remains the same)
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
      createButton("COL-", "ArrowDown"),
      createButton("COL+", "ArrowUp"),
    ])
    remote.appendChild(volumeRow)

    // Add mute button
    const muteRow = createButtonRow([
      createButton("MUTE", "m", { small: true }),
    ])
    remote.appendChild(muteRow)

    // Add remote to page
    document.body.appendChild(remote)

    // Add drag functionality
    let isDragging = false
    let currentX
    let currentY
    let initialX
    let initialY
    let xOffset = 0
    let yOffset = 0

    function dragStart(e) {
      if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset
        initialY = e.touches[0].clientY - yOffset
      } else {
        initialX = e.clientX - xOffset
        initialY = e.clientY - yOffset
      }

      if (e.target === dragHandle || e.target === remote) {
        isDragging = true
      }
    }

    function dragEnd() {
      initialX = currentX
      initialY = currentY
      isDragging = false
    }

    function drag(e) {
      if (isDragging) {
        e.preventDefault()

        if (e.type === "touchmove") {
          currentX = e.touches[0].clientX - initialX
          currentY = e.touches[0].clientY - initialY
        } else {
          currentX = e.clientX - initialX
          currentY = e.clientY - initialY
        }

        xOffset = currentX
        yOffset = currentY

        // Ensure the remote stays within viewport bounds
        // const remoteRect = remote.getBoundingClientRect()
        // const maxX = window.innerWidth - remoteRect.width
        // const maxY = window.innerHeight - remoteRect.height

        // xOffset = Math.min(Math.max(0, xOffset), maxX)
        // yOffset = Math.min(Math.max(0, yOffset), maxY)

        remote.style.transform = `translate(${xOffset}px, ${yOffset}px)`
      }
    }

    // Add event listeners for both mouse and touch events
    remote.addEventListener("touchstart", dragStart, false)
    remote.addEventListener("touchend", dragEnd, false)
    remote.addEventListener("touchmove", drag, false)

    remote.addEventListener("mousedown", dragStart, false)
    document.addEventListener("mouseup", dragEnd, false)
    document.addEventListener("mousemove", drag, false)

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

// https://developers.google.com/youtube/iframe_api_reference
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
      onError: (event) => {
        console.log(`https://developers.google.com/youtube/iframe_api_reference
This event fires if an error occurs in the player. The API will pass an event object to the event listener function. That object's data property will specify an integer that identifies the type of error that occurred. Possible values are:
2 – The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.
5 – The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.
100 – The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.
101 – The owner of the requested video does not allow it to be played in embedded players.
150 – This error is the same as 101. It's just a 101 error in disguise!`)
        console.error(event)
      },
    },
  })

  togger.setPlayer(player)
  togger.resizePlayer()
  togger.bindToResize()
  window.togger = togger
}

// Load the YouTube IFrame API
var scriptUrl = "https://www.youtube.com/iframe_api"
var tag = document.createElement("script")
tag.src = scriptUrl
var firstScriptTag = document.getElementsByTagName("script")[0]
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
