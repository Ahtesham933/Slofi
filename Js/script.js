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

function getSongMeta(url) {
  return new Promise((resolve) => {
    jsmediatags.read(url, {
      onSuccess: (tag) => {
        const { title, artist, picture } = tag.tags;
        let imageUrl = null;
        if (picture) {
          const base64 = picture.data.reduce(
            (acc, byte) => acc + String.fromCharCode(byte), ""
          );
          imageUrl = `data:${picture.format};base64,${btoa(base64)}`;
        }
        resolve({
          title: title || null,
          artist: artist || "Unknown Artist",
          imageUrl: imageUrl || null,
        });
      },
      onError: () => resolve({ title: null, artist: "Unknown Artist", imageUrl: null }),
    });
  });
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

  let songul = document.querySelector(".library").getElementsByTagName("ul")[0];
  songul.innerHTML = "";

  //  define fallbackCover here using folder
  let folderName = folder.split("/").slice(-1)[0];
  let fallbackCover = `/Slofi/songs/${folderName}/cover.jpg`;
  document.querySelector(".recent img").src = fallbackCover;
try {
  let infoRes = await fetch(`http://127.0.0.1:3000/${folder}/info.json`);
  if (infoRes.ok) {
    let info = await infoRes.json();
    document.querySelector(".albName").innerHTML =  folderName;
  }
} catch(e) {}

  for (const song of songs) {
    let li = document.createElement("li");
    li.dataset.song = song;
    li.innerHTML = `
      <img class="songcover" src="assest/music.svg" alt="">
      <div class="info">
          <div>${song.replace(".mp3", "")}</div>
          <div class="artist-name">Loading...</div>
      </div>
      <img class="playnow" src="assest/play.svg" alt="">
    `;
    songul.appendChild(li);

    //  getSongMeta is now INSIDE the for loop, so song & li are correct
    const songUrl = `http://127.0.0.1:3000/${folder}/` + encodeURIComponent(song);
    getSongMeta(songUrl).then(({ artist}) => {
      li.querySelector(".artist-name").innerHTML = artist;
    });
  }

  Array.from(
    document.querySelector(".library").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.dataset.song);
    });
  });
}

const playMusic = (track, pause = false) => {
  const songUrl = `http://127.0.0.1:3000/${currFolder}/` + encodeURIComponent(track);
  currentSong.src = songUrl;
  if (!pause) {
    currentSong.play();
    play.src = "/Slofi/assest/pause.svg";
    startVisualizer(); 
  }
  let displayName = track.replace(".mp3", "");
  document.querySelector(".songinfo").innerHTML = displayName; 
   document.querySelector(".songinfo1").innerHTML = displayName;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
  
  let folderName = currFolder.split("/").slice(-1)[0];
  let albumCover = `/Slofi/songs/${folderName}/cover.jpg`;
  document.querySelector(".recent img").src = albumCover;

  getSongMeta(songUrl).then(({ artist, imageUrl }) => {
    document.querySelector(".artist-name").innerHTML = artist;
    if (imageUrl) document.querySelector(".recent img").src = imageUrl;
  });
  
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/Slofi/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  cardContainer.innerHTML = "";

  for (const element of Array.from(anchors)) {
    let href = element.href || "";
    // Skip parent/non-folder links
    if (href.includes("?") || element.innerHTML.trim() === "../") continue;

    let decoded = decodeURIComponent(href).replace(/\\/g, "/").replace(/\/$/, "");
    let folder = decoded.split("/").filter(Boolean).slice(-1)[0];

    if (!folder || folder === "songs") continue;

    try {
      let infoRes = await fetch(`http://127.0.0.1:3000/Slofi/songs/${folder}/info.json`);
      if (!infoRes.ok) continue;
      let info = await infoRes.json();

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

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async () => {
      await getsongs(`Slofi/songs/${e.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  await getsongs("Slofi/songs/Bollywood");
  if (songs.length > 0) playMusic(songs[0], true);

  displayAlbums();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/Slofi/assest/pause.svg";
         startVisualizer(); 
    } else {
      currentSong.pause();
      play.src = "/Slofi/assest/ply.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML =
      `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
     const percent = (currentSong.currentTime / currentSong.duration) * 100;
       document.querySelector(".seekbar input").value = percent;
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
  //  Calculate percent from click position
  const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
  document.querySelector(".seekbar input").value = percent;
  currentSong.currentTime = (currentSong.duration * percent) / 100;
});

document.querySelector(".hamburger")
  .addEventListener("click", () => {
    document.querySelector(".left")
      .classList.toggle("collapsed");
  });
  let islogoshow = false
  document.querySelector(".hamburger").addEventListener("click", () => {
    islogoshow = !islogoshow 
    if(islogoshow){
      console.log("show");
      document.querySelector(".logo").style.display = "block";
      document.querySelector(".home").style.background = "black";
    }else{
      console.log("not show");
      document.querySelector(".logo").style.display = "none";
      document.querySelector(".home").style.background = "linear-gradient(to bottom right,#0f172a,#1e1b4b,#020617";
    }
    
});

  // document.querySelector(".close").addEventListener("click", () => {
  //   document.querySelector(".left").style.left = "-0%";
  // });

  previous.addEventListener("click", () => {
    //  decode src to match songs array
    let currentFile = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
    let index = songs.indexOf(currentFile);
    if (index - 1 >= 0) playMusic(songs[index - 1]);
  });

  next.addEventListener("click", () => {
    let currentFile = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
    let index = songs.indexOf(currentFile);
    if (index + 1 < songs.length) playMusic(songs[index + 1]);
  });

  document.querySelector(".range").getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume img").src =
          document.querySelector(".volume img").src.replace("mute.svg", "volume.svg");
      }
    });

  document.querySelector(".volume img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();