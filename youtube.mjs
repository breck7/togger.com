import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

import { createRequire } from "module"
const require = createRequire(import.meta.url)
const { Particle } = require("scrollsdk/products/Particle.js")

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

  async getVideoDetails(videoId) {
    const videoInfo = await this.fetchVideoDetails(videoId)
    const stats = {
      viewCount: videoInfo.statistics?.viewCount,
      likeCount: videoInfo.statistics?.likeCount,
    }

    const result = videoInfo.liveStreamingDetails
      ? {
          viewerCount: videoInfo.liveStreamingDetails.concurrentViewers || 0,
          chat: !!videoInfo.liveStreamingDetails.activeLiveChatId,
          ...stats,
        }
      : stats
    return result
  }

  async updateWithVideoDetails(channelName) {
    const channelFile = path.join(
      __dirname,
      "channels",
      `${channelName}.scroll`,
    )

    try {
      // Read channel file
      const content = await fs.readFile(channelFile, "utf-8")
      const particle = new Particle(content)
      const channelData = particle.toObject()
      if (!channelData.neweststream) return

      // Get video details
      const details = await this.getVideoDetails(channelData.neweststream)

      // Add video stats to channel data
      particle.set("viewCount", details.viewCount + "")
      particle.set("likeCount", details.likeCount + "")
      if (details.viewerCount) {
        particle.set("viewerCount", details.viewerCount + "")
        particle.set("chat", details.chat + "")
      }

      await fs.writeFile(channelFile, particle.toString())
    } catch (error) {
      console.error(`Error updating ${channelName}:`, error)
      throw error
    }
  }

  async fetchVideoDetails(videoId) {
    const cacheDir = path.join(__dirname, "videos")
    const cacheFile = path.join(cacheDir, `${videoId}.json`)

    try {
      // Check cache first
      try {
        const cached = await fs.readFile(cacheFile, "utf-8")
        return JSON.parse(cached)
      } catch (e) {
        // Cache miss, continue to API call
      }

      const endpoint = "https://www.googleapis.com/youtube/v3/videos"
      const params = new URLSearchParams({
        part: "liveStreamingDetails,statistics,snippet",
        id: videoId,
        key: this.apiKey,
      })

      const response = await fetch(`${endpoint}?${params}`)
      const data = await response.json()

      if (!data.items?.[0]) {
        throw new Error("Video not found")
      }

      const videoInfo = data.items[0]

      // Cache the result
      await fs.mkdir(cacheDir, { recursive: true })
      await fs.writeFile(cacheFile, JSON.stringify(videoInfo, undefined, 2))

      return videoInfo
    } catch (error) {
      console.error("Error fetching live details:", error)
      throw error
    }
  }

  async checkChannelLiveStatus(channelId) {
    const endpoint = "https://www.googleapis.com/youtube/v3/search"
    const params = new URLSearchParams({
      part: "snippet",
      channelId: channelId,
      type: "video",
      eventType: "live",
      key: this.apiKey,
    })

    try {
      const response = await fetch(`${endpoint}?${params}`)
      const data = await response.json()

      // If there are items, the channel is live
      if (data.items && data.items.length > 0) {
        const liveStream = data.items[0]
        return {
          isLive: true,
          videoId: liveStream.id.videoId,
          title: liveStream.snippet.title,
          thumbnailUrl: liveStream.snippet.thumbnails.default.url,
          startTime: liveStream.snippet.publishedAt,
        }
      }

      return {
        isLive: false,
        videoId: null,
      }
    } catch (error) {
      console.error("Error checking channel live status:", error)
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

  async channelsToNetwork(channels, name) {
    const streams = await this.fetchChannelStreams(channels)
    await this.saveNetwork(streams, name)
  }

  async saveNetwork(streams, name) {
    const filepath = path.join(
      __dirname,
      "networksCache",
      name + "Network.json",
    )
    await fs.writeFile(filepath, JSON.stringify(streams, null, 2))
    console.log(`Saved ${streams.length} streams to ${filepath}`)
  }

  async generateNetwork(query, name) {
    try {
      console.log(`Fetching '${query}'`)
      const streams = await this.fetchLiveStreams(query)
      console.log(`Saving ${streams.length} to ${name}`)
      await this.saveNetwork(streams, name)
    } catch (error) {
      console.error("Failed to fetch or save streams:", error)
      process.exit(1)
    }
  }

  async createChannelFile(videoUrl, networks = "youtube") {
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
      const scrollContent = `../channels.parsers

id ${channelHandle}
url https://www.youtube.com/@${channelHandle}
status live
channelid ${channelId}
channeltitle ${channelTitle}
networks ${networks}
neweststream ${videoId}
chat true
streamtime ${new Date().toISOString()}
`

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
