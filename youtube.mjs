import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://developers.google.com/youtube/v3/docs/search

class YouTubeFeed {
  constructor(apiKey) {
    this.apiKey = apiKey
  }

  async fetchLiveStreams(query, maxResults = 100) {
    const endpoint = "https://www.googleapis.com/youtube/v3/search"
    const params = new URLSearchParams({
      q: query,
      part: "snippet",
      eventType: "live",
      type: "video",
      maxResults: maxResults,
      key: this.apiKey,
    })
    try {
      const response = await fetch(`${endpoint}?${params}`)
      const data = await response.json()
      console.log(data)
      console.log(`${data.items.length} hits for '${query}'`)
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

  async channelsToCollection(channels, name) {
    const streams = await this.fetchChannelStreams(channels)
    await this.saveCollection(streams, name)
  }

  async saveCollection(streams, name) {
    const filepath = path.join(
      __dirname,
      "collectionsCache",
      name + "Collection.json",
    )
    await fs.writeFile(filepath, JSON.stringify(streams, null, 2))
    console.log(`Saved ${streams.length} streams to ${filepath}`)
  }

  async generateCollection(query, name) {
    try {
      console.log(`Fetching '${query}'`)
      const streams = await this.fetchLiveStreams(query)
      console.log(`Saving ${streams.length} to ${name}`)
      await this.saveCollection(streams, name)
    } catch (error) {
      console.error("Failed to fetch or save streams:", error)
      process.exit(1)
    }
  }
}

export { YouTubeFeed }
