import fs from "fs/promises"

// https://developers.google.com/youtube/v3/docs/search

class YouTubeFeed {
  constructor(apiKey) {
    this.apiKey = apiKey
  }

  async fetchLiveStreams(maxResults = 100) {
    const endpoint = "https://www.googleapis.com/youtube/v3/search"
    const params = new URLSearchParams({
      q: "coding programming live -bot -lofi -music",
      part: "snippet",
      eventType: "live",
      type: "video",
      maxResults: maxResults,
      key: this.apiKey,
    })
    try {
      const response = await fetch(`${endpoint}?${params}`)
      const data = await response.json()
      return data.items
    } catch (error) {
      console.error("Error fetching live streams:", error)
      throw error
    }
  }

  async fetchChannelStreams(channelUrls) {
    const { apiKey } = this
    // Extract channel handles from URLs
    const channelHandles = channelUrls
      .map((url) => {
        const match = url.match(/@([^/]+)/)
        return match ? match[1] : null
      })
      .filter(Boolean)

    const streams = []
    const endpoint = "https://www.googleapis.com/youtube/v3"

    for (const handle of channelHandles) {
      try {
        // First, get the channel ID using the handle
        const channelResponse = await fetch(
          `${endpoint}/channels?part=id&forHandle=${handle}&key=${apiKey}`,
        )
        const channelData = await channelResponse.json()

        if (!channelData.items?.[0]?.id) {
          console.warn(`Could not find channel ID for handle: ${handle}`)
          continue
        }

        const channelId = channelData.items[0].id

        // Then, get the latest stream/video for this channel
        const searchParams = new URLSearchParams({
          part: "snippet",
          channelId: channelId,
          maxResults: "1",
          order: "date",
          type: "video",
          key: apiKey,
        })

        const videoResponse = await fetch(`${endpoint}/search?${searchParams}`)
        const videoData = await videoResponse.json()

        if (videoData.items?.[0]) {
          streams.push(videoData.items[0])
        }
      } catch (error) {
        console.error(`Error fetching data for channel ${handle}:`, error)
      }
    }

    return streams
  }

  async updateLiveNow() {
    try {
      const streams = await this.fetchLiveStreams()
      await fs.writeFile("youtubeNow.json", JSON.stringify(streams, null, 2))
      console.log(`Saved ${streams.length} streams to youtube.json`)
    } catch (error) {
      console.error("Failed to fetch or save streams:", error)
      process.exit(1)
    }
  }
}

export { YouTubeFeed }
