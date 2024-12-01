import { readdir, readFile } from "fs/promises"
import path from "path"
import { YouTubeFeed } from "./youtube.mjs"

const apiKey = "AIzaSyAy0N613PtrIohnjsXOn3kqbRxa5M5mdRQ"
const yt = new YouTubeFeed(apiKey)

// Generate initial networks
async function generateInitialNetworks() {
	await yt.generateNetwork("live -bot -lofi", "general")
	await yt.generateNetwork("live ambient music", "ambience")
	await yt.generateNetwork("live -bot science", "science")
}

// Process existing network files
async function processNetworkFiles() {
	try {
		const networkDir = path.join(__dirname, "networks")
		const files = await readdir(networkDir)

		// Filter for .scroll files
		const scrollFiles = files.filter((file) => file.endsWith(".scroll"))

		// Process each file
		for (const file of scrollFiles) {
			const filePath = path.join(networkDir, file)
			const content = await readFile(filePath, "utf8")
			const lines = content.split("\n").filter((line) => line.trim()) // Remove empty lines

			// Get network name from filename (remove .scroll extension)
			const networkName = path.basename(file, ".scroll")

			// Process the channels
			await yt.channelsToNetwork(lines, networkName)
		}
	} catch (error) {
		console.error("Error processing network files:", error)
		throw error
	}
}

// Main execution
async function main() {
	try {
		await generateInitialNetworks()
		await processNetworkFiles()
		console.log("Successfully processed all networks")
	} catch (error) {
		console.error("Error in main execution:", error)
		process.exit(1)
	}
}

// main()
