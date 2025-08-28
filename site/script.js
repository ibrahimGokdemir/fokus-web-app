// --- POMODORO ZAMANLAYICI KODLARI ---
const timerDisplay = document.getElementById('timer-display');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');
const statusMessage = document.getElementById('status-message');

const workTime = 25 * 60;
const shortBreakTime = 5 * 60;
const longBreakTime = 15 * 60;

let currentTime = workTime;
let isPaused = true;
let intervalId = null;
let pomodoroCount = 0;
let currentMode = 'work';

function displayTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainderSeconds = seconds % 60;
    timerDisplay.textContent = `${minutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;
}

function countdown() {
    currentTime--;
    displayTime(currentTime);
    if (currentTime < 0) {
        clearInterval(intervalId);
        switchMode();
    }
}

function switchMode() {
    if (currentMode === 'work') {
        pomodoroCount++;
        if (pomodoroCount % 4 === 0) {
            currentMode = 'longBreak';
            currentTime = longBreakTime;
            statusMessage.textContent = "Uzun Mola Zamanı!";
        } else {
            currentMode = 'shortBreak';
            currentTime = shortBreakTime;
            statusMessage.textContent = "Kısa Mola Zamanı!";
        }
    } else {
        currentMode = 'work';
        currentTime = workTime;
        statusMessage.textContent = "Çalışma Zamanı!";
    }
    displayTime(currentTime);
    isPaused = true;
    startButton.style.display = 'inline-block';
    pauseButton.style.display = 'none';
}

startButton.addEventListener('click', () => {
    if (isPaused) {
        isPaused = false;
        intervalId = setInterval(countdown, 1000);
        startButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
    }
});

pauseButton.addEventListener('click', () => {
    if (!isPaused) {
        isPaused = true;
        clearInterval(intervalId);
        startButton.style.display = 'inline-block';
        pauseButton.style.display = 'none';
    }
});

resetButton.addEventListener('click', () => {
    clearInterval(intervalId);
    isPaused = true;
    currentMode = 'work';
    pomodoroCount = 0;
    currentTime = workTime;
    displayTime(currentTime);
    statusMessage.textContent = "Çalışma Zamanı!";
    startButton.style.display = 'inline-block';
    pauseButton.style.display = 'none';
});

// --- YENİ SES OYNATICI KODLARI ---
const audioPlayer = document.getElementById('audio-player-element');
const playPauseButton = document.getElementById('play-pause-button');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const currentTrackTitleDisplay = document.getElementById('current-track-title');
const playlistElement = document.getElementById('playlist');

const tracks = [

    { title: "Lofi 1", path: "music/Lofi1.mp3" },
    { title: "Lofi 2", path: "music/Lofi2.m4a" },
    { title: "Lofi 3", path: "music/Lofi3.mp3" },
    { title: "Lofi 4", path: "music/Lofi4.mp3" },
    { title: "Lofi 5", path: "music/Lofi5.mp3" },
    { title: "Lofi 6", path: "music/Lofi6.mp3" }

];

let currentTrackIndex = 0;
let isAudioPlaying = false;

function loadTrack(trackIndex) {
    if (trackIndex >= 0 && trackIndex < tracks.length) {
        currentTrackIndex = trackIndex;
        audioPlayer.src = tracks[currentTrackIndex].path;
        currentTrackTitleDisplay.textContent = tracks[currentTrackIndex].title;
        updatePlaylistUI();
    }
}

function populatePlaylist() {
    playlistElement.innerHTML = '';
    tracks.forEach((track, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = track.title;
        listItem.setAttribute('data-index', index);
        listItem.addEventListener('click', () => {
            loadTrack(index);
            playAudio();
        });
        playlistElement.appendChild(listItem);
    });
    updatePlaylistUI();
}

function updatePlaylistUI() {
    const playlistItems = playlistElement.querySelectorAll('li');
    playlistItems.forEach((item, index) => {
        if (index === currentTrackIndex) {
            item.classList.add('active-track');
        } else {
            item.classList.remove('active-track');
        }
    });
}

function updatePlayPauseIcon() {
    const icon = playPauseButton.querySelector('i');
    if (isAudioPlaying) {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
        playPauseButton.setAttribute('title', 'Duraklat');
    } else {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
        playPauseButton.setAttribute('title', 'Oynat');
    }
}

function playAudio() {
    audioPlayer.play().then(() => {
        isAudioPlaying = true;
        updatePlayPauseIcon();
    }).catch(error => console.error("Otomatik oynatma engellendi: ", error));
}

function pauseAudio() {
    audioPlayer.pause();
    isAudioPlaying = false;
    updatePlayPauseIcon();
}

playPauseButton.addEventListener('click', () => {
    isAudioPlaying ? pauseAudio() : playAudio();
});

nextButton.addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
    playAudio();
});

prevButton.addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
    playAudio();
});

audioPlayer.addEventListener('ended', () => {
    nextButton.click();
});

// Sayfa ilk yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // Pomodoro
    pauseButton.style.display = 'none';
    displayTime(currentTime);

    // Müzik Çalar
    loadTrack(0);
    populatePlaylist();
});

// --- DARK MODE KODLARI ---
document.addEventListener('DOMContentLoaded', () => {
    // ... dosyanın en başındaki eski DOMContentLoaded içeriği burada kalacak ...

    // Dark Mode Başlangıç
    const darkModeToggle = document.getElementById('darkModeToggle');
    const currentTheme = localStorage.getItem('theme');
    const icon = darkModeToggle.querySelector('i');

    // Sayfa yüklendiğinde hafızadaki temayı uygula
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    darkModeToggle.addEventListener('click', () => {
        // Mevcut temayı kontrol et
        let theme = document.documentElement.getAttribute('data-theme');
        
        if (theme === 'dark') {
            // Açık moda geç
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            // Koyu moda geç
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    });
    // Dark Mode Bitiş
});
