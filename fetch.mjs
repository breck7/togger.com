import { YouTubeFeed } from "./youtube.mjs"

const yt = new YouTubeFeed("AIzaSyAy0N613PtrIohnjsXOn3kqbRxa5M5mdRQ")

// yt.generateCollection("live -bot -lofi", "general")
// yt.generateCollection("coding programming live -bot -lofi -music", "coding")
// yt.generateCollection("live ambient music", "ambience")
// yt.generateCollection("live -bot science", "science")

const channelUrls = [
	"https://www.youtube.com/@okbangershow",
	"https://www.youtube.com/@GMFarcaster",
	"https://www.youtube.com/@breckyunits",
	"https://www.youtube.com/@Crypto_WenMoon",
	"https://www.youtube.com/@BuenasNochesFarcaster",
	"https://www.youtube.com/channel/UCZ8MI1slzXKUv9fb0I9Ho2A",
	"https://www.youtube.com/@LosFomos",
	"https://www.youtube.com/@chrisgo",
	"https://www.youtube.com/@wolfofbaystreet",
	// Add more channel URLs here
]
yt.channelsToCollection(channelUrls, "warpcast")

const codingChannels = `https://www.youtube.com/@theprimeagen
https://www.youtube.com/@CodeWithChris
https://www.youtube.com/@CodingGarden
https://www.youtube.com/@Fireship
https://www.youtube.com/@TraversyMedia
https://www.youtube.com/@Academind
https://www.youtube.com/@ChrisCourses
https://www.youtube.com/@TechWithTim
https://www.youtube.com/@CodeBullet
https://www.youtube.com/@freeCodeCamp
https://www.youtube.com/@JomaTech
https://www.youtube.com/@CleverProgrammer
https://www.youtube.com/@NickWhite
https://www.youtube.com/@CodingPhase`.split(" ")
// yt.channelsToCollection(codingChannels, "coding")
