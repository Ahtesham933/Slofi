console.log("hey");
 let currentSong = new Audio();


 function formatTime(seconds) {
    seconds = Math.round(seconds);
    const minutes = Math.floor(seconds / 60); // Calculate minutes
    const remainingSeconds = seconds % 60; // Calculate remaining seconds
    // Format as MM:SS
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getsongs(){

    let a = await fetch("http://127.0.0.1:3000/Slofi/songs");
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;

    let as =  div.getElementsByTagName("a")
    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split("songs")[1]);

        }
    }
    return songs;
}
const playMusic = (track , pause=false) => {
  
    currentSong.src = "/Slofi/songs/" + track;
    if(!pause){
        currentSong.play();
        play.src = "/Slofi/assest/pause.svg"
    }
    document.querySelector(".songinfo1").innerHTML = decodeURI(track)
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00.00 / 00.00"
}
 

async function main(){

   

    // get the list of all the songs
    let songs = await getsongs()
playMusic(songs[0],true)
    // show all the songs in the playlist
    let songul =  document.querySelector(".library").getElementsByTagName("ul")[0];
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li> 
                                        <img src="https://i.scdn.co/image/ab67616d00001e02ad214fc33b05facb1e527b98" alt="">
                                        <div class="info">
                                            <div> ${song.replaceAll("%5C"," ")} </div>
                                            <div>song artists</div>
                                        </div>
                                        <img class="playnow" src="assest/play.svg" alt="">
        </li>`;        
    }

    // Attach an event listener to each song
  Array.from (document.querySelector(".library").getElementsByTagName("li")).forEach(e => {
   e.addEventListener("click",element=>{
       console.log(e.querySelector(".info").firstElementChild.innerHTML)
        playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
   })  
  })

//  Attach an event listnener to play,next and previous
play.addEventListener("click",() => {
  if(currentSong.paused){
    currentSong.play()
    play.src = "/Slofi/assest/pause.svg"
  }
  else{
    currentSong.pause()
    play.src = "/Slofi/assest/ply.svg"
  }
})
    
// listen for time update event
        currentSong.addEventListener("timeupdate",() => {
          console.log(currentSong.currentTime, currentSong.duration);
            document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
            document.querySelector(".circle").style.left =  (currentSong.currentTime / currentSong.duration)*100 + "%";
        })

        // add an event listener to seekbar
        document.querySelector(".seekbar").addEventListener("click",e => {
            let percent = (e.offsetX /e.target.getBoundingClientRect().width)*100;
         document.querySelector(".circle").style.left = percent +"%";
        currentSong.currentTime = ((currentSong.duration)*percent)/100
        })

    // audio.addEventListener("loadeddata",() => {
    //   let duration = audio.duration;
    //   console.log(audio.duration , audio.currentSrc,audio.currentTime)
    // });

}
main()