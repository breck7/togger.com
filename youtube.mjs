import fs from "fs/promises"

// https://developers.google.com/youtube/v3/docs/search

class YouTubeFeed {
  async fetchLiveStreams(apiKey, maxResults = 100) {
    const endpoint = "https://www.googleapis.com/youtube/v3/search"
    const params = new URLSearchParams({
      part: "snippet",
      eventType: "live",
      type: "video",
      maxResults: maxResults,
      key: apiKey,
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
}

async function main() {
  const apiKey =
    process.env.YOUTUBE_API_KEY || "AIzaSyAy0N613PtrIohnjsXOn3kqbRxa5M5mdRQ"
  if (!apiKey) {
    console.error("Please set YOUTUBE_API_KEY environment variable")
    process.exit(1)
  }

  const feed = new YouTubeFeed()
  try {
    const streams = await feed.fetchLiveStreams(apiKey)
    await fs.writeFile("youtubeNow.json", JSON.stringify(streams, null, 2))
    console.log(`Saved ${streams.length} streams to youtube.json`)
  } catch (error) {
    console.error("Failed to fetch or save streams:", error)
    process.exit(1)
  }
}

main()
