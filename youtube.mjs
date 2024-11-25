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

  async createChannelFile(videoUrl, collections = "youtube") {
    try {
      // Extract video ID from URL
      const videoId = this.extractVideoId(videoUrl)
      if (!videoId) {
        throw new Error("Invalid YouTube URL")
      }

      // Get video details to find channel info
      const endpoint = "https://www.googleapis.com/youtube/v3/videos"
      const params = new URLSearchParams({
        part: "snippet",
        id: videoId,
        key: this.apiKey,
      })

      const response = await fetch(`${endpoint}?${params}`)
      const data = await response.json()

      if (!data.items?.[0]?.snippet) {
        throw new Error("Video not found")
      }

      const videoInfo = data.items[0].snippet
      const channelId = videoInfo.channelId
      const channelTitle = videoInfo.channelTitle

      // Get channel details
      const channelEndpoint = "https://www.googleapis.com/youtube/v3/channels"
      const channelParams = new URLSearchParams({
        part: "snippet",
        id: channelId,
        key: this.apiKey,
      })

      const channelResponse = await fetch(`${channelEndpoint}?${channelParams}`)
      const channelData = await channelResponse.json()

      if (!channelData.items?.[0]?.snippet) {
        throw new Error("Channel not found")
      }

      // Extract channel handle from custom URL or generate from title
      const channelHandle =
        channelData.items[0].snippet.customUrl?.replace("@", "") ||
        channelTitle.toLowerCase().replace(/\s+/g, "")

      // Create scroll file content
      const scrollContent = [
        `../channels.parsers`,
        ``,
        `id ${channelHandle}`,
        `url https://www.youtube.com/@${channelHandle}`,
        `channelid ${channelId}`,
        `channeltitle ${channelTitle}`,
        `status off`,
        `collections ${collections}`,
        `neweststream ${videoId}`,
        `streamtime ${new Date().toISOString()}`,
      ].join("\n")

      // Create channels directory if it doesn't exist
      const channelsDir = path.join(__dirname, "channels")
      await fs.mkdir(channelsDir, { recursive: true })

      // Write the scroll file
      const filePath = path.join(channelsDir, `${channelHandle}.scroll`)
      await fs.writeFile(filePath, scrollContent)

      console.log(`Created channel file: ${filePath}`)
      return filePath
    } catch (error) {
      console.error("Error creating channel file:", error)
      throw error
    }
  }

  extractVideoId(url) {
    const urlObj = new URL(url)
    if (
      urlObj.hostname === "www.youtube.com" ||
      urlObj.hostname === "youtube.com"
    ) {
      return urlObj.searchParams.get("v")
    } else if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1)
    }
    return null
  }
}

export { YouTubeFeed }
