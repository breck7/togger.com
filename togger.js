let staticNoise = document.querySelector(".staticNoise")
let powerScreen = document.querySelector(".powerScreen")
const lodash = _

const defaultJam = "all"

class Togger {
  constructor() {
    this.isRemoteVisible = true // Add this line near the top

    this.jamNames = Array.from(
      new Set(
        this.channels
          .map((c) => c.jams)
          .join(" ")
          .split(" "),
      ),
    )
    this.jamNames.sort()
    const params = new URLSearchParams(window.location.search)
    let startJam =
      params.get("jam") ||
      params.get("network") ||
      params.get("collection") ||
      params.get("p") ||
      (params.get("v") ? "customjam" : "") ||
      defaultJam

    if (startJam === "coding") startJam = "code"

    // Track indexes per jam
    this.jamIndexes = {}
    this.jamNames.forEach((name) => {
      this.jamIndexes[name] = 0
    })

    this.loadStreams(startJam)
    if (params.get("shuffle")) this.shuffle()
    this.currentIndex = this.getInitialIndex()
    // Store initial index for current jam
    this.jamIndexes[this.jamName] = this.currentIndex

    this.isPoweredOn = true
    this.isMuted = true
    this.bindKeyboardControls()
    this.createChatOverlay()
  }

  // Replace the createChatOverlay method with this version
  createChatOverlay() {
    const overlay = document.createElement("div")
    overlay.className = "chat-overlay"
    overlay.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    z-index: 1000;
    display: none;
    border-left: 1px solid #333;
  `

    const header = document.createElement("div")
    header.style.cssText = `
    height: 40px;
    background: #1a1a1a;
    display: flex;
    align-items: center;
    padding: 0 16px;
    color: white;
    font-size: 14px;
    font-family: "IBM Plex Mono", monospace;
    border-bottom: 1px solid #333;
  `
    header.textContent = "Live Chat"

    // Add close button
    const closeButton = document.createElement("button")
    closeButton.style.cssText = `
    position: absolute;
    right: 8px;
    top: 8px;
    background: none;
    border: none;
    color: #666;
    font-size: 20px;
    cursor: pointer;
    padding: 4px 8px;
  `
    closeButton.textContent = "×"
    closeButton.addEventListener("click", () => this.toggleChat())

    const chatFrame = document.createElement("iframe")
    chatFrame.style.cssText = `
    width: 100%;
    height: calc(100% - 40px);
    border: none;
    background: transparent;
  `

    header.appendChild(closeButton)
    overlay.appendChild(header)
    overlay.appendChild(chatFrame)
    document.body.appendChild(overlay)

    this.chatOverlay = overlay
    this.chatFrame = chatFrame
    this.addRemoteControl()
  }

  // Update toggleChat to move indicator
  toggleChat() {
    this.isChatVisible = !this.isChatVisible
    const indicator = document.querySelector(".indicator")

    if (this.isChatVisible) {
      this.chatOverlay.style.display = "block"
      this.updateChatUrl()
      indicator.style.right = "420px" // 400px chat width + 20px original padding
    } else {
      this.chatOverlay.style.display = "none"
      indicator.style.right = "20px"
    }

    this.resizePlayer()
    this.showIndicator(this.isChatVisible ? "Chat: ON" : "Chat: OFF")
  }

  // Update chat URL when changing channels
  updateChatUrl() {
    if (this.isChatVisible && this.currentChannel) {
      this.chatFrame.src =
        `https://www.youtube.com/live_chat?v=${this.currentChannel.streamLink}&embed_domain=` +
        window.location.hostname
    }
  }

  // Add new toggle method for remote
  toggleRemote() {
    this.isRemoteVisible = !this.isRemoteVisible
    const remote = document.querySelector(".remote-control")
    if (remote) {
      remote.style.display = this.isRemoteVisible ? "block" : "none"
    }
    this.showIndicator(this.isRemoteVisible ? "Remote: ON" : "Remote: OFF")
  }

  maybeAddCustomChannel() {
    const params = new URLSearchParams(window.location.search)
    const customVideoId = params.get("v")
    if (!customVideoId) return ""
    this._channels.unshift({
      id: "custom",
      youtube: "https://www.youtube.com/watch?v=" + customVideoId,
      channelid: "",
      channeltitle: "",
      status: "off",
      jams: "customjam",
      neweststream: customVideoId,
    })
    // const timestamp = params.get("t")
  }

  _channels
  get channels() {
    if (this._channels) return this._channels
    this._channels = sorted.slice()
    this._channels.forEach((channel) => {
      channel.jams += " all"
    })
    this.maybeAddCustomChannel()
    return this._channels
  }

  get jamIndex() {
    return this.jamNames.indexOf(this.jamName)
  }

  nextJam() {
    // Save current index for current jam
    this.jamIndexes[this.jamName] = this.currentIndex

    const { jamNames, jamIndex } = this
    const jamName = jamNames[(jamIndex + 1) % jamNames.length]
    this.loadStreams(jamName)

    // Restore saved index for new jam
    this.currentIndex = this.jamIndexes[jamName]
    this.playStream()
  }

  previousJam() {
    // Save current index for current jam
    this.jamIndexes[this.jamName] = this.currentIndex

    const { jamNames, jamIndex } = this
    const jamName = jamNames[(jamIndex - 1 + jamNames.length) % jamNames.length]
    this.loadStreams(jamName)

    // Restore saved index for new jam
    this.currentIndex = this.jamIndexes[jamName]
    this.playStream()
  }

  getJam(jamName) {
    const { jamNames } = this
    if (!jamNames.includes(jamName)) jamName = defaultJam
    this.jamName = jamName
    return this.channels.filter((c) => c.jams?.includes(jamName))
  }

  loadStreams(jamName) {
    let streams = this.getJam(jamName)
    streams = streams.map((item) => {
      const channeltitle = item.channeltitle
      const platform = "youtube"
      return {
        ...item,
        link: `https://youtube.com/channel/${item.channelid}`,
        streamLink: item.neweststream,
        platform: "youtube",
      }
    })

    this.streams = lodash.sortBy(this.streams, "status")

    if (jamName === "all")
      streams = lodash.shuffle(
        streams.filter((stream) => stream.status === "live"),
      )

    this.streams = streams
  }

  getInitialIndex() {
    const params = new URLSearchParams(window.location.search)
    const deepLink = params.get("channel") || params.get("c")
    if (!deepLink) return 0
    // todo: deprecate old deeplinks
    const hit = this.streams.findIndex(
      (channel) =>
        channel.id === deepLink ||
        `youtube.${channel.channeltitle.replace(/\s+/g, "")}` === deepLink,
    )
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
          this.nextJam()
          break
        case "arrowdown":
          this.previousJam()
          break
        case "e":
          window.open(
            `/edit.html?folderName=togger.com&fileName=channels%2F${this.currentChannel.id}.scroll`,
            "edit",
          )
          break
        case "m":
          this.toggleMute()
          break
        case "p":
          this.togglePower()
          break
        case "c":
          this.toggleChat()
          break
        case "-":
          this.decreaseVolume()
          break
        case "=":
          this.increaseVolume()
          break
        case "r":
          this.toggleRemote()
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
    //if (this.currentChannel.status === "removed") return this.nextChannel();
    this.playStream()
  }

  previousChannel() {
    this.currentIndex =
      (this.currentIndex - 1 + this.streams.length) % this.streams.length
    //if (this.currentChannel.status === "removed") return this.previousChannel();
    this.playStream()
  }

  volume = 100

  showVolumeIndicator() {
    const { volume, isMuted } = this
    this.showIndicator(isMuted ? "MUTED" : `Volume: ${volume}`)
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
    if (this.isMuted) this.unmute()
    let delta = 20
    if (this.volume === 0) delta = 1
    if (this.volume === 1) delta = 4
    if (this.volume === 5) delta = 5
    if (this.volume === 10) delta = 10
    this.volume = Math.min(100, this.volume + delta)
    this.player.setVolume(this.volume)
    this.showVolumeIndicator()
  }

  decreaseVolume() {
    let delta = 20
    if (this.volume === 20) delta = 10
    if (this.volume === 10) delta = 5
    if (this.volume === 5) delta = 4
    this.volume = Math.min(100, Math.max(0, this.volume - delta))
    this.player.setVolume(this.volume)
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

    const current = this.currentChannel
    this.updateChannelTitle()

    if (current.platform === "youtube") {
      this.player.mute()
      this.player.loadVideoById(current.streamLink)
      this.player.setVolume(this.volume)
      this.player.setPlaybackRate(1)
      this.updateChatUrl()

      if (this.startUpdatingUrl)
        // dont update url on load.
        this.updateUrl()
    }
    this.startUpdatingUrl = true
  }

  updateUrl() {
    // Get current URL parameters
    const params = new URLSearchParams(window.location.search)
    // Update the channel parameter
    params.delete("c")
    params.delete("p")
    params.set("channel", this.currentChannel.id)
    params.set("jam", this.jamName)

    // Replace state with all parameters
    window.history.replaceState({}, "", `?${params.toString()}`)
  }

  updateChannelTitle(isLive) {
    const current = this.streams[this.currentIndex]
    let liveIndicator = "↺"
    if (isLive !== undefined)
      liveIndicator = isLive
        ? '<span style="color: red; margin-left: 8px;">● LIVE</span>'
        : '<span style="color: white; margin-left: 8px;">- OFF-AIR</span>'

    const url = `https://www.youtube.com/watch?v=${current.neweststream}`
    const title = [this.jamName, current.channeltitle].join(".")
    const links = {
      youtube: (link) =>
        `<a target="toggerLink" href="${current.youtube}"><img src="youtube.svg"></span>`,
      twitch: (link) =>
        `<a target="toggerLink" href="${current.twitch}"><img src="twitch.png"></span>`,
      warpcast: (link) =>
        `<a target="toggerLink" href="${current.warpcast}"><img src="warpcast.png"></span>`,
      twitter: (link) =>
        `<a target="toggerLink" href="${current.twitter}"><img src="twitter.png"></span>`,
      github: (link) =>
        `<a target="toggerLink" href="${current.github}"><img src="github.png"></span>`,
      homepage: (link) =>
        `<a target="toggerLink" href="${current.homepage}"><img src="homepage.png"></span>`,
    }
    const alinks = Object.keys(links)
      .filter((link) => current[link])
      .map((key) => links[key](current))
      .join("")
    document.querySelector(".channelName").innerHTML = `
      <a href="${url}" target="_blank">
        ${title}
      </a>
      ${liveIndicator}
      ${alinks.trim()}
    `
    this.showChannel()
  }

  showChannel() {
    const indicator = document.querySelector(".channelName")
    indicator.style.opacity = "1"

    if (this.channelTimeout) clearTimeout(this.channelTimeout)

    // Hide the indicator after 3 seconds
    this.channelTimeout = setTimeout(() => {
      indicator.style.opacity = "0"
    }, 5000)
  }

  // Update the resizePlayer method to account for chat
  resizePlayer() {
    let p = document.querySelector("#player")
    p.style.top = -window.innerHeight * 0.5 + "px"

    const availableWidth = this.isChatVisible
      ? window.innerWidth - 400 // Subtract chat width when visible
      : window.innerWidth

    p.style.left =
      (availableWidth - Math.min(window.innerHeight * 1.777, availableWidth)) /
        2 +
      "px"

    this.player.setSize(
      Math.min(window.innerHeight * 1.777, availableWidth),
      window.innerHeight * 2,
    )
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
      this.player.seekTo(0, true)
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

      if (!isLive && this.currentChannel.status === "live")
        this.reportStatus("off")
      if (isLive && this.currentChannel.status === "off")
        this.reportStatus("live")

      // videoId.textContent = `${videoData.video_id} ${isLive ? "(LIVE)" : ""}`

      this.updateChannelTitle(isLive)
    } else if (event.data == YT.PlayerState.PAUSED) {
      //videoId.textContent = "PAUSED"
    } else if (event.data == YT.PlayerState.BUFFERING) {
      //videoId.textContent = "BUFFERING"
    } else if (event.data == YT.PlayerState.CUED) {
      //videoId.textContent = "VIDEO CUED"
    }
  }

  async reportStatus(value) {
    try {
      this.currentChannel.status = value
      const filename = `channels/${this.currentChannel.id}.scroll`
      const response = await fetch(
        `/set?folderName=togger.com&file=${filename}&line=status ${value}`,
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
    document.querySelector(".mute").focus()
  }

  addRemoteControl() {
    const existingRemote = document.querySelector(".remote-control")
    if (existingRemote) {
      existingRemote.remove()
    }

    const remote = document.createElement("div")
    remote.className = "remote-control"
    remote.style.display = this.isRemoteVisible ? "block" : "none"

    const dragHandle = document.createElement("div")
    dragHandle.className = "drag-handle"
    remote.appendChild(dragHandle)

    const irEmitter = document.createElement("div")
    irEmitter.className = "ir-emitter"
    remote.appendChild(irEmitter)

    function createButton(text, key, options = {}) {
      const button = document.createElement("button")
      const classes = []
      if (options.isMute) classes.push("mute")
      button.className = classes.join(" ")
      button.textContent = text

      button.addEventListener("mousedown", () => {
        button.style.transform = "scale(0.95)"
      })

      button.addEventListener("click", () => {
        button.style.transform = ""
        document.dispatchEvent(new KeyboardEvent("keydown", { key }))
      })

      return button
    }

    function createButtonRow(buttons) {
      const row = document.createElement("div")
      row.className = "button-row"
      buttons.forEach((button) => row.appendChild(button))
      return row
    }

    const muteRow = createButtonRow([
      createButton("MUTE", "m", { isMute: true }),
    ])
    remote.appendChild(muteRow)

    const jamRow = createButtonRow([
      createButton("JAM-", "ArrowDown"),
      createButton("JAM+", "ArrowUp"),
    ])
    remote.appendChild(jamRow)

    const channelRow = createButtonRow([
      createButton("CH-", "ArrowLeft"),
      createButton("CH+", "ArrowRight"),
    ])
    remote.appendChild(channelRow)

    const volumeControlRow = createButtonRow([
      createButton("VOL-", "-"),
      createButton("VOL+", "="),
    ])
    remote.appendChild(volumeControlRow)

    // Add chat button row
    const chatRow = createButtonRow([createButton("CHAT", "c")])
    remote.appendChild(chatRow)

    document.body.appendChild(remote)

    let isDragging = false
    let currentX, currentY, initialX, initialY
    let xOffset = 0,
      yOffset = 0

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
        remote.style.transform = `translate(${xOffset}px, ${yOffset}px)`
      }
    }

    remote.addEventListener("touchstart", dragStart, false)
    remote.addEventListener("touchend", dragEnd, false)
    remote.addEventListener("touchmove", drag, false)
    remote.addEventListener("mousedown", dragStart, false)
    document.addEventListener("mouseup", dragEnd, false)
    document.addEventListener("mousemove", drag, false)
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
        if (event.data === 101 || event.data === 150)
          togger.reportStatus("removed")
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
