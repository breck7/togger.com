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

const data = `https://www.youtube.com/watch?v=ydYDqZQpim8 worldcams
https://www.youtube.com/watch?v=gU6XGPaFL1s worldcams
https://www.youtube.com/watch?v=F5Q5ViU8QR0 worldcams
https://www.youtube.com/watch?v=8Et9fVZld7E worldcams
https://www.youtube.com/watch?v=cmkAbDUEoyA worldcams
https://www.youtube.com/watch?v=REW9Gr9K4b0 worldcams
https://www.youtube.com/watch?v=e2gC37ILQmk worldcams
https://www.youtube.com/watch?v=AZUT3PU7sqs worldcams
https://www.youtube.com/watch?v=u4UZ4UvZXrg worldcams
https://www.youtube.com/watch?v=LwihxyJ4V20 worldcams
https://www.youtube.com/watch?v=5uZa3-RMFos worldcams
https://www.youtube.com/watch?v=TmtVbezZaqg worldcams
https://www.youtube.com/watch?v=mhJRzQsLZGg worldcams
https://www.youtube.com/watch?v=fIMbMz2P7Bs worldcams
https://www.youtube.com/watch?v=XF6YDqccSsg worldcams
https://www.youtube.com/watch?v=3LXQWU67Ufk worldcams
https://www.youtube.com/watch?v=1BeaYMK9s6Y worldcams
https://www.youtube.com/watch?v=yFgVmioYkys worldcams
https://www.youtube.com/watch?v=Fw9hgttWzIg worldcams
https://www.youtube.com/watch?v=hRJVykzy78g worldcams
https://www.youtube.com/watch?v=jtvmwjzZY0c worldcams
https://www.youtube.com/watch?v=41dve_9EfyI worldcams
https://www.youtube.com/watch?v=976UrL4MWTA worldcams
https://www.youtube.com/watch?v=OFCwQdUWsu4 worldcams
https://www.youtube.com/watch?v=5ytYnx93bXs worldcams
https://www.youtube.com/watch?v=XBLX-zkZlaI worldcams`

const add = data.split("\n").forEach((line) => {
	const [url, collections] = line.split(" ")
	yt.createChannelFile(url, collections)
})
