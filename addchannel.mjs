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

const data = `https://www.youtube.com/watch?v=-m_nQT62B4Y
https://www.youtube.com/watch?v=o8YhyLb__cI
https://www.youtube.com/watch?v=n_cjSaNKyFE
https://www.youtube.com/watch?v=vXSuof3x_3Q
https://www.youtube.com/watch?v=R7vrbiDi0Tc
https://www.youtube.com/watch?v=jCCy4UDqQlo
https://www.youtube.com/watch?v=5ZW9jFYxpCI
https://www.youtube.com/watch?v=PdDMaH27fcA
https://www.youtube.com/watch?v=m4bzhZWBTs4
https://www.youtube.com/watch?v=vNktS9YeO2Y`

data.split("\n").forEach((url) => yt.createChannelFile(url, "cats"))
