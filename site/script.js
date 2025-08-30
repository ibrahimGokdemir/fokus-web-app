document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elementleri ---
    const timerDisplay = document.getElementById('timer-display');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const resetButton = document.getElementById('resetButton');
    const statusMessage = document.getElementById('status-message');
    const musicPlayer = document.getElementById('music-player-element');
    const alarmSound = document.getElementById('alarm-sound');
    const progressRing = document.querySelector('.progress-ring-fg');
    const darkModeToggle = document.getElementById('darkModeToggle');

    // --- Zamanlayıcı Ayarları ---
    const workTime = 25 * 60;
    const shortBreakTime = 5 * 60;
    const longBreakTime = 15 * 60;
    let currentTime;
    let totalTime;
    let isPaused = true;
    let intervalId = null;
    let pomodoroCount = 0;
    let currentMode = 'work';

    // --- Müzik Listesi ---
    const tracks = [
        "music/Lofi1.mp3", "music/Lofi2.m4a", "music/Lofi3.mp3",
        "music/Lofi4.mp3", "music/Lofi5.mp3", "music/Lofi6.mp3"
    ];
    let currentTrackIndex = 0;

    // --- İlerleme Çemberi Ayarları ---
    const radius = progressRing.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
    progressRing.style.strokeDashoffset = circumference;

    // --- Fonksiyonlar ---
    function setProgress(percent) {
        const offset = circumference - (percent / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;
    }

    function displayTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainderSeconds = seconds % 60;
        timerDisplay.textContent = `${minutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;
    }

    function startTimer() {
        if (isPaused) {
            isPaused = false;
            intervalId = setInterval(countdown, 1000);
            startButton.style.display = 'none';
            pauseButton.style.display = 'inline-block';
            if (currentMode === 'work') {
                playMusic();
            }
        }
    }

    function pauseTimer() {
        if (!isPaused) {
            isPaused = true;
            clearInterval(intervalId);
            startButton.style.display = 'inline-block';
            pauseButton.style.display = 'none';
            musicPlayer.pause();
        }
    }

    function resetTimer() {
        clearInterval(intervalId);
        isPaused = true;
        currentMode = 'work';
        pomodoroCount = 0;
        totalTime = workTime;
        currentTime = workTime;
        displayTime(currentTime);
        setProgress(100);
        statusMessage.textContent = "Çalışma Zamanı!";
        startButton.style.display = 'inline-block';
        pauseButton.style.display = 'none';
        musicPlayer.pause();
        // Müzik çaları sıfırla
        if (tracks.length > 0) {
            musicPlayer.src = tracks[currentTrackIndex];
        }
    }

    function countdown() {
        currentTime--;
        displayTime(currentTime);
        setProgress((currentTime / totalTime) * 100);

        if (currentTime < 0) {
            clearInterval(intervalId);
            alarmSound.play();
            musicPlayer.pause();
            // Zil sesinin bitmesi için kısa bir bekleme
            setTimeout(switchMode, 3000);
        }
    }

    function switchMode() {
        if (currentMode === 'work') {
            pomodoroCount++;
            if (pomodoroCount % 4 === 0) {
                currentMode = 'longBreak';
                totalTime = longBreakTime;
                statusMessage.textContent = "Uzun Mola Zamanı!";
            } else {
                currentMode = 'shortBreak';
                totalTime = shortBreakTime;
                statusMessage.textContent = "Kısa Mola Zamanı!";
            }
        } else {
            currentMode = 'work';
            totalTime = workTime;
            statusMessage.textContent = "Çalışma Zamanı!";
        }
        currentTime = totalTime;
        displayTime(currentTime);
        setProgress(100);
        isPaused = true;
        startButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
        startTimer(); // Bir sonraki modu otomatik başlat
    }
    
    function playMusic() {
        if (tracks.length === 0) return;
        musicPlayer.src = tracks[currentTrackIndex];
        musicPlayer.play().catch(e => console.error("Müzik oynatılamadı:", e));
    }
    
    musicPlayer.addEventListener('ended', () => {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        playMusic();
    });

    // --- Olay Dinleyicileri (Event Listeners) ---
    startButton.addEventListener('click', startTimer);
    pauseButton.addEventListener('click', pauseTimer);
    resetButton.addEventListener('click', resetTimer);

    // --- Dark Mode Mantığı ---
    const currentTheme = localStorage.getItem('theme');
    const icon = darkModeToggle.querySelector('i');

    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    darkModeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    });

    // --- Başlangıç Durumu ---
    resetTimer();
});
