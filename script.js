console.log("hey");


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



getsongs()

async function main(){
    // get the list of all the songs
    let songs = await getsongs()

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

    // // play the 1st song
    // var audio = new Audio(songs[0]);
    // audio.play();
    
    
    audio.addEventListener("loadeddata",() => {
      let duration = audio.duration;
      console.log(audio.duration , audio.currentSrc,audio.currentTime)
    });

}
main()