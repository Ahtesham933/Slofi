console.log("hey");
let currentSong = new Audio();
let songs = [];
let currFolder;


function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

async function getsongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");
  songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];

    if (element.href.endsWith(".mp3")) {
      let decoded = decodeURIComponent(element.href);
      let filename = decoded.split(/[\\/]/).slice(-1)[0];
      songs.push(filename);
    }
  }
  // show all the songs in the playlist
  let songul = document.querySelector(".library").getElementsByTagName("ul")[0];
  songul.innerHTML = ""

  for (const song of songs) {
    let li = document.createElement("li");
    li.dataset.song = song; // ✅ store clean filename in data attribute
    li.innerHTML = `
      <img src="https://i.scdn.co/image/ab67616d00001e02ad214fc33b05facb1e527b98" alt="">
      <div class="info">
          <div>${song.replace(".mp3", "")}</div>
          <div>song artists</div>
      </div>
      <img class="playnow" src="assest/play.svg" alt="">
    `;
    songul.appendChild(li);
  }

  // Attach an event listener to each song
  Array.from(
    document.querySelector(".library").getElementsByTagName("li"),
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
       playMusic(e.dataset.song);
    });
  });
}
const playMusic = (track, pause = false) => {
  currentSong.src = `http://127.0.0.1:3000/${currFolder}/` + encodeURIComponent(track);
  if (!pause) {
    currentSong.play();
    play.src = "/Slofi/assest/pause.svg";
  }
  let displayName = track.replace(".mp3","")
  document.querySelector(".songinfo1").innerHTML = displayName;
  document.querySelector(".songinfo").innerHTML = displayName;
  document.querySelector(".songtime").innerHTML = "00.00 / 00.00";
};

async function displayAlbums() {
 let a = await fetch(`http://127.0.0.1:3000/Slofi/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
 
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  cardContainer.innerHTML = ""; // clear first
 
  for (const element of Array.from(anchors)) {
    // Only process the backslash-encoded folder links
    if (!element.href.includes("%5C")) continue;
 
    let decoded = decodeURIComponent(element.href).replace(/\\/g, "/");
    let parts = decoded.split("/").filter(Boolean);
    let folder = parts.slice(-1)[0]; // ✅ clean folder name e.g. "ncs" or "cs"
 
    if (!folder) continue;
 
    try {
      let infoRes = await fetch(`http://127.0.0.1:3000/Slofi/songs/${folder}/info.json`);
      if (!infoRes.ok) continue;
      let info = await infoRes.json();
 
      // ✅ data-folder uses the real folder variable, not hardcoded "cs"
      cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card bg-grey">
          <div class="play">
            <img src="assest/play.svg" alt="">
          </div>
          <img class="rounded" src="/Slofi/songs/${folder}/cover.jpg" alt="">
          <h2>${info.title}</h2>
          <p>${info.description}</p>
        </div>`;
    } catch (err) {
      console.error(`Error loading ${folder}:`, err);
    }
  }

    // load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async () => {
       await getsongs(`Slofi/songs/${e.dataset.folder}`);
       playMusic(songs[0])
    });
  });

}

async function main() {
  // get the list of all the songs
  await getsongs("/Slofi/songs/ncs");
  playMusic(songs[0], true);
  
  
  // Display all the Albumson the page
  displayAlbums()

  //  Attach an event listnener to play,pause
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/Slofi/assest/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/Slofi/assest/ply.svg";
    }
  });

  // listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML =
      `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  // Add an event listener for close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  //  Attach an event listnener to next and previous
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0){
         document.querySelector(".volume img").src = document.querySelector(".volume img").src.replace("mute.svg","volume.svg")
      }
    });

    // Add event listener to mute the track
    document.querySelector(".volume img").addEventListener("click",e => {
    
      if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg","mute.svg")
        currentSong.volume = 0;
         document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } 
        else{
          e.target.src = e.target.src.replace("mute.svg","volume.svg")
          currentSong.volume = 0.10;
          document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
      }
    })
  
}
main();
