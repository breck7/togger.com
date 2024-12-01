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

const data = `https://www.youtube.com/watch?v=YNQrxMbU0-s fortnite
https://www.youtube.com/watch?v=FanNoQg06w0 fortnite
https://www.youtube.com/watch?v=_DvwMctBprc fortnite
https://www.youtube.com/watch?v=wc9On7mGACk fortnite
https://www.youtube.com/watch?v=As89fqmIuoA fortnite
https://www.youtube.com/watch?v=UmPD6Moqulg fortnite
https://www.youtube.com/watch?v=3Qtuh1uWldA fortnite
https://www.youtube.com/watch?v=Z62OLrzE_tw fortnite
https://www.youtube.com/watch?v=FKuxzJbWPVg fortnite`

const add = data.split("\n").forEach((line) => {
	const [url, networks] = line.split(" ")
	yt.createChannelFile(url, networks)
})
