$(window).on("load", function() {
    $("#preloader").fadeOut(1000);
})

/* -------------------------------------------- Document -------------------------------------------- */

const elem = document.documentElement; //document
const fullScreenBtnTag = document.querySelector(".full-screen-btn");
const exitFullScreenBtnTag = document.querySelector(".exit-full-screen-btn");

// Enter full screen function
function enterFullScreen() {
    if(elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }

    fullScreenBtnTag.style.display = "none";
    exitFullScreenBtnTag.style.display = "inline";
}

// Exit full screen function
function exitFullScreen() {
    if(document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }

    fullScreenBtnTag.style.display = "inline";
    exitFullScreenBtnTag.style.display = "none";
}

/* -------------------------------------------- To-Do-List -------------------------------------------- */
const listContainerTag = document.querySelector(".list-container");
const plusBtnTag = document.querySelector(".plus-btn");

// Create to-do-list

newlist();

function newlist() {

    const taskListTag = document.createElement("li");
    taskListTag.classList.add("task-list");
    listContainerTag.append(taskListTag);

    const checkboxTag = document.createElement("input");
    checkboxTag.id="checkbox";
    checkboxTag.type="checkbox";
    taskListTag.append(checkboxTag);

    const taskLableContainerTag = document.createElement("div");
    taskLableContainerTag.classList.add("task-lable-container");
    taskListTag.append(taskLableContainerTag);

    const taskInputTag = document.createElement("input");
    taskInputTag.classList.add("task-input");
    taskInputTag.placeholder="Task";
    taskInputTag.type="text";
    taskLableContainerTag.append(taskInputTag);

    const taskBtnsContainer = document.createElement("div");
    taskBtnsContainer.classList.add("task-btns-container");
    taskLableContainerTag.append(taskBtnsContainer);

    checkboxTag.addEventListener("click", () => {
        const hasChecked = taskInputTag.classList.contains("hasChecked");

        if (hasChecked) {
            taskInputTag.classList.remove("hasChecked");
        } else {
            if (taskInputTag.value) {
                taskInputTag.classList.add("hasChecked");
            }
        }
    })

    const timeInput = document.createElement("input");
    timeInput.classList.add("timeInputBtn");
    timeInput.type="time";
    taskBtnsContainer.append(timeInput);

    const removeBtn = document.createElement("i");
    removeBtn.classList.add("far", "fa-trash-alt", "remove-btn");
    taskBtnsContainer.append(removeBtn);
    
    removeBtn.addEventListener("click", () => {
        taskListTag.remove();
    })

}

/* --------------------------------------------- Timer --------------------------------------------- */
const timerSettingBoxTag = document.querySelector(".timer-setting-box");
const timerClockTag = document.querySelector(".timer-clock");
const notiSoundTag = document.querySelector("#noti-sound");
let minsTag = document.querySelector("#mins");
let secsTag = document.querySelector("#secs");
const firstSecsTag = document.querySelector("#first-secs");
// Btns
const settingBtnTag = document.querySelector(".setting-btn");
const startBtnTag = document.querySelector(".start-btn");
const restartBtnTag = document.querySelector(".redo-btn");
// Tabs
const pomodoroBtnTag = document.querySelector("#pomodoro-btn");
const shortBreakBtnTag = document.querySelector("#short-break-btn");
const longBreakBtnTag = document.querySelector("#long-break-btn");
// Time inputs
let pomodoroLengthTag = document.querySelector("#pomodoro-length");
let shortBreakLengthTag = document.querySelector("#short-break-length");
let longBreakLengthTag = document.querySelector("#long-break-length");


// Open Timer Setting function
function openTimerSetting() {
    const checkedTimerSetting = timerSettingBoxTag.classList.contains("opened-timer-setting");
    if (checkedTimerSetting) {
        closeTimerSetting();
    } else {
        settingBtnTag.classList.add("setting-activated");
        timerSettingBoxTag.style.display = "inline-block";
        timerSettingBoxTag.classList.add("opened-timer-setting");
    }
}

// Close Timer Setting function
function closeTimerSetting() {
    settingBtnTag.classList.remove("setting-activated");
    timerSettingBoxTag.style.display = "none";
    timerSettingBoxTag.classList.remove("opened-timer-setting");
}

// Applying timer setting
function applySetting() {

    if(shortBreakLengthTag.value > 15 || shortBreakLengthTag.value < 1) {
        shortBreakLengthTag.value = 1;
    }

    if(longBreakLengthTag.value > 30 || longBreakLengthTag.value < 15) {
        longBreakLengthTag.value = 15;
    }

    localStorage.setItem("pomodoro", pomodoroLengthTag.value);
    localStorage.setItem("shortBreak", shortBreakLengthTag.value);
    localStorage.setItem("longBreak", longBreakLengthTag.value);

    // Restart time when apply setting
    restartTimer();
    startBtnTag.textContent = "start";
    startBtnTag.classList.remove("pause-btn");
    // Time Display when apply setting
    displayTime();
}

// Selected tab function
const tabContainerTag = document.querySelector(".tabs-container");
function tabSelected() {

    const selectedTabTag = document.querySelector(".tab-selected");
    selectedTabTag.classList.remove("tab-selected");

    tabContainerTag.onclick = e => {

        let selectedTabId = e.target;
        selectedTabId.classList.add("tab-selected");

        // Restart time when change tab
        restartTimer();
        startBtnTag.textContent = "start";
        startBtnTag.classList.remove("pause-btn");
        // Time Display when change tab
        displayTime();
    }
    
}

// set values in timer setting according to local storage
if (localStorage.getItem("pomodoro")) {
    minsTag.textContent = localStorage.getItem("pomodoro");

    pomodoroLengthTag.value = localStorage.getItem("pomodoro");
    shortBreakLengthTag.value = localStorage.getItem("shortBreak");
    longBreakLengthTag.value = localStorage.getItem("longBreak");
}

// display Time
displayTime();
function displayTime() {

    if (pomodoroBtnTag.classList.contains("tab-selected")) {
        minsTag.textContent = pomodoroLengthTag.value < 10 ? "0" + pomodoroLengthTag.value.toString() : pomodoroLengthTag.value;
    } else if (shortBreakBtnTag.classList.contains("tab-selected")) {
        minsTag.textContent = shortBreakLengthTag.value < 10 ? "0" + shortBreakLengthTag.value.toString() : shortBreakLengthTag.value;
    } else if (longBreakBtnTag.classList.contains("tab-selected")) {
        minsTag.textContent = longBreakLengthTag.value < 10 ? "0" + longBreakLengthTag.value.toString() : longBreakLengthTag.value;
    }
}

// Restart Btn
function restartTimer() {
    displayTime();
    secsTag.textContent = 60;
    firstSecsTag.style.display = "inline";
    secsTag.style.display = "none";
    startBtnTag.textContent = "start";
    startBtnTag.classList.remove("pause-btn");
    clearInterval(intervalId);
}

// Start and Pause Btns
let intervalId;
function startTimer() {

    // Pausing
    if (startBtnTag.classList.contains("pause-btn")) {

        clearInterval(intervalId);
        startBtnTag.textContent = "start";
        startBtnTag.classList.remove("pause-btn");

    } else {
        // Running
        // Display 00 second instead of 60 seconds
        setTimeout(() => {
            firstSecsTag.style.display = "none";
            secsTag.style.display = "inline";
        }, 1000);
        // Get current time
        clearInterval(intervalId);
        startTimerFunction(minsTag.textContent, secsTag.textContent);

        startBtnTag.textContent = "pause";
        startBtnTag.classList.add("pause-btn");

    }

}

// Timer Function
function startTimerFunction(m, s) {
    let minute = m;
    let second = s;
    
    if (minute < 10) {
        minute = minute.substring(1);
    }

    // Decrease Minute on first timer minute
    if (minute == localStorage.getItem("pomodoro") || 
       minute == localStorage.getItem("shortBreak") || 
       minute == localStorage.getItem("longBreak")) {

            minute--;

    }

    clearInterval(intervalId);
    intervalId = setInterval(timerFunction, 1000);
    
    function timerFunction() {
        
        if (second === 60) {
            minute--;
        }
        second--;
        if (second === 0) {
            second = 60;

            if (minute <= 0 && second === 60) {
                notiSoundTag.play();
                openToastAlert();
                clearInterval(intervalId);
                startBtnTag.textContent = "start";
                startBtnTag.classList.remove("pause-btn");
            }
        }
        secsTag.textContent = second === 60 ? "0" + "0" : second < 10 ? "0" + second.toString() : second;
        minsTag.textContent = minute < 0 ? "0" + "0" : minute < 10 ? "0" + minute.toString() : minute;
    }
}


// Toast Alert function
const toastParentTag = document.querySelector(".toast-parent");
const toastContainerTag = document.querySelector(".toast-container");
function openToastAlert() {
    toastContainerTag.innerHTML = `
    <div class="bannerAndBody">
        <div class="toast-banner"><span>MESSAGE</span><span>now</span></div>
        <div class="toast-parent">
            <div class="toast-alert-text">"Hey there, Time's up!"</div>
        </div>
    </div>`;

    toastContainerTag.style.top = `-${toastContainerTag.offsetHeight + 100}px`;
    setTimeout(() => {
        toastContainerTag.style.top = "0px";
    }, 100);
    setTimeout(() => {
        toastContainerTag.style.top = `-${toastContainerTag.offsetHeight + 100}px`;
    }, 3000)
}

/* --------------------------------------------- Musics --------------------------------------------- */
const mainMoodContainerTag = document.querySelector(".main-mood-container");
var audioTag = document.querySelector(".audioSource");
const moodSelectedBox = document.querySelector(".mood-selected");

// create each mood buttons
for (let i = 0; i < musics.length; i++) {

    var moodContainerTag = document.createElement("div"); // icon + label
    moodContainerTag.classList.add("mood-container");
    mainMoodContainerTag.append(moodContainerTag);

    var iconBoxTag = document.createElement("div"); // icon box
    iconBoxTag.classList.add("icon-box");
    iconBoxTag.id = musics[i].id;
    iconBoxTag.style.backgroundImage = `url(${musics[i].icon})`; // icon
    iconBoxTag.setAttribute("title", musics[i].label);
    iconBoxTag.setAttribute("onclick", "playMusic()");
    moodContainerTag.append(iconBoxTag);
    
    var moodLabelTag = document.createElement("label"); // label
    moodLabelTag.classList.add("mood-label");
    moodLabelTag.textContent = musics[i].label;
    moodContainerTag.append(moodLabelTag);
}

// Play music function
function playMusic() {
    mainMoodContainerTag.onclick = e => {

        const selectedMood = e.target; // get clicked tag

        // check if it is icon box
        if (selectedMood.classList.contains("icon-box")) {

            let musicId = selectedMood.id-1;

            // Alter to pause button
            startMusic();

            // get elements which have a class "mood selected"
            var elements = document.querySelectorAll(".mood-selected");

            // check if it has been selected
            if (selectedMood.classList.contains("mood-selected")) {
                
                currentPlayingIndex++;
                if (currentPlayingIndex === musics[musicId].playlist.length) {
                    currentPlayingIndex = 0;
                }
                playRepeatMusic(currentPlayingIndex, musicId);

            } else {

                // remove all mood-selected classes
                for (let i = 0; i < elements.length; i++) {
                    elements[i].classList.remove("mood-selected");
                }
                selectedMood.classList.add("mood-selected");
                playRepeatMusic(0, musicId);
            }
        
            function playRepeatMusic(e, musicAlbumId) {

                // Does user's browser support mp3 or ogg
                var ext = "mp3";
                var agent = navigator.userAgent.toLowerCase();
                if(agent.indexOf('firefox') != -1 || agent.indexOf('opera') != -1) {
                    ext = "ogg";
                }
            
                audioTag.src = `resources/music/${musics[musicAlbumId].dir}/${musics[musicAlbumId].playlist[e]}.${ext}`;
                audioTag.loop = false;
                audioTag.play();
                currentPlayingIndex = e;

                audioTag.addEventListener("ended", function() {
                    if (currentPlayingIndex === musics[musicAlbumId].playlist.length - 1) {
                        currentPlayingIndex = 0;
                    } else {
                        currentPlayingIndex++;
                    }

                    audioTag.src = `resources/music/${musics[musicAlbumId].dir}/${musics[musicAlbumId].playlist[currentPlayingIndex]}.${ext}`;
                    audioTag.play();
                })

            }

        }
    }
}

/* --------------------------------------------- Volume Slider --------------------------------------------- */
const volumeIconTag = document.querySelector(".volumeIcon");
var volumeSliderTag = document.querySelector("#volumeSlider");
const pauseBtnTag = document.querySelector(".fa-pause");
const playBtnTag = document.querySelector(".fa-play");
volumeSliderTag.addEventListener("mousemove", setvolume);

// mute audio by click volume icon
function muteFunction() {
    // click to mute
    if (volumeIconTag.classList.contains("fa-volume-up")) {
        volumeIconTag.classList.remove("fa-volume-up");
        volumeIconTag.classList.add("fa-volume-mute");
        audioTag.volume = 0;
        volumeSliderTag.value = 0;
    } 
    // click to volume up
    else if (volumeIconTag.classList.contains("fa-volume-mute")){
        volumeIconTag.classList.add("fa-volume-up");
        volumeIconTag.classList.remove("fa-volume-mute");
        volumeSliderTag.value = localStorage.getItem("volumeSlider");
        if(volumeSliderTag.value < 5) {
            volumeSliderTag.value = 10;
        }
        audioTag.volume = volumeSliderTag.value / 100;
    }
}

function setvolume() {
    audioTag.volume = volumeSliderTag.value / 100;
    localStorage.setItem("volumeSlider", volumeSliderTag.value);
    if (volumeSliderTag.value == 0) {
        volumeIconTag.classList.remove("fa-volume-up");
        volumeIconTag.classList.add("fa-volume-mute");
    } else {
        volumeIconTag.classList.add("fa-volume-up");
        volumeIconTag.classList.remove("fa-volume-mute");
    }
}


// Alter icon when pause and play btn is clicked
function pauseMusic() {
    audioTag.pause();
    playBtnTag.style.display = "inline";
    pauseBtnTag.style.display = "none";
}
function startMusic() {
    audioTag.play();
    playBtnTag.style.display = "none";
    pauseBtnTag.style.display = "inline";
}



/* --------------------------------------------- Quote --------------------------------------------- */
const quoteRowTag = document.querySelector(".quote-row");
const quoteContainerTag =  document.querySelector(".quote-container");

// Create tag for quote
const blockQuoteTag = document.createElement("blockquote");
blockQuoteTag.classList.add("quoteClass");
quoteContainerTag.append(blockQuoteTag);

// Create tag for author
const authorTag = document.createElement("figcaption");
authorTag.classList.add("authorClass");
quoteContainerTag.append(authorTag);

// Write random quote
refreshQuote();

function refreshQuote() {
    let randomQuoteId = Math.floor(Math.random()*quotes.length); // get random ID
    blockQuoteTag.textContent = `"` + quotes[randomQuoteId].quote + `"`; // display quote
    authorTag.textContent = "-" + quotes[randomQuoteId].author + "-"; // display author
}
