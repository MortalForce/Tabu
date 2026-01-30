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
    time: document.getElementById('time-input')
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
    pause: document.getElementById('pause-btn')
};

const msg = {
    waiting: document.getElementById('waiting-msg'),
    hostControls: document.getElementById('host-controls')
};

let myUsername = "";
let currentRoomId = "";
let myRole = "guesser"; // describer, monitor, guesser
let myTeam = null;

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Event Listeners
    buttons.createRoom.addEventListener('click', createRoom);
    buttons.joinRoom.addEventListener('click', joinRoom);
    buttons.joinRedTeam.addEventListener('click', () => selectTeam('red'));
    buttons.joinBlueTeam.addEventListener('click', () => selectTeam('blue'));
    buttons.lobbyStart.addEventListener('click', requestStartGame);

    // Game Controls
    buttons.correct.addEventListener('click', () => sendAction('correct'));
    buttons.taboo.addEventListener('click', () => sendAction('taboo'));
    buttons.pass.addEventListener('click', () => sendAction('pass'));
    if (buttons.pause) {
        buttons.pause.addEventListener('click', () => {
            socket.emit('togglePause', { roomId: currentRoomId });
        });
    }

    if (inputs.time) {
        inputs.time.addEventListener('input', (e) => {
            display.timeDisplay.textContent = e.target.value;
        });
    }
});

// --- Socket Events ---

socket.on('roomCreated', ({ roomId, username }) => {
    currentRoomId = roomId;
    myUsername = username;
    enterLobby(roomId, true);
});

socket.on('joinedRoom', ({ roomId, username }) => {
    currentRoomId = roomId;
    myUsername = username;
    enterLobby(roomId, false);
});

socket.on('updatePlayerList', (players) => {
    display.redTeamList.innerHTML = '';
    display.blueTeamList.innerHTML = '';

    players.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p.username + (p.isHost ? ' 👑' : '');

        if (p.team === 'red') {
            display.redTeamList.appendChild(li);
        } else if (p.team === 'blue') {
            display.blueTeamList.appendChild(li);
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
});

socket.on('newTurn', (data) => {
    myRole = data.role;
    updateTurnUI(data);

    // Update Turn Indicator
    // Determine Team Color/Name
    // We don't have team info in data, but we can surmise or update server.
    // simpler: "SIRA: [Username]"
    display.turnIndicator.textContent = `SIRA: ${data.username}`;

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

socket.on('error', (message) => {
    alert(message);
});

// --- Functions ---

function createRoom() {
    const username = inputs.username.value.trim();
    if (!username) return alert('Lütfen kullanıcı adı girin');
    socket.emit('createRoom', { username });
}

function joinRoom() {
    const username = inputs.username.value.trim();
    const roomId = inputs.roomCode.value.trim().toUpperCase();
    if (!username || !roomId) return alert('Bilgileri eksiksiz girin');

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
    socket.emit('startGame', { roomId: currentRoomId, time });
}

function updateTurnUI(data) {
    // Show/hide controls based on role
    const controlsEl = document.querySelector('.game-controls');

    if (myRole === 'describer') {
        // Describer can control the game
        controlsEl.style.display = 'flex';
        showCard(data.card);
        display.targetWord.textContent = data.card.word;
    } else if (myRole === 'monitor') {
        // Monitor (opposite team) sees the card but has no controls
        controlsEl.style.display = 'none';
        showCard(data.card);
        display.targetWord.textContent = data.card.word + ` (Anlatan: ${data.username})`;
    } else {
        // Guesser (same team) doesn't see card and has no controls
        controlsEl.style.display = 'none';
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
    // 50px width -> r=22 (approx)
    // circumference = 2 * PI * 22 = 138.2
    const totalTime = 60; // Should get from settings but hardcoded for visual
    const circumference = 138;

    const offset = circumference - (time / totalTime) * circumference;
    if (display.progressCircle) {
        display.progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        display.progressCircle.style.strokeDashoffset = offset;
    }
}
