import { YouTubeFeed } from "./youtube.mjs"

const apiKey = "AIzaSyAy0N613PtrIohnjsXOn3kqbRxa5M5mdRQ"
const yt = new YouTubeFeed(apiKey)
const main = () => {}

const channels = [
	"theprimetimeagen",
	"webcamsydney",
	"webcamgreece",
	"visitleavenworthwa",
	"virtualrailfan",
	"useip",
	"tvltrzcianka1",
	"therealsamuiwebcam",
	"theprimetimeagen",
	"teleportcamera",
	"streamtimelive",
	"solentships",
	"seejamaica",
	"rachelapm",
	"omglivetv1",
	"nasaspaceflight",
	"mariadeseo3191",
	"marekrogalski",
	"leviskiresort",
	"homewebserver",
	"hollywoodflch78",
	"flightfocus365",
	"faceprep",
	"explorelivenaturecams",
	"earthtv",
	"earthcam",
	"cornellbirdcams",
	"brisbanelivestream",
	"birderking",
	"alpinelodgingtelluride",
	"airlinerslive",
	"aesignage",
	"UCy6A4u_9X_FyN3DZMLtwjUg",
	"UCwobzUc3z",
	"UCuPkgKp2",
	"UCpDqi4cjYZ0UZYr_1Odhavg",
	"UCnLjr0czO5zPsJYubbrvHCw",
	"UCmla4OjsAqsyAbjS5XYqfPg",
	"UCmGU7IuCWuFRhM8WXvOEM4A",
	"UClBrT0ADeJnemAyp2EbzVFw",
	"UCkFeoNSqYTa7trn75WM9tsg",
	"UCjzHeG1KWoonmf9d5KBvSiw",
	"UChs0pSaEoNLV4mevBFGaoKA",
	"UChIv2ovrTHbZDDIaLFR9P",
	"UCetYFjkhf7S7LwiuJxeC28g",
	"UCeTVoczn9NOZA9blls3YgUg",
	"UCdsNEJzi7vGVL0k1YDe2znA",
	"UCdRNCCz2FDwE7svh7sDuc2Q",
	"UCbprhISv",
	"UCb1ANUIW7arUUDI",
	"UCaG0IHN1RMOZ4",
	"UCZvXaNYIcapCEcaJe_2cP7A",
	"UCZR3",
	"UCXbXfisDHV_gDjawCKTyTIw",
	"UCX4sShAQf01LYjYQhG2ZgKg",
	"UCVX_4LoUm4mdZBPdpMJkkSQ",
	"UCUc8mpd7aQROHAb",
	"UCSJ4gkVC6NrvII8umztf0Ow",
	"UCSFB7Xy5Fa1pVVKP_CajIrw",
	"UCOVcAiUMS7RZ6RVUcrwAYXA",
	"UCNlfGuzOAKM1sycPuM_QTHg",
	"UCMv1mrz",
	"UCLA_DiR1FfKNvjuUpBHmylQ",
	"UCKvKjZ3l9azWz4F49q2R3tQ",
	"UCJhjE7wbdYAae1G25m0tHAA",
	"UCJ35n3ueAN0cWvQqKptu",
	"UCGjd2P9By_xh0",
	"UCFzph9x",
	"UCFjM4SzH8zAvsC0azlStgaw",
	"UCEyDPrWKqwWORC6TFTo4a",
	"UCCHrTE",
	"UC9",
	"UC8gbWbcNNyb5",
	"UC6Q2ZkwzOjbeMEhLJNpZKaA",
	"UC5Sl4VbJELXi9SCaWbTdXfA",
	"UC4L",
	"UC3EsPQp04deLlxQxc2b2__g",
	"UC14ap4T608Zz_Mz4eezhIqw",
	"wolfofbaystreet",
	"robingaming88",
	"rawstartup",
	"programmer",
	"piratesoftware",
	"okbangershow",
	"netfoundation",
	"nature",
	"namibiacam",
	"montereybayaquarium",
	"magnimindacademy",
	"losfomos",
	"kabukistarship",
	"gmfarcaster",
	"farcasterxyz",
	"exploreoceans",
	"explorebears",
	"exploreafrica",
	"dumdummakegame",
	"davidconnelly",
	"crypto_wenmoon",
	"chrisgo",
	"buenasnochesfarcaster",
	"breckyunits",
	"bigbadbench",
	"ambientcinematics",
	"UCwqusr8YDwM",
	"UCuJMRZh0c4jaQsE7IYpAqUA",
	"UCsBjURrPoezykLs9EqgamOA",
	"UCqrILQNl5Ed9Dz6CGMyvMTQ",
	"UCoOu4D7foJWfKvcDLxqrF2Q",
	"UCnejwhgQB5D_H7envJJgbXQ",
	"UCmYuOrhYCw5K02OTuXTKGcA",
	"UCjkLYVF8Up8zt9ZQNLpR_TQ",
	"UCSJbGtTlrDami",
	"UCLNgu_OupwoeESgtab33CCw",
	"UC9Yp2yz6",
	"UC9OM",
	"UC8butISFwT",
	"UC4JX40jDee_tINbkjycV4Sg",
	"UC46wWUso9H5KPQcoL9iE3Ug",
	"UC2D6eRvCeMtcF5OGHf1",
	"UC29ju8bIPH5as8OGnQzwJyA",
	"UC1fLEeYICmo3O9cUsqIi7HA",
	"UC0e3QhIYukixgh5VVpKHH9Qyt",
]

async function updateMultipleChannels() {
	for (const channel of channels) {
		try {
			await yt.updateWithVideoDetails(channel)
			console.log(`Updated ${channel}`)
			await new Promise((resolve) => setTimeout(resolve, 2000))
		} catch (error) {
			console.error(`Failed to update ${channel}:`, error)
		}
	}
}

updateMultipleChannels()
