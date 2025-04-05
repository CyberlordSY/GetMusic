let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMS(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let secondsLeft = Math.floor(seconds % 60);

    let hh = String(hours).padStart(2, '0');
    let mm = String(minutes).padStart(2, '0');
    let ss = String(secondsLeft).padStart(2, '0');

    return hours > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
}

async function getSongs(folder) {
    currFolder = folder;
    const encodedFolder = encodeURIComponent(folder).replace(/%2F/g, '/');
    let a = await fetch(`http://127.0.0.1:3000/assets/${encodedFolder}/`);
    let response = await a.text();

    let elements = document.createElement('div');
    elements.innerHTML = response;

    let as = elements.getElementsByTagName('a');
    songs = [];

    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            let fileName = element.href.split(`/${encodedFolder}/`)[1];
            if (fileName) songs.push(decodeURIComponent(fileName));
        }
    }

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = ""; // Clear any existing items

    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img class="musicImage" src="assets/svg/music.svg" alt="">
                <div class="info">${song}</div>
                <div class="playNow">
                    <img src="assets/svg/play.svg" alt="">
                </div>
            </li>
        `;
    }

    Array.from(document.querySelectorAll(".songList li")).forEach(e => {
        e.addEventListener("click", () => {
            const songName = e.querySelector(".info").innerText.trim();
            if (songName && songName !== "undefined") {
                playMusic(songName);
            }
        });
    });

    return songs;
}

// ⬇️ FIXED: Play function moved outside so it’s accessible globally
function playMusic(song, pause = false) {
    if (!song || song === "undefined") {
        console.warn("Attempted to play an invalid song:", song);
        return;
    }

    currentSong.pause();
    const encodedSong = encodeURIComponent(song);
    const encodedFolder = encodeURIComponent(currFolder).replace(/%2F/g, '/');

    currentSong.src = `/assets/${encodedFolder}/${encodedSong}`;
    document.querySelector(".songinfo").innerHTML = song;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";

    if (!pause) {
        const playHandler = () => {
            currentSong.play().then(() => {
                play.src = "assets/svg/pause.svg";
            }).catch((e) => {
                console.error("Play failed:", e);
            });
            currentSong.removeEventListener('canplay', playHandler);
        };
        currentSong.addEventListener('canplay', playHandler);
    }
}


async function dispalyAllumbs() {
    let a = await fetch(`http://127.0.0.1:3000/assets/Songs/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let anchors = div.getElementsByTagName('a');
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/Songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            let a = await fetch(`http://127.0.0.1:3000/assets/Songs/${folder}/info.json`);
            let response = await a.json();
            folder = folder.replace(/%20/g, " ");
            
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="assets/svg/playButton.svg" alt="">
                        </div>
                        <img class="cardimage" src="/assets/Songs/${folder}/${response.cover}" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            play.src = "assets/svg/play.svg";
            const folder = `Songs/${item.currentTarget.dataset.folder}`;
            await getSongs(folder);
            if (songs.length > 0) playMusic(songs[0], true);
        });
    });

}




async function main() {

    dispalyAllumbs();

    await getSongs("Songs/3 Idiots");

    if (songs.length > 0) {
        playMusic(songs[0], true);
    }

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "assets/svg/pause.svg";
        } else {
            currentSong.pause();
            play.src = "assets/svg/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        if (currentSong.duration) {
            document.querySelector(".songtime").innerHTML = `${secondsToMS(currentSong.currentTime)}/${secondsToMS(currentSong.duration)}`;
            document.querySelector(".circle").style.left = `${((currentSong.currentTime / currentSong.duration) * 99.5 - 0.5)}%`;
        }
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const rect = document.querySelector(".seekbar").getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percentage = (x / width) * 100;
        document.querySelector(".circle").style.left = `${percentage}%`;
        currentSong.currentTime = (percentage / 100) * currentSong.duration;
    });

    prev.addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });


}

main(); // ✅ CALL THE MAIN FUNCTION
