import { readdir, readFile } from "fs/promises"
import path from "path"
import { YouTubeFeed } from "./youtube.mjs"

const apiKey = "AIzaSyAy0N613PtrIohnjsXOn3kqbRxa5M5mdRQ"
const yt = new YouTubeFeed(apiKey)

// Generate initial collections
async function generateInitialCollections() {
	await yt.generateCollection("live -bot -lofi", "general")
	await yt.generateCollection("live ambient music", "ambience")
	await yt.generateCollection("live -bot science", "science")
}

// Process existing collection files
async function processCollectionFiles() {
	try {
		const collectionDir = path.join(__dirname, "collections")
		const files = await readdir(collectionDir)

		// Filter for .scroll files
		const scrollFiles = files.filter((file) => file.endsWith(".scroll"))

		// Process each file
		for (const file of scrollFiles) {
			const filePath = path.join(collectionDir, file)
			const content = await readFile(filePath, "utf8")
			const lines = content.split("\n").filter((line) => line.trim()) // Remove empty lines

			// Get collection name from filename (remove .scroll extension)
			const collectionName = path.basename(file, ".scroll")

			// Process the channels
			await yt.channelsToCollection(lines, collectionName)
		}
	} catch (error) {
		console.error("Error processing collection files:", error)
		throw error
	}
}

// Main execution
async function main() {
	try {
		await generateInitialCollections()
		await processCollectionFiles()
		console.log("Successfully processed all collections")
	} catch (error) {
		console.error("Error in main execution:", error)
		process.exit(1)
	}
}

// main()
