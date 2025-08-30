document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elementleri ===
    const timerDisplay = document.getElementById('timer-display');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const resetButton = document.getElementById('resetButton');
    const statusMessage = document.getElementById('status-message');
    const musicPlayer = document.getElementById('music-player-element');
    const alarmSound = document.getElementById('alarm-sound');
    const progressRing = document.querySelector('.progress-ring-fg');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlEl = document.documentElement;

    // === Ayarlar ===
    const WORK_TIME = 25 * 60;
    const SHORT_BREAK_TIME = 5 * 60;
    const LONG_BREAK_TIME = 15 * 60;
    const TRACKS = [
        "music/Lofi1.mp3", "music/Lofi2.m4a", "music/Lofi3.mp3",
        "music/Lofi4.mp3", "music/Lofi5.mp3", "music/Lofi6.mp3"
    ];

    // === Durum Değişkenleri (State) ===
    let currentTime;
    let totalTime;
    let isPaused = true;
    let intervalId = null;
    let pomodoroCount = 0;
    let currentMode = 'work';
    let currentTrackIndex = 0;

    // === İlerleme Çemberi Ayarları ===
    const radius = progressRing.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    progressRing.style.strokeDasharray = `${circumference} ${circumference}`;

    // === Fonksiyonlar ===
    const updateProgress = (seconds) => {
        const percent = Math.max(0, (seconds / totalTime) * 100);
        const offset = circumference - (percent / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;
    };

    const updateDisplay = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainderSeconds = seconds % 60;
        timerDisplay.textContent = `${minutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;
    };
    
    const loadAndPlayMusic = () => {
        if (TRACKS.length === 0) return;
        musicPlayer.src = TRACKS[currentTrackIndex];
        musicPlayer.play().catch(e => console.error("Müzik Oynatma Hatası:", e));
    };

    const startTimer = () => {
        if (!isPaused) return;
        isPaused = false;
        intervalId = setInterval(countdown, 1000);
        startButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
        
        // --- MÜZİK DEVAM ETME MANTIĞI ---
        if (currentMode === 'work') {
            // Eğer müzik duraklatılmışsa, sadece devam ettir.
            if (musicPlayer.paused && musicPlayer.currentTime > 0) {
                musicPlayer.play().catch(e => console.error("Müzik devam ettirilemedi:", e));
            } else {
                // Değilse (ilk başlangıç veya yeni şarkı), baştan başlat.
                loadAndPlayMusic();
            }
        }
    };

    const pauseTimer = () => {
        if (isPaused) return;
        isPaused = true;
        clearInterval(intervalId);
        startButton.style.display = 'inline-block';
        pauseButton.style.display = 'none';
        musicPlayer.pause();
    };
    
    const resetTimer = () => {
        pauseTimer(); 
        clearInterval(intervalId); 
        isPaused = true;
        currentMode = 'work';
        pomodoroCount = 0;
        totalTime = WORK_TIME;
        currentTime = WORK_TIME;
        updateDisplay(currentTime);
        updateProgress(currentTime);
        statusMessage.textContent = "Çalışma Zamanı!";
        startButton.style.display = 'inline-block';
        pauseButton.style.display = 'none';
        // Müziği sıfırla ama çalma
        currentTrackIndex = 0;
        if (TRACKS.length > 0) {
           musicPlayer.src = TRACKS[currentTrackIndex];
        }
    };

    const countdown = () => {
        currentTime--;
        updateDisplay(currentTime);
        updateProgress(currentTime);

        if (currentTime < 0) {
            clearInterval(intervalId);
            musicPlayer.pause();
            alarmSound.play();
            setTimeout(switchMode, 3000);
        }
    };
    
    const switchMode = () => {
        pomodoroCount += (currentMode === 'work') ? 1 : 0;
        
        if (currentMode !== 'work') {
            currentMode = 'work';
            totalTime = WORK_TIME;
            statusMessage.textContent = "Çalışma Zamanı!";
        } else {
            currentMode = (pomodoroCount % 4 === 0) ? 'longBreak' : 'shortBreak';
            totalTime = (currentMode === 'longBreak') ? LONG_BREAK_TIME : SHORT_BREAK_TIME;
            statusMessage.textContent = (currentMode === 'longBreak') ? "Uzun Mola Zamanı!" : "Kısa Mola Zamanı!";
        }
        
        currentTime = totalTime;
        updateDisplay(currentTime);
        updateProgress(currentTime);
        isPaused = true; 
        startTimer();
    };

    const toggleDarkMode = () => {
        let theme = htmlEl.getAttribute('data-theme');
        const icon = darkModeToggle.querySelector('i');
        if (theme === 'dark') {
            htmlEl.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            icon.classList.replace('fa-sun', 'fa-moon');
        } else {
            htmlEl.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            icon.classList.replace('fa-moon', 'fa-sun');
        }
    };

    const initializeTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            htmlEl.setAttribute('data-theme', 'dark');
            darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }
    };

    // Olay Dinleyicileri
    startButton.addEventListener('click', startTimer);
    pauseButton.addEventListener('click', pauseTimer);
    resetButton.addEventListener('click', resetTimer);
    darkModeToggle.addEventListener('click', toggleDarkMode);
    musicPlayer.addEventListener('ended', () => {
        currentTrackIndex = (currentTrackIndex + 1) % TRACKS.length;
        loadAndPlayMusic();
    });

    // Başlangıç
    initializeTheme();
    resetTimer();
});