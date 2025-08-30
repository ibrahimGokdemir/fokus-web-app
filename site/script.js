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

    // === Fonksiyonlar ===
    const updateUI = (seconds) => {
        // Zaman göstergesini güncelle
        const minutes = Math.floor(seconds / 60);
        const remainderSeconds = seconds % 60;
        timerDisplay.textContent = `${minutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;
        
        // Dairesel ilerlemeyi güncelle
        const percent = Math.max(0, (seconds / totalTime) * 100);
        const offset = circumference - (percent / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;

        // Tutamacı güncelle
        const angle = (seconds / totalTime) * 2 * Math.PI - (Math.PI / 2); // -90 derece ofset
        const handleX = centerX + Math.cos(angle) * radius;
        const handleY = centerY + Math.sin(angle) * radius;
        progressHandle.setAttribute('cx', handleX);
        progressHandle.setAttribute('cy', handleY);
    };
    
    const startTimer = () => { /* ... (bir önceki yanıttaki kod ile aynı) ... */ };
    const pauseTimer = () => { /* ... (bir önceki yanıttaki kod ile aynı) ... */ };
    const resetTimer = () => { /* ... (bir önceki yanıttaki kod ile aynı) ... */ };
    const countdown = () => { /* ... (bir önceki yanıttaki kod ile aynı) ... */ };
    const switchMode = () => { /* ... (bir önceki yanıttaki kod ile aynı) ... */ };
    const toggleDarkMode = () => { /* ... (bir önceki yanıttaki kod ile aynı) ... */ };
    const initializeTheme = () => { /* ... (bir önceki yanıttaki kod ile aynı) ... */ };

    // === Sürükleme Fonksiyonları ===
    const getAngle = (clientX, clientY) => {
        const svgRect = timerSvg.getBoundingClientRect();
        const x = clientX - svgRect.left - centerX;
        const y = clientY - svgRect.top - centerY;
        let angle = Math.atan2(y, x) + Math.PI / 2; // +90 derece ofset
        if (angle < 0) angle += 2 * Math.PI; // Negatif açıları pozitif yap
        return angle;
    };

    const startDrag = (e) => {
        isDragging = true;
        pauseTimer();
        timerSvg.addEventListener('mousemove', onDrag);
        timerSvg.addEventListener('touchmove', onDrag);
        timerSvg.addEventListener('mouseup', endDrag);
        timerSvg.addEventListener('touchend', endDrag);
        timerSvg.addEventListener('mouseleave', endDrag);
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
        isDragging = false;
        timerSvg.removeEventListener('mousemove', onDrag);
        timerSvg.removeEventListener('touchmove', onDrag);
        timerSvg.removeEventListener('mouseup', endDrag);
        timerSvg.removeEventListener('touchend', endDrag);
        timerSvg.removeEventListener('mouseleave', endDrag);
    };

    // === Olay Dinleyicileri (Event Listeners) ===
    startButton.addEventListener('click', startTimer);
    pauseButton.addEventListener('click', pauseTimer);
    resetButton.addEventListener('click', resetTimer);
    darkModeToggle.addEventListener('click', toggleDarkMode);
    progressHandle.addEventListener('mousedown', startDrag);
    progressHandle.addEventListener('touchstart', startDrag);
    musicPlayer.addEventListener('ended', () => {
        currentTrackIndex = (currentTrackIndex + 1) % TRACKS.length;
        loadAndPlayMusic();
    });

    // === Başlangıç ===
    const loadAndPlayMusic = () => {
        if (TRACKS.length > 0) {
            musicPlayer.src = TRACKS[currentTrackIndex];
            musicPlayer.play().catch(e => console.error("Müzik Oynatma Hatası:", e));
        }
    };
    initializeTheme();
    resetTimer(); // Bu fonksiyon zaten updateUI'ı çağırıyor.
});