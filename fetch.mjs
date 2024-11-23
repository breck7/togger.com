import { YouTubeFeed } from "./youtube.mjs"

const yt = new YouTubeFeed("AIzaSyAy0N613PtrIohnjsXOn3kqbRxa5M5mdRQ")

// yt.generateCollection("live -bot -lofi", "general")
// yt.generateCollection("coding programming live -bot -lofi -music", "coding")
// yt.generateCollection("live ambient music", "ambience")
yt.generateCollection("live -bot science", "science")

const channelUrls = [
	"https://www.youtube.com/@okbangershow",
	"https://www.youtube.com/@GMFarcaster",
	"https://www.youtube.com/@breckyunits",
	"https://www.youtube.com/@Crypto_WenMoon",
	"https://www.youtube.com/@BuenasNochesFarcaster",
	"https://www.youtube.com/channel/UCZ8MI1slzXKUv9fb0I9Ho2A",
	"https://www.youtube.com/@LosFomos",
	"https://www.youtube.com/@chrisgo",
	// Add more channel URLs here
]
// yt.channelsToCollection(channelUrls, "warpcast")
