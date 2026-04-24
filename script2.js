console.log("hey");

let currentSong = new Audio();
let play = document.querySelector(".play"); // make sure this exists in HTML

function formatTime(seconds) {
    seconds = Math.round(seconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getsongs() {

    let a = await fetch("http://127.0.0.1:3000/Slofi/songs");
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    let songs = [];

    for (let element of as) {
        if (element.href.endsWith(".mp3")) {

            let track = element.href.split("/songs/")[1];

            // clean unwanted characters
            track = decodeURIComponent(track).replaceAll("\\", "");

            songs.push(track); // keep original filename
        }
    }

    return songs;
}

const playMusic = (track, pause = false) => {

    currentSong.src = "/Slofi/songs/" + track;

    if (!pause) {
        currentSong.play();
    }

    play.src = "/Slofi/assest/pause.svg";

    // show clean name (without .mp3)
    let cleanName = decodeURIComponent(track).replace(".mp3", "");

    document.querySelector(".songinfo").innerHTML = cleanName;
    document.querySelector(".songinfo1").innerHTML = cleanName;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function main() {

    let songs = await getsongs();

    // load first song (paused)
    playMusic(songs[0], true);

    let songul = document.querySelector(".library ul");

    // render song list
    for (const song of songs) {

        let cleanName = decodeURIComponent(song).replace(".mp3", "");

        songul.innerHTML += `
        <li data-track="${song}">
            <img src="https://i.scdn.co/image/ab67616d00001e02ad214fc33b05facb1e527b98">
            <div class="info">
                <div>${cleanName}</div>
                <div>song artists</div>
            </div>
            <img class="playnow" src="assest/play.svg">
        </li>`;
    }

    // click event (FIXED)
    Array.from(document.querySelectorAll(".library li")).forEach(e => {
        e.addEventListener("click", () => {
            let track = e.dataset.track;
            playMusic(track);
        });
    });

    // play / pause button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/Slofi/assest/pause.svg";
        } else {
            currentSong.pause();
            play.src = "/Slofi/assest/play.svg";
        }
    });

    // update time
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
    });
}

main();