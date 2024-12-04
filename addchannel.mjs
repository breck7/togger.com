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

const data = `https://www.youtube.com/watch?v=17L1ahq27ro
https://www.youtube.com/watch?v=fHb0eB9RUgA
https://www.youtube.com/watch?v=a7tE2UbyuT4
https://www.youtube.com/watch?v=liR_yBb3Afo
https://www.youtube.com/watch?v=rT7tNsEdSDg
https://www.youtube.com/watch?v=kHhUc4Qv26I
https://www.youtube.com/watch?v=we3tKZxUIDw
https://www.youtube.com/watch?v=E_m1ihDDWEs
https://www.youtube.com/watch?v=uS_RQ6b6Nmk
https://www.youtube.com/watch?v=uuulG_pE6vM`

data.split("\n").forEach((url) => yt.createChannelFile(url, "bayarea"))
