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

const data = `https://www.youtube.com/watch?v=xY6_wqhRaos cooking
https://www.youtube.com/watch?v=3eVIAQNB6Tw cooking
https://www.youtube.com/watch?v=4hV2qN1Tv68 cooking
https://www.youtube.com/watch?v=cUsUt22PFwo cooking
https://www.youtube.com/watch?v=SlXIk08_yTs cooking
https://www.youtube.com/watch?v=n3Ty7hHcl-c cooking
https://www.youtube.com/watch?v=O7xSkdyEzzU cooking
https://www.youtube.com/watch?v=1nDscSiGrBE cooking`

const add = data.split("\n").forEach((line) => {
	const [url, networks] = line.split(" ")
	yt.createChannelFile(url, networks)
})
