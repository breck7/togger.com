let staticNoise = document.querySelector(".static-noise")
let powerScreen = document.querySelector(".power-screen")
const lodash = _

const defaultCollection = "all"

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
      (params.get("v") ? "custom" : "") ||
      defaultCollection

    // Track indexes per collection
    this.collectionIndexes = {}
    this.collectionNames.forEach((name) => {
      this.collectionIndexes[name] = 0
    })

    this.loadStreams(startCollection)
    if (params.get("shuffle")) this.shuffle()
    this.currentIndex = this.getInitialIndex()
    // Store initial index for current collection
    this.collectionIndexes[this.collectionName] = this.currentIndex

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
    this._channels = sorted.slice()
    this._channels.forEach((channel) => {
      channel.collections += " all"
    })
    this.maybeAddCustomChannel()
    return this._channels
  }

  get collectionIndex() {
    return this.collectionNames.indexOf(this.collectionName)
  }

  nextCollection() {
    // Save current index for current collection
    this.collectionIndexes[this.collectionName] = this.currentIndex

    const { collectionNames, collectionIndex } = this
    const collectionName =
      collectionNames[(collectionIndex + 1) % collectionNames.length]
    this.loadStreams(collectionName)

    // Restore saved index for new collection
    this.currentIndex = this.collectionIndexes[collectionName]
    this.playStream()
    this.showIndicator(collectionName)
  }

  showCollectionIndicator() {
    this.showIndicator(this.collectionName)
  }

  previousCollection() {
    // Save current index for current collection
    this.collectionIndexes[this.collectionName] = this.currentIndex

    const { collectionNames, collectionIndex } = this
    const collectionName =
      collectionNames[
        (collectionIndex - 1 + collectionNames.length) % collectionNames.length
      ]
    this.loadStreams(collectionName)

    // Restore saved index for new collection
    this.currentIndex = this.collectionIndexes[collectionName]
    this.playStream()
    this.showIndicator(collectionName)
  }

  getCollection(collectionName) {
    const { collectionNames } = this
    if (!collectionNames.includes(collectionName))
      collectionName = defaultCollection
    this.collectionName = collectionName
    return this.channels.filter((c) => c.collections?.includes(collectionName))
  }

  loadStreams(collectionName) {
    let streams = this.getCollection(collectionName)
    streams = streams.map((item) => {
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
    streams = Array.from(
      new Map(streams.map((item) => [item.deepLink, item])).values(),
    )

    this.streams = lodash.sortBy(this.streams, "status")

    if (collectionName === "all")
      streams = lodash.shuffle(
        streams.filter((stream) => stream.status === "live"),
      )

    this.streams = streams
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
    this.showIndicator(this.collectionName)
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
        case "e":
          window.open(
            `/edit.html?folderName=togger.com&fileName=channels%2F${this.currentChannel.id}.scroll`,
            "edit",
          )
          this.toggleMute()
          break
        case " ":
          this.toggleMute()
          break
        case "p":
          this.togglePower()
          break
        case "-":
          this.decreaseVolume()
          break
        case "=":
          this.increaseVolume()
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
    if (this.currentChannel.status === "removed") return this.nextChannel()
    this.playStream()
    this.showCollectionIndicator()
  }

  previousChannel() {
    this.currentIndex =
      (this.currentIndex - 1 + this.streams.length) % this.streams.length
    if (this.currentChannel.status === "removed") return this.previousChannel()
    this.playStream()
  this.showCollectionIndicator()
  }

  get volume() {
    return this.player?.getVolume ? this.player.getVolume() : 100
  }

  showVolumeIndicator(newVolume) {
    const { volume, isMuted } = this
    this.showIndicator(
      isMuted
        ? "MUTED"
        : `Volume: ${newVolume === undefined ? volume : newVolume}%`,
    )
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
    const newVolume = Math.min(100, currentVolume + 10)
    this.player.setVolume(Math.min(100, currentVolume + 10))
    this.showVolumeIndicator(newVolume)
  }

  decreaseVolume() {
    const currentVolume = this.player.getVolume()
    const newVolume = Math.max(0, currentVolume - 10)
    this.player.setVolume(newVolume)
    this.showVolumeIndicator(newVolume)
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
      this.player.setVolume(100)
      this.player.setPlaybackRate(1)

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
    params.set("channel", this.currentChannel.deepLink)
    params.set("collection", this.collectionName)

    // Replace state with all parameters
    window.history.replaceState({}, "", `?${params.toString()}`)
  }

  updateChannelTitle(isLive) {
    const current = this.streams[this.currentIndex]
    let liveIndicator = "↺"
    if (isLive !== undefined)
      liveIndicator = isLive
        ? '<span style="color: red; margin-left: 8px;">● LIVE</span>'
        : '<span style="color: white; margin-left: 8px;">OFF-AIR</span>'

    const url = `https://www.youtube.com/watch?v=${current.neweststream}`
    document.querySelector(".channel-name").innerHTML = `
      <a href="${url}" target="_blank">
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
    const existingRemote = document.querySelector(".remote-control")
    if (existingRemote) {
      existingRemote.remove()
    }

    const remote = document.createElement("div")
    remote.className = "remote-control"

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

      button.addEventListener("click", () => {
        button.style.transform = "scale(0.95)"
        setTimeout(() => (button.style.transform = ""), 100)
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
      createButton("MUTE", " ", { isMute: true }),
    ])
    remote.appendChild(muteRow)

    const channelRow = createButtonRow([
      createButton("CH-", "ArrowLeft"),
      createButton("CH+", "ArrowRight"),
    ])
    remote.appendChild(channelRow)

    const volumeRow = createButtonRow([
      createButton("COL-", "ArrowDown"),
      createButton("COL+", "ArrowUp"),
    ])
    remote.appendChild(volumeRow)

    const volumeControlRow = createButtonRow([
      createButton("VOL-", "-"),
      createButton("VOL+", "="),
    ])
    remote.appendChild(volumeControlRow)

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
