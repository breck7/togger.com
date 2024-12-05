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

const data = `https://www.youtube.com/watch?v=h-Z0wCdD3dI
https://www.youtube.com/watch?v=BCOa_uKBp7M
https://www.youtube.com/watch?v=dlP_vzAxX_8
https://www.youtube.com/watch?v=1DaYe-1TkmM
https://www.youtube.com/watch?v=QdEVb1rheRE
https://www.youtube.com/watch?v=cWzkAHB1kT8
https://www.youtube.com/watch?v=Ut-MfD7PasA
https://www.youtube.com/watch?v=QF2ojZmSTWs
https://www.youtube.com/watch?v=V5RfI6dXZgY
https://www.youtube.com/watch?v=fvgCDd77DQg
https://www.youtube.com/watch?v=8YhfFtieMVU
https://www.youtube.com/watch?v=8LUUprI12uU
https://www.youtube.com/watch?v=2XNfZ4dTuR4
https://www.youtube.com/watch?v=8se0AsNINf4
https://www.youtube.com/watch?v=f0GCw0Lt_7U`

data.split("\n").forEach((url) => yt.createChannelFile(url, "dogs"))
