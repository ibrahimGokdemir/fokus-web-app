document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elementleri ===
    const elements = {
        timerDisplay: document.getElementById('timer-display'),
        startButton: document.getElementById('startButton'),
        pauseButton: document.getElementById('pauseButton'),
        resetButton: document.getElementById('resetButton'),
        statusMessage: document.getElementById('status-message'),
        musicPlayer: document.getElementById('music-player-element'),
        alarmSound: document.getElementById('alarm-sound'),
        progressRing: document.querySelector('.progress-ring-fg'),
        progressHandle: document.getElementById('progress-handle'),
        timerSvg: document.getElementById('timer-svg'),
        darkModeToggle: document.getElementById('darkModeToggle'),
        htmlEl: document.documentElement
    };

    // === Ayarlar ===
    const SETTINGS = {
        WORK_TIME: 25 * 60,
        SHORT_BREAK_TIME: 5 * 60,
        LONG_BREAK_TIME: 15 * 60,
        TRACKS: ["music/Lofi1.mp3", "music/Lofi2.m4a", "music/Lofi3.mp3", "music/Lofi4.mp3", "music/Lofi5.mp3", "music/Lofi6.mp3"]
    };

    // === Durum Değişkenleri (State) ===
    let state = {
        currentTime: SETTINGS.WORK_TIME,
        totalTime: SETTINGS.WORK_TIME,
        isPaused: true,
        intervalId: null,
        pomodoroCount: 0,
        currentMode: 'work',
        currentTrackIndex: 0,
        isDragging: false
    };

    // === İlerleme Çemberi Ayarları ===
    const radius = elements.progressRing.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    elements.progressRing.style.strokeDasharray = `${circumference} ${circumference}`;

    // === Ana UI Güncelleme Fonksiyonu ===
    const updateUI = (seconds) => {
        const safeSeconds = Math.max(0, Math.min(state.totalTime, seconds));
        state.currentTime = safeSeconds;
        
        const minutes = Math.floor(safeSeconds / 60);
        const remainderSeconds = safeSeconds % 60;
        elements.timerDisplay.textContent = `${minutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;
        
        const progress = safeSeconds / state.totalTime;
        const offset = circumference * (1 - progress);
        elements.progressRing.style.strokeDashoffset = offset;

        const angle = progress * 360;
        elements.progressHandle.setAttribute('transform', `rotate(${angle}, 150, 150)`);
    };
    
    // === Müzik Fonksiyonları ===
    const loadAndPlayMusic = () => {
        if (SETTINGS.TRACKS.length > 0) {
            elements.musicPlayer.src = SETTINGS.TRACKS[state.currentTrackIndex];
            elements.musicPlayer.play().catch(e => console.error("Müzik Oynatma Hatası:", e));
        }
    };
    
    // === Zamanlayıcı Kontrol Fonksiyonları ===
    const startTimer = () => {
        if (!state.isPaused || state.isDragging) return;
        state.isPaused = false;
        state.intervalId = setInterval(countdown, 1000);
        elements.startButton.style.display = 'none';
        elements.pauseButton.style.display = 'inline-block';
        if (state.currentMode === 'work') {
            if (elements.musicPlayer.paused && elements.musicPlayer.currentTime > 0) {
                elements.musicPlayer.play().catch(e => console.error("Müzik devam ettirilemedi:", e));
            } else {
                loadAndPlayMusic();
            }
        }
    };

    const pauseTimer = () => {
        if (state.isPaused) return;
        state.isPaused = true;
        clearInterval(state.intervalId);
        elements.startButton.style.display = 'inline-block';
        elements.pauseButton.style.display = 'none';
        elements.musicPlayer.pause();
    };
    
    const resetTimer = () => {
        pauseTimer();
        clearInterval(state.intervalId);
        state.isPaused = true;
        state.currentMode = 'work';
        state.pomodoroCount = 0;
        state.totalTime = SETTINGS.WORK_TIME;
        updateUI(SETTINGS.WORK_TIME);
        elements.statusMessage.textContent = "Çalışma Zamanı!";
        state.currentTrackIndex = 0;
        if (SETTINGS.TRACKS.length > 0) {
           elements.musicPlayer.src = SETTINGS.TRACKS[state.currentTrackIndex];
        }
    };

    const countdown = () => {
        // KRİTİK DÜZELTME: Durum değişkenini güncelle
        if (!state.isPaused && !state.isDragging) {
            state.currentTime--;
            updateUI(state.currentTime);

            if (state.currentTime < 0) {
                clearInterval(state.intervalId);
                elements.musicPlayer.pause();
                elements.alarmSound.play();
                setTimeout(switchMode, 3000);
            }
        }
    };
    
    const switchMode = () => {
        state.pomodoroCount += (state.currentMode === 'work') ? 1 : 0;
        
        if (state.currentMode !== 'work') {
            state.currentMode = 'work';
            state.totalTime = SETTINGS.WORK_TIME;
            elements.statusMessage.textContent = "Çalışma Zamanı!";
        } else {
            state.currentMode = (state.pomodoroCount % 4 === 0) ? 'longBreak' : 'shortBreak';
            state.totalTime = (state.currentMode === 'longBreak') ? SETTINGS.LONG_BREAK_TIME : SETTINGS.SHORT_BREAK_TIME;
            elements.statusMessage.textContent = (state.currentMode === 'longBreak') ? "Uzun Mola Zamanı!" : "Kısa Mola Zamanı!";
        }
        
        state.isPaused = true; 
        updateUI(state.totalTime);
        startTimer();
    };

    // === Dark Mode Fonksiyonları ===
    const toggleDarkMode = () => {
        let theme = elements.htmlEl.getAttribute('data-theme');
        const icon = elements.darkModeToggle.querySelector('i');
        if (theme === 'dark') {
            elements.htmlEl.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            icon.classList.replace('fa-sun', 'fa-moon');
        } else {
            elements.htmlEl.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            icon.classList.replace('fa-moon', 'fa-sun');
        }
    };

    const initializeTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        elements.htmlEl.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'dark') {
            elements.darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }
    };
    
    // === Sürükleme Fonksiyonları ===
    const getAngle = (clientX, clientY) => {
        const svgRect = elements.timerSvg.getBoundingClientRect();
        const x = clientX - svgRect.left - svgRect.width / 2;
        const y = clientY - svgRect.top - svgRect.height / 2;
        let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;
        return angle;
    };
    
    const startDrag = (e) => {
        e.preventDefault();
        state.isDragging = true;
        pauseTimer();
        window.addEventListener('mousemove', onDrag);
        window.addEventListener('touchmove', onDrag, { passive: false });
        window.addEventListener('mouseup', endDrag);
        window.addEventListener('touchend', endDrag);
    };

    const onDrag = (e) => {
        if (!state.isDragging) return;
        e.preventDefault();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        const angle = getAngle(clientX, clientY);
        // KRİTİK DÜZELTME: Doğru zaman hesaplaması
        const progress = angle / 360;
        const newTime = Math.round(state.totalTime * progress);
        updateUI(newTime);
    };

    const endDrag = () => {
        if (!state.isDragging) return;
        state.isDragging = false;
        window.removeEventListener('mousemove', onDrag);
        window.removeEventListener('touchmove', onDrag);
        window.removeEventListener('mouseup', endDrag);
        window.removeEventListener('touchend', endDrag);
    };

    // === Olay Dinleyicileri ===
    elements.startButton.addEventListener('click', startTimer);
    elements.pauseButton.addEventListener('click', pauseTimer);
    elements.resetButton.addEventListener('click', resetTimer);
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);
    elements.progressHandle.addEventListener('mousedown', startDrag);
    elements.progressHandle.addEventListener('touchstart', startDrag, { passive: false });
    elements.musicPlayer.addEventListener('ended', () => {
        state.currentTrackIndex = (state.currentTrackIndex + 1) % SETTINGS.TRACKS.length;
        loadAndPlayMusic();
    });

    // === Başlangıç ===
    initializeTheme();
    resetTimer();
});
