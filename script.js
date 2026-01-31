const socket = io();

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    lobby: document.getElementById('lobby-screen'),
    game: document.getElementById('game-screen'),
    result: document.getElementById('result-screen')
};

const inputs = {
    username: document.getElementById('username-input'),
    roomCode: document.getElementById('room-code-input'),
    time: document.getElementById('time-input'),
    rounds: document.getElementById('round-input')
};

const display = {
    roomCode: document.getElementById('display-room-code'),
    redTeamList: document.getElementById('red-team-list'),
    blueTeamList: document.getElementById('blue-team-list'),
    redScore: document.getElementById('red-score'),
    blueScore: document.getElementById('blue-score'),
    gameRedScore: document.getElementById('game-red-score'),
    gameBlueScore: document.getElementById('game-blue-score'),
    timeDisplay: document.getElementById('time-display'),
    roundDisplay: document.getElementById('round-display'),
    roundProgress: document.getElementById('round-progress'),
    timer: document.getElementById('timer'),
    targetWord: document.getElementById('target-word'),
    bannedWords: document.getElementById('banned-words'),
    targetWordContainer: document.querySelector('.card-header'),
    progressCircle: document.querySelector('.progress-ring__circle'),
    passCount: document.getElementById('pass-count-display'),
    turnIndicator: document.getElementById('turn-indicator')
};

const buttons = {
    createRoom: document.getElementById('create-room-btn'),
    joinRoom: document.getElementById('join-room-btn'),
    joinRedTeam: document.getElementById('join-red-team'),
    joinBlueTeam: document.getElementById('join-blue-team'),
    lobbyStart: document.getElementById('lobby-start-btn'),
    correct: document.getElementById('correct-btn'),
    taboo: document.getElementById('taboo-btn'),
    pass: document.getElementById('pass-btn'),
    pause: document.getElementById('pause-btn'),
    home: document.getElementById('home-btn'),
    exitGame: document.getElementById('exit-game-btn'),
    restart: document.getElementById('restart-btn'),
    mute: document.getElementById('mute-btn')
};

const msg = {
    waiting: document.getElementById('waiting-msg'),
    hostControls: document.getElementById('host-controls')
};

let myUsername = "";
let currentRoomId = "";
let myRole = "guesser"; // describer, monitor, guesser
let myTeam = null;
let amIHost = false;
let isMuted = false;

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Event Listeners
    buttons.createRoom.addEventListener('click', createRoom);
    buttons.joinRoom.addEventListener('click', joinRoom);
    buttons.joinRedTeam.addEventListener('click', () => selectTeam('red'));
    buttons.joinBlueTeam.addEventListener('click', () => selectTeam('blue'));
    buttons.lobbyStart.addEventListener('click', requestStartGame);

    // Return to Home / Lobby
    if (buttons.home) {
        buttons.home.addEventListener('click', () => {
            window.location.reload();
        });
    }

    // Exit Game during play
    if (buttons.exitGame) {
        buttons.exitGame.addEventListener('click', () => {
            if (confirm("Oyunadan çıkmak istediğinize emin misiniz?")) {
                window.location.reload();
            }
        });
    }

    if (buttons.restart) {
        buttons.restart.addEventListener('click', () => {
            // Sadece kendim lobiye dönüyorum
            enterLobby(currentRoomId, amIHost);
        });
    }

    // Game Controls
    buttons.correct.addEventListener('click', () => sendAction('correct'));
    buttons.taboo.addEventListener('click', () => sendAction('taboo'));
    buttons.pass.addEventListener('click', () => sendAction('pass'));
    if (buttons.pause) {
        buttons.pause.addEventListener('click', () => {
            socket.emit('togglePause', { roomId: currentRoomId });
        });
    }

    if (buttons.mute) {
        buttons.mute.addEventListener('click', () => {
            isMuted = !isMuted;
            buttons.mute.innerHTML = isMuted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
            buttons.mute.style.opacity = isMuted ? '0.5' : '1';
        });
    }

    if (inputs.time) {
        inputs.time.addEventListener('input', (e) => {
            display.timeDisplay.textContent = e.target.value;
        });
    }

    if (inputs.rounds) {
        inputs.rounds.addEventListener('input', (e) => {
            display.roundDisplay.textContent = e.target.value;
        });
    }
});

// --- Socket Events ---

socket.on('roomCreated', ({ roomId, username }) => {
    currentRoomId = roomId;
    myUsername = username;
    amIHost = true;
    enterLobby(roomId, true);
});

socket.on('joinedRoom', ({ roomId, username }) => {
    currentRoomId = roomId;
    myUsername = username;
    amIHost = false;
    enterLobby(roomId, false);
});

socket.on('updatePlayerList', (players) => {
    display.redTeamList.innerHTML = '';
    display.blueTeamList.innerHTML = '';

    // In-game lists
    const gameRedList = document.getElementById('game-red-list');
    const gameBlueList = document.getElementById('game-blue-list');
    if (gameRedList) gameRedList.innerHTML = '';
    if (gameBlueList) gameBlueList.innerHTML = '';

    players.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p.username + (p.isHost ? ' 👑' : '');

        // Clone for game list
        const liGame = li.cloneNode(true);
        liGame.style.marginBottom = '5px'; // Spacing in game list

        if (p.team === 'red') {
            display.redTeamList.appendChild(li);
            if (gameRedList) gameRedList.appendChild(liGame);
        } else if (p.team === 'blue') {
            display.blueTeamList.appendChild(li);
            if (gameBlueList) gameBlueList.appendChild(liGame);
        }
    });
});

socket.on('updateTeamScores', (teamScores) => {
    display.redScore.textContent = teamScores.red;
    display.blueScore.textContent = teamScores.blue;
    if (display.gameRedScore) display.gameRedScore.textContent = teamScores.red;
    if (display.gameBlueScore) display.gameBlueScore.textContent = teamScores.blue;
});

socket.on('gameStarted', () => {
    switchScreen('game');
    // Init scores
    display.gameRedScore.textContent = display.redScore.textContent || 0;
    display.gameBlueScore.textContent = display.blueScore.textContent || 0;
    updateMyTeamBadge();
});

socket.on('newTurn', (data) => {
    myRole = data.role;
    updateTurnUI(data);

    // Update Round Indicator
    if (display.roundProgress) {
        const cur = data.currentRound || 1;
        const tot = data.totalRounds || 10;
        display.roundProgress.innerText = `TUR: ${cur}/${tot}`;
    }

    // Update Turn Indicator
    const teamName = data.team === 'red' ? 'KIRMIZI TAKIM' : 'MAVİ TAKIM';
    const teamColor = data.team === 'red' ? '#e74c3c' : '#3498db'; // Red / Blue colors

    display.turnIndicator.innerHTML = `SIRA: <span style="color:${teamColor}; font-weight:bold;">${teamName}</span> - ${data.username.toUpperCase()}`;
    display.turnIndicator.style.fontSize = '1.8rem'; // Biraz daha büyütelim (1.5rem -> 1.8rem)
    display.turnIndicator.style.fontWeight = '800';
    display.turnIndicator.style.textShadow = '0 0 10px rgba(0,0,0,0.5)';
    display.turnIndicator.style.marginTop = '15px';

    // Reset Pass UI (count is handled by updatePassCount)
    // Server emits updatePassCount(0) and we handle it there
});

socket.on('timerUpdate', (time) => {
    display.timer.textContent = time;
    updateProgressRing(time);
});

socket.on('pauseState', (isPaused) => {
    if (buttons.pause) {
        buttons.pause.innerHTML = isPaused ? '<i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-pause"></i>';
    }
    document.querySelector('.timer-ring').style.opacity = isPaused ? '0.5' : '1';
});

socket.on('updatePassCount', (count) => {
    if (display.passCount) {
        display.passCount.textContent = `(${count}/3)`;
    }
    // Disable pass button if limit reached
    if (buttons.pass) {
        if (count >= 3) {
            buttons.pass.disabled = true;
            buttons.pass.style.opacity = '0.5';
            buttons.pass.style.cursor = 'not-allowed';
        } else {
            buttons.pass.disabled = false;
            buttons.pass.style.opacity = '1';
            buttons.pass.style.cursor = 'pointer';
        }
    }
});

socket.on('updateCard', (card) => {
    if (myRole === 'describer') {
        showCard(card);
        display.targetWord.textContent = card.word;
    } else if (myRole === 'monitor') {
        showCard(card);
        display.targetWord.textContent = card.word;
    } else {
        hideCard();
        // Guesser text remains set from newTurn
    }
});

socket.on('gameOver', (scores) => {
    switchScreen('result');

    let resultText = "";
    if (scores.red > scores.blue) {
        resultText = `KIRMIZI KAZANDI!\n${scores.red} - ${scores.blue}`;
        document.getElementById('final-score').style.color = '#ff2a6d';
    } else if (scores.blue > scores.red) {
        resultText = `MAVİ KAZANDI!\n${scores.blue} - ${scores.red}`;
        document.getElementById('final-score').style.color = '#2980ff';
    } else {
        resultText = `BERABERE!\n${scores.red} - ${scores.blue}`;
        document.getElementById('final-score').style.color = '#fff';
    }

    document.getElementById('final-score').innerText = resultText;
    document.getElementById('final-score').style.fontSize = '2rem';

    // Hide detailed stats for now as server doesn't send them
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) statsGrid.style.display = 'none';
});

socket.on('error', (message) => {
    alert(message);
});

// --- Functions ---

function createRoom() {
    const username = inputs.username.value.trim();
    if (!username) return alert('Lütfen kullanıcı adı girin');

    // Resume audio context on user interaction
    if (audioCtx.state === 'suspended') audioCtx.resume();

    socket.emit('createRoom', { username });
}

function joinRoom() {
    const username = inputs.username.value.trim();
    const roomId = inputs.roomCode.value.trim().toUpperCase();
    if (!username || !roomId) return alert('Bilgileri eksiksiz girin');

    // Resume audio context on user interaction
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    socket.emit('joinRoom', { roomId, username });
}

function selectTeam(team) {
    myTeam = team;
    socket.emit('selectTeam', { roomId: currentRoomId, team });

    // Visual feedback
    buttons.joinRedTeam.style.opacity = team === 'red' ? '1' : '0.5';
    buttons.joinBlueTeam.style.opacity = team === 'blue' ? '1' : '0.5';
}

function enterLobby(roomId, isHost) {
    display.roomCode.textContent = roomId;
    switchScreen('lobby');

    if (isHost) {
        msg.hostControls.classList.remove('hidden');
        msg.waiting.classList.add('hidden');
    } else {
        msg.hostControls.classList.add('hidden');
        msg.waiting.classList.remove('hidden');
    }
}

function requestStartGame() {
    const time = parseInt(inputs.time.value);
    const rounds = parseInt(inputs.rounds.value);
    socket.emit('startGame', { roomId: currentRoomId, time, rounds });
}

function updateTurnUI(data) {
    // Show/hide controls based on role
    const controlsEl = document.querySelector('.game-controls');
    controlsEl.style.display = 'flex'; // Her zaman göster (Badge için)

    const controlButtons = controlsEl.querySelectorAll('button');

    if (myRole === 'describer') {
        // Describer can control the game
        controlButtons.forEach(btn => btn.style.display = 'flex'); // flex veya inline-block
        showCard(data.card);
        display.targetWord.textContent = data.card.word;
    } else if (myRole === 'monitor') {
        // Monitor (opposite team) sees the card but has no controls
        controlButtons.forEach(btn => btn.style.display = 'none');
        showCard(data.card);
        display.targetWord.textContent = data.card.word + ` (Anlatan: ${data.username})`;
    } else {
        // Guesser (same team) doesn't see card and has no controls
        controlButtons.forEach(btn => btn.style.display = 'none');
        hideCard();
        display.targetWord.textContent = `ANLATIYOR: ${data.username}`;
    }
}

function showCard(card) {
    if (!card) return hideCard();

    display.bannedWords.innerHTML = '';
    card.banned.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        display.bannedWords.appendChild(li);
    });
}

function hideCard() {
    display.bannedWords.innerHTML = '<li>???</li><li>???</li><li>???</li><li>???</li><li>???</li>';
}

function sendAction(type) {
    if (myRole !== 'describer') return;
    socket.emit('action', { roomId: currentRoomId, type });
}

function switchScreen(screenName) {
    Object.values(screens).forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    screens[screenName].classList.remove('hidden');
    setTimeout(() => screens[screenName].classList.add('active'), 10);
}

function updateProgressRing(time) {
    // 80px width -> r=36
    // circumference = 2 * PI * 36 = 226.19
    const totalTime = 60; // Should get from settings but hardcoded for visual
    const circumference = 226;

    const offset = circumference - (time / totalTime) * circumference;
    if (display.progressCircle) {
        display.progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        display.progressCircle.style.strokeDashoffset = offset;
    }
}
socket.on('playEffect', (type) => {
    playSound(type);
});

// --- Sound Effects (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (isMuted) return;

    // Resume context if suspended (browser policy)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'correct') {
        // Çift tonlu, yumuşak "Pling" sesi (Do -> Sol)
        osc.type = 'sine';

        // İlk nota (C5 - Do)
        osc.frequency.setValueAtTime(523.25, now);
        // İkinci nota (G5 - Sol) kısa bir süre sonra
        osc.frequency.setValueAtTime(783.99, now + 0.1);

        // Ses seviyesi zarfı (Envelope)
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05); // Yumuşak giriş
        // Süreyi uzattık: 0.6 -> 1.1 (0.5s ekledik)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

        osc.start(now);
        osc.stop(now + 1.1);
    } else if (type === 'taboo') {
        // Negative 'Buzzer' sound
        osc.type = 'sawtooth'; // Harsh sound
        osc.frequency.setValueAtTime(150, now);
        // Frekans kaymasını da uzat
        osc.frequency.linearRampToValueAtTime(100, now + 0.8);

        gainNode.gain.setValueAtTime(0.3, now);
        // Süreyi uzattık: 0.3 -> 0.8
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.start(now);
        osc.stop(now + 0.8);
    } else if (type === 'pass') {
        // Neutral 'Sweep' sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(450, now + 0.7);

        gainNode.gain.setValueAtTime(0.2, now);
        // Süreyi uzattık: 0.2 -> 0.7
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.start(now);
        osc.stop(now + 0.7);
    }
}

function updateMyTeamBadge() {
    const badge = document.getElementById('my-team-badge');
    const badgeName = document.getElementById('my-team-name');
    if (!badge || !badgeName) return;

    if (myTeam === 'red') {
        badgeName.textContent = "KIRMIZI";
        badgeName.style.color = '#ff2a6d'; // Neon Red
        // badge border color logic if needed
        badge.querySelector('div').style.border = '2px solid #ff2a6d';
        badge.classList.remove('hidden');
    } else if (myTeam === 'blue') {
        badgeName.textContent = "MAVİ";
        badgeName.style.color = '#2980ff'; // Neon Blue
        badge.querySelector('div').style.border = '2px solid #2980ff';
        badge.classList.remove('hidden');
    } else {
        badgeName.textContent = "İZLEYİCİ";
        badgeName.style.color = '#fff';
        badge.querySelector('div').style.border = '2px solid #fff';
        badge.classList.remove('hidden');
    }
}
