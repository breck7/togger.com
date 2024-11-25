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

const data = `https://www.youtube.com/watch?v=w9yFVxLFAEg coding
https://www.youtube.com/watch?v=XG9NN-yDlxQ coding
https://www.youtube.com/watch?v=OO3O-aYwdAw coding`

const add = data.split("\n").forEach((line) => {
	const [url, collections] = line.split(" ")
	yt.createChannelFile(url, collections)
})
