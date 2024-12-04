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

const data = `https://www.youtube.com/watch?v=qtsseQlQAQU hawaii
https://www.youtube.com/watch?v=eBNyINb-Be4 hawaii
https://www.youtube.com/watch?v=v__fW5SNHbM hawaii
https://www.youtube.com/watch?v=nnwoTyifNX0 hawaii
https://www.youtube.com/watch?v=I7RX845TRq8 hawaii
https://www.youtube.com/watch?v=t_H2ge2SmMs hawaii
https://www.youtube.com/watch?v=VI8Wj5EwoRM hawaii
https://www.youtube.com/watch?v=6g4Fh8K-MhY hawaii
https://www.youtube.com/watch?v=IG-O-VHoojU hawaii
https://www.youtube.com/watch?v=3ATYHKN2hIg hawaii
https://www.youtube.com/watch?v=WTy3dGhGBOY hawaii
https://www.youtube.com/watch?v=hPvl6IACa2k hawaii
https://www.youtube.com/watch?v=QUq9rZ9YgHk hawaii
https://www.youtube.com/watch?v=24tevIqjArw hawaii`

const add = data.split("\n").forEach((line) => {
	const [url, jams] = line.split(" ")
	yt.createChannelFile(url, jams)
})
