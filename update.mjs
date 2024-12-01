import { readdir, readFile } from "fs/promises"
import path from "path"
import { YouTubeFeed } from "./youtube.mjs"

const apiKey = "AIzaSyAy0N613PtrIohnjsXOn3kqbRxa5M5mdRQ"
const yt = new YouTubeFeed(apiKey)

// Generate initial jams
async function generateInitialJams() {
	await yt.generateJam("live -bot -lofi", "general")
	await yt.generateJam("live ambient music", "ambience")
	await yt.generateJam("live -bot science", "science")
}

// Process existing jam files
async function processJamFiles() {
	try {
		const jamDir = path.join(__dirname, "jams")
		const files = await readdir(jamDir)

		// Filter for .scroll files
		const scrollFiles = files.filter((file) => file.endsWith(".scroll"))

		// Process each file
		for (const file of scrollFiles) {
			const filePath = path.join(jamDir, file)
			const content = await readFile(filePath, "utf8")
			const lines = content.split("\n").filter((line) => line.trim()) // Remove empty lines

			// Get jam name from filename (remove .scroll extension)
			const jamName = path.basename(file, ".scroll")

			// Process the channels
			await yt.channelsToJam(lines, jamName)
		}
	} catch (error) {
		console.error("Error processing jam files:", error)
		throw error
	}
}

// Main execution
async function main() {
	try {
		await generateInitialJams()
		await processJamFiles()
		console.log("Successfully processed all jams")
	} catch (error) {
		console.error("Error in main execution:", error)
		process.exit(1)
	}
}

// main()
