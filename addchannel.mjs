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

const data = `https://www.youtube.com/watch?v=MtoVJEyCUbA ambience
https://www.youtube.com/watch?v=evTQIgdh1iw ambience
https://www.youtube.com/watch?v=USrXhhLP5nw sports
https://www.youtube.com/watch?v=3dDBGYfQy54 sports
https://www.youtube.com/watch?v=YbLZXAeXRbQ sports
https://www.youtube.com/watch?v=x8TAFQauVrU ambience
https://www.youtube.com/watch?v=pMqVjYfO_E4 ambience
https://www.youtube.com/watch?v=DuVZmuzisJo ambience
https://www.youtube.com/watch?v=nYqUJX5XDWA worldcams
https://www.youtube.com/watch?v=_a4WQ4UXZVk nature
https://www.youtube.com/watch?v=F0pZ9F3QkC0 crypto
https://www.youtube.com/watch?v=m_Fd0ojolJ4 crypto
https://www.youtube.com/watch?v=GoQVqhwOK4g crypto
https://www.youtube.com/watch?v=XW0dldugiAA crypto
https://www.youtube.com/watch?v=fFrLWCCUY68 crypto
https://www.youtube.com/watch?v=k6L3z81iVI8 crypto
https://www.youtube.com/watch?v=0KNifW3bFuc crypto
https://www.youtube.com/watch?v=Ov6oGuwIfAk crypto
https://www.youtube.com/watch?v=mxfRlpuGZ0M crypto
https://www.youtube.com/watch?v=yw_n1WW_tw0 crypto
https://www.youtube.com/watch?v=mIyiKKo4B5Q crypto
https://www.youtube.com/watch?v=V57sMSH_DJQ crypto
https://www.youtube.com/watch?v=--45Ma5vkMo crypto
https://www.youtube.com/watch?v=S-iXjKgEvbM crypto
https://www.youtube.com/watch?v=RcwWum0ae84 crypto
https://www.youtube.com/watch?v=TPaaes94bUY crypto`

const add = data.split("\n").forEach((line) => {
	const [url, networks] = line.split(" ")
	yt.createChannelFile(url, networks)
})
