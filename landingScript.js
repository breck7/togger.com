const channels = [
  { name: "YouTube", color: "#ff0000" },
  { name: "Twitch", color: "#6441a5" },
  { name: "Warpcast", color: "#1da1f2" },
  { name: "X", color: "#1da1f2" },
];

let currentChannel = 0;

function changeChannel() {
  const channelElement = document.getElementById("channelName");
  channelElement.style.opacity = 0;

  setTimeout(() => {
    currentChannel = (currentChannel + 1) % channels.length;
    channelElement.textContent = channels[currentChannel].name;
    channelElement.style.backgroundColor = channels[currentChannel].color;
    channelElement.style.opacity = 1;
  }, 500);
}

// Initial channel set
document.getElementById("channelName").textContent = channels[0].name;
document.getElementById("channelName").style.backgroundColor =
  channels[0].color;

// Change channel every 3 seconds
setInterval(changeChannel, 3000);
