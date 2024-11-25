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

const data = `https://www.youtube.com/watch?v=F0GOOP82094 nature
https://www.youtube.com/watch?v=DHUnz4dyb54 nature
https://www.youtube.com/watch?v=oI8R4_UG3Fs nature
https://www.youtube.com/watch?v=3szkFHfr6sA nature
https://www.youtube.com/watch?v=jzx_n25g3kA nature
https://www.youtube.com/watch?v=RnCAl0mQgqA nature
https://www.youtube.com/watch?v=dIChLG4_WNs nature
https://www.youtube.com/watch?v=OMlf71t2oV0 nature
https://www.youtube.com/watch?v=x10vL6_47Dw nature
https://www.youtube.com/watch?v=yPSYdCWRWFA nature
https://www.youtube.com/watch?v=56WBs0A4Kng nature
https://www.youtube.com/watch?v=DAmFZj1y_a0 nature
https://www.youtube.com/watch?v=RmmAzrAkKqI nature
https://www.youtube.com/watch?v=yfSyjwY6zSQ nature
https://www.youtube.com/watch?v=dqbPOGv3MrY nature`

const add = data.split("\n").forEach((line) => {
	const [url, collections] = line.split(" ")
	yt.createChannelFile(url, collections)
})
