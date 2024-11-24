const fs = require("fs").promises
const path = require("path")

async function cleanChannelName(url, channelId) {
    // Extract username from URL if it exists
    const usernameMatch = url.match(/@([a-zA-Z0-9_-]+)/)
    return usernameMatch ? usernameMatch[1].toLowerCase() : channelId
}

async function splitIntoBlocks(content) {
    // Split on double newlines and filter out empty blocks
    return content
        .split("\n\n")
        .map((block) => block.trim())
        .filter((block) => block)
}

function parseBlock(block) {
    const data = {}
    const lines = block.split("\n")

    for (const line of lines) {
        if (line.trim()) {
            const [key, ...valueParts] = line.split(" ")
            const value = valueParts.join(" ")
            if (value) {
                data[key] = value
            }
        }
    }

    return data
}

async function writeChannelFile(blockData, outputDir) {
    try {
        // Create channels directory if it doesn't exist
        await fs.mkdir(outputDir, { recursive: true })

        // Get channel identifier
        const channelId = await cleanChannelName(
            blockData.url || "",
            blockData.channelid || "",
        )

        // Create file path
        const filePath = path.join(outputDir, `${channelId}.scroll`)

        // Convert block data back to string format
        const content = Object.entries(blockData)
            .map(([key, value]) => `${key} ${value}`)
            .join("\n")

        // Write to file
        await fs.writeFile(filePath, content)
        console.log(`Created file: ${filePath}`)
    } catch (error) {
        console.error(`Error writing file for channel: ${error.message}`)
    }
}

async function processFile(inputFile) {
    try {
        // Read input file
        const content = await fs.readFile(inputFile, "utf8")

        // Split into blocks
        const blocks = await splitIntoBlocks(content)

        // Process each block
        for (const block of blocks) {
            const blockData = parseBlock(block)
            await writeChannelFile(blockData, "channels")
        }

        console.log("Processing complete!")
    } catch (error) {
        console.error(`Error processing file: ${error.message}`)
    }
}

// Run the script
processFile("data.scroll")
