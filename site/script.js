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
    const progressHandle = document.getElementById('progress-handle');
    const timerSvg = document.getElementById('timer-svg');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlEl = document.documentElement;

    // === Ayarlar ===
    const WORK_TIME = 25 * 60;
    const SHORT_BREAK_TIME = 5 * 60;
    const LONG_BREAK_TIME = 15 * 60;
    const TRACKS = ["music/Lofi1.mp3", "music/Lofi2.m4a", "music/Lofi3.mp3", "music/Lofi4.mp3", "music/Lofi5.mp3", "music/Lofi6.mp3"];

    // === Durum Değişkenleri (State) ===
    let currentTime, totalTime;
    let isPaused = true;
    let intervalId = null;
    let pomodoroCount = 0;
    let currentMode = 'work';
    let currentTrackIndex = 0;
    let isDragging = false;

    // === İlerleme Çemberi Ayarları ===
    const radius = progressRing.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const centerX = 150, centerY = 150;
    progressRing.style.strokeDasharray = `${circumference} ${circumference}`;

    // === Ana UI Güncelleme Fonksiyonu ===
    const updateUI = (seconds) => {
        const safeSeconds = Math.max(0, Math.min(totalTime, seconds));
        
        const minutes = Math.floor(safeSeconds / 60);
        const remainderSeconds = safeSeconds % 60;
        timerDisplay.textContent = `${minutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;
        
        const percent = (safeSeconds / totalTime);
        const offset = circumference - percent * circumference;
        progressRing.style.strokeDashoffset = offset;

        const angle = percent * 2 * Math.PI - (Math.PI / 2);
        const handleX = centerX + Math.cos(angle) * radius;
        const handleY = centerY + Math.sin(angle) * radius;
        progressHandle.setAttribute('cx', handleX);
        progressHandle.setAttribute('cy', handleY);
    };
    
    // === Müzik Fonksiyonları ===
    const loadAndPlayMusic = () => {
        if (TRACKS.length > 0) {
            musicPlayer.src = TRACKS[currentTrackIndex];
            musicPlayer.play().catch(e => console.error("Müzik Oynatma Hatası:", e));
        }
    };

    // === Zamanlayıcı Kontrol Fonksiyonları ===
    const startTimer = () => {
        if (!isPaused || isDragging) return;
        isPaused = false;
        intervalId = setInterval(countdown, 1000);
        startButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
        if (currentMode === 'work') {
            if (musicPlayer.paused && musicPlayer.currentTime > 0) {
                musicPlayer.play().catch(e => console.error("Müzik devam ettirilemedi:", e));
            } else {
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
        updateUI(currentTime);
        statusMessage.textContent = "Çalışma Zamanı!";
        currentTrackIndex = 0;
        if (TRACKS.length > 0) {
           musicPlayer.src = TRACKS[currentTrackIndex];
        }
    };

    const countdown = () => {
        currentTime--;
        updateUI(currentTime);

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
        isPaused = true; 
        updateUI(currentTime);
        startTimer();
    };

    // === Dark Mode Fonksiyonları ===
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

    // === Sürükleme Fonksiyonları ===
    const getAngle = (clientX, clientY) => {
        const svgRect = timerSvg.getBoundingClientRect();
        // SVG merkezinin sayfa üzerindeki koordinatları
        const svgCenterX = svgRect.left + centerX;
        const svgCenterY = svgRect.top + centerY;
        // Fare pozisyonuna göre vektör
        const x = clientX - svgCenterX;
        const y = clientY - svgCenterY;
        // Açı hesabı ve -90 derece düzeltmesi
        let angle = Math.atan2(y, x) + Math.PI / 2;
        if (angle < 0) angle += 2 * Math.PI;
        return angle;
    };

    const startDrag = (e) => {
        e.preventDefault();
        isDragging = true;
        pauseTimer();
        window.addEventListener('mousemove', onDrag);
        window.addEventListener('touchmove', onDrag, { passive: false });
        window.addEventListener('mouseup', endDrag);
        window.addEventListener('touchend', endDrag);
    };

    const onDrag = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        const angle = getAngle(clientX, clientY);
        const percent = angle / (2 * Math.PI);
        currentTime = Math.round(totalTime * percent);
        updateUI(currentTime);
    };

    const endDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;
        window.removeEventListener('mousemove', onDrag);
        window.removeEventListener('touchmove', onDrag);
        window.removeEventListener('mouseup', endDrag);
        window.removeEventListener('touchend', endDrag);
    };

    // === Olay Dinleyicileri (Event Listeners) ===
    startButton.addEventListener('click', startTimer);
    pauseButton.addEventListener('click', pauseTimer);
    resetButton.addEventListener('click', resetTimer);
    darkModeToggle.addEventListener('click', toggleDarkMode);
    progressHandle.addEventListener('mousedown', startDrag);
    progressHandle.addEventListener('touchstart', startDrag, { passive: false });
    musicPlayer.addEventListener('ended', () => {
        currentTrackIndex = (currentTrackIndex + 1) % TRACKS.length;
        loadAndPlayMusic();
    });

    // === Başlangıç ===
    initializeTheme();
    resetTimer();
});
