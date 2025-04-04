async function getSongs() {
    let a= await fetch("http://127.0.0.1:3000/assets/Songs/")
    let response = await a.text()
    let elements = document.createElement('div')
    elements.innerHTML = response
    let as = elements.getElementsByTagName('a')
    let songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/Songs/")[1])
        }
    }
    return songs

}
async function main(){

    let songs = await getSongs()
    let songUL= document.querySelector(".songList").getElementsByTagName('ul')[0]
    for (const song of songs) {
        // `<li>${song.replaceAll("%20"," ")}</li> `
        songUL.innerHTML = songUL.innerHTML + `
        <li>
                            <img class="musicImage" src="assets/svg/music.svg" alt="" srcset="">
                            <div class="info">
                            ${song.replaceAll("%20"," ")}
                            </div>
                            <div class="playNow">
                                <span>Play Now</span>
                                <img clas src="assets/svg/play.svg" alt="">
                            </div>
                        </li>
        `
    }
}
main()