import { YouTubeFeed } from "./youtube.mjs"

const apiKey = "AIzaSyAy0N613PtrIohnjsXOn3kqbRxa5M5mdRQ"
const yt = new YouTubeFeed(apiKey)

const main = async () => {
	// Get the video URL from command line arguments
	const videoUrl = process.argv[2]

	if (!videoUrl) {
		console.error("Please provide a YouTube video URL as an argument")
		process.exit(1)
	}

	try {
		await yt.createChannelFile(videoUrl)
		console.log("Channel file created successfully")
	} catch (error) {
		console.error("Error creating channel file:", error.message)
		process.exit(1)
	}
}

const data = `https://www.youtube.com/watch?v=j0tSX670u24 horoscopes
https://www.youtube.com/watch?v=jJA6kyLBUPM horoscopes
https://www.youtube.com/watch?v=kD7w3Aa_zy4 horoscopes
https://www.youtube.com/watch?v=YqTJouFhDjg horoscopes
https://www.youtube.com/watch?v=IeV1tqnZw5A horoscopes`

const add = data.split("\n").forEach((line) => {
	const [url, networks] = line.split(" ")
	yt.createChannelFile(url, networks)
})
