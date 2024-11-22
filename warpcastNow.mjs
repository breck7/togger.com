import { YouTubeFeed } from "./youtube.mjs"
import fs from "fs/promises"

const updateWarpcast = async () => {
  const channelUrls = [
    "https://www.youtube.com/@okbangershow",
    "https://www.youtube.com/@GMFarcaster",
    "https://www.youtube.com/@breckyunits",
    "https://www.youtube.com/@Crypto_WenMoon",
    "https://www.youtube.com/@BuenasNochesFarcaster",
    // Add more channel URLs here
  ]
  const feed = new YouTubeFeed("AIzaSyAy0N613PtrIohnjsXOn3kqbRxa5M5mdRQ")
  const streams = await feed.fetchChannelStreams(channelUrls)
  await fs.writeFile("warpcastNow.json", JSON.stringify(streams, null, 2))
  console.log(`Saved ${streams.length} streams to warpcastNow.json`)
}

updateWarpcast()
