const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(__dirname));

// Read data.js content manually to avoid module issues with client-side JS
// We will just copy the data logic here or parse it. 
// For simplicity, I'll include the game data directly here or requires a conversion.
// Since data.js is simple, I'll just load it. 
// Actually, let's keep data.js for client but duplicate the structure for server to control cards.
// Or better: Let the server be the source of truth for data.

const baseCards = [
    // --- SANDBOX & CO-OP & INDIE ---
    { word: "MINECRAFT", banned: ["Blok", "Küp", "Steve", "Creeper", "Elmas"] },
    { word: "TERRARIA", banned: ["2D", "Minecraft", "Boss", "Maden", "Moon Lord"] },
    { word: "STARDEW VALLEY", banned: ["Çiftlik", "Dede", "Ekin", "Mevsim", "Pelican"] },
    { word: "LETHAL COMPANY", banned: ["Hurda", "Canavar", "Şirket", "Gemi", "Ses"] },
    { word: "PHASMOPHOBIA", banned: ["Hayalet", "Telsiz", "Akıl Sağlığı", "Kanıt", "Maymuncuk"] },
    { word: "IT TAKES TWO", banned: ["Çift", "Boşanma", "Bebek", "Kitap", "Co-op"] },
    { word: "A WAY OUT", banned: ["Hapishane", "Kaçış", "İki Kişi", "Leo", "Vincent"] },
    { word: "DONT STARVE", banned: ["Açlık", "Karanlık", "Bilim", "Wilson", "Hayatta Kalma"] },

    // --- HİKAYELİ / AKSİYON / RPG OYUNLARI ---
    { word: "RDR 2", banned: ["Kovboy", "At", "Arthur", "Çete", "Vahşi Batı"] },
    { word: "THE WITCHER 3", banned: ["Geralt", "Canavar", "Büyücü", "Gümüş", "Ciri"] },
    { word: "THE LAST OF US", banned: ["Mantar", "Zombi", "Joel", "Ellie", "Clicker"] },
    { word: "ELDEN RING", banned: ["Yüzük", "Zor", "Boss", "Ağaç", "FromSoftware"] },
    { word: "GOD OF WAR", banned: ["Kratos", "Balta", "Tanrı", "Oğul", "İskandinav"] },
    { word: "CYBERPUNK 2077", banned: ["Gelecek", "Robot", "Keanu", "Night City", "Bug"] },
    { word: "SKYRIM", banned: ["Ejderha", "Dovahkiin", "Ok", "Diz", "Bethesda"] },
    { word: "ASSASSIN'S CREED", banned: ["Suikastçı", "Gizli", "Bıçak", "Tapınakçı", "Hood"] },
    { word: "UNCHARTED", banned: ["Hazine", "Harita", "Nathan", "Macera", "Tırmanma"] },
    { word: "TOMB RAIDER", banned: ["Lara Croft", "Mezar", "Ok", "Arkeolog", "Mağara"] },
    { word: "HORIZON ZERO DAWN", banned: ["Robot", "Dinozor", "Aloy", "Ok", "Kabile"] },
    { word: "DEATH STRANDING", banned: ["Kargo", "Kurye", "Bebek", "Yürüme", "Kojima"] },
    { word: "DETROIT BECOME HUMAN", banned: ["Android", "Robot", "Seçim", "Connor", "İnsan"] },
    { word: "DARK SOULS", banned: ["Ateş", "Zor", "Ölmek", "Ruh", "Şövalye"] },
    { word: "BLOODBORNE", banned: ["Kan", "Avcı", "Canavar", "Viktorya", "Yharnam"] },
    { word: "SEKIRO", banned: ["Ninja", "Kılıç", "Kol", "Samuray", "Japonya"] },
    { word: "FALLOUT", banned: ["Nükleer", "Sığınak", "Radyasyon", "Köpek", "Kıyamet"] },
    { word: "BIOSHOCK", banned: ["Deniz Altı", "Şehir", "Baba", "Kız", "Plazmid"] },
    { word: "METAL GEAR SOLID", banned: ["Snake", "Kutu", "Gizlilik", "Asker", "Kojima"] },
    { word: "DEVIL MAY CRY", banned: ["Dante", "Şeytan", "Kılıç", "Kombo", "Ağlamak"] },
    { word: "BALDUR'S GATE 3", banned: ["Zar", "DnD", "Rol Yapma", "Ayı", "Sıra"] },
    { word: "DIABLO", banned: ["Şeytan", "Cehennem", "Loot", "Zindan", "Blizzard"] },
    { word: "HADES", banned: ["Yeraltı", "Tanrı", "Kaçış", "Baba", "Zeus"] },
    { word: "HOLLOW KNIGHT", banned: ["Böcek", "Ruh", "İğne", "Yeraltı", "Metroidvania"] },
    { word: "STAR WARS JEDI", banned: ["Işın Kılıcı", "Güç", "Jedi", "Galaksi", "Cal"] },
    { word: "MAFIA", banned: ["Gangster", "Araba", "Aile", "Silah", "İtalya"] },
    { word: "HITMAN", banned: ["Ajan 47", "Kel", "Suikast", "Gizlilik", "Barkod"] },
    { word: "BATMAN ARKHAM", banned: ["Joker", "Yarasa", "Gotham", "Dedektif", "Pelerin"] },
    { word: "SPIDER-MAN", banned: ["Ağ", "Örümcek", "New York", "Peter", "Kostüm"] },
    { word: "FAR CRY", banned: ["Ada", "Kötü Adam", "Orman", "Ubisoft", "Kule"] },
    { word: "CONTROL", banned: ["Büro", "Silah", "Uçmak", "Fırlatmak", "Gizem"] },
    { word: "ALAN WAKE", banned: ["Yazar", "Fener", "Karanlık", "Gölge", "Roman"] },
    { word: "DISHONORED", banned: ["Suikast", "Fare", "Maske", "Işınlanma", "Kraliçe"] },
    { word: "DOOM", banned: ["Şeytan", "Cehennem", "Pompalı", "Mars", "Vahşet"] },
    { word: "HALO", banned: ["Master Chief", "Uzaylı", "Kask", "Yüzük", "Cortana"] },
    { word: "HALF-LIFE", banned: ["Gordon", "Levye", "Bilim", "Uzaylı", "Valve"] },
    { word: "LEFT 4 DEAD", banned: ["Zombi", "4 Kişi", "Cadı", "Tank", "Güvenli Oda"] },
    { word: "STALKER", banned: ["Çernobil", "Radyasyon", "Anomali", "Rusça", "Gaz Maskesi"] },
    { word: "METRO", banned: ["Tren", "Tünel", "Rusya", "Gaz Maskesi", "Canavar"] },
    { word: "DYING LIGHT", banned: ["Parkur", "Zombi", "Gece", "Şehir", "Harran"] },
    { word: "DAYS GONE", banned: ["Motosiklet", "Sürü", "Zombi", "Deacon", "Oregon"] },

    // --- KORKU OYUNLARI ---
    { word: "RESIDENT EVIL", banned: ["Zombi", "Umbrella", "Rakun", "Virüs", "Leon"] },
    { word: "OUTLAST", banned: ["Kamera", "Deliler", "Pil", "Kaçmak", "Hastane"] },
    { word: "FNAF", banned: ["Ayı", "Pizza", "Kamera", "Robot", "Gece"] },
    { word: "RE: VILLAGE", banned: ["Köy", "Vampir", "Kurtadam", "Ethan", "Rose"] },

    // --- KARAKTERLER: RDR & WESTERN ---
    { word: "ARTHUR MORGAN", banned: ["RDR2", "Kovboy", "Verem", "Günlük", "Fedakarlık"] },
    { word: "JOHN MARSTON", banned: ["RDR1", "Yara İzi", "Baba", "Çiftlik", "Abigail"] },
    { word: "DUTCH VAN DER LINDE", banned: ["Plan", "Tahiti", "Para", "Lider", "İhanet"] },
    { word: "MICAH BELL", banned: ["Hain", "Fare", "Bıyık", "Silahşör", "Kötü"] },
    { word: "SADIE ADLER", banned: ["Dul", "Ödül Avcısı", "Sarı Saç", "İntikam", "Silah"] },
    { word: "HOSEA MATTHEWS", banned: ["Yaşlı", "Akıl Hoca", "Dolandırıcı", "Kamp", "Dost"] },
    { word: "CHARLES SMITH", banned: ["Kızılderili", "Ok", "Avcı", "Sessiz", "Sadık"] },

    // --- KARAKTERLER: WITCHER ---
    { word: "GERALT", banned: ["Witcher", "Ak Saç", "Rivyalı", "Kurt", "Kılıç"] },
    { word: "YENNEFER", banned: ["Büyücü", "Siyah", "Leylak", "Aşk", "Vengerberg"] },
    { word: "CIRI", banned: ["Kız", "Işınlanma", "Kılıç", "Kan", "İmparatoriçe"] },
    { word: "TRISS MERIGOLD", banned: ["Kızıl", "Büyücü", "Ateş", "Maribor", "Geralt"] },
    { word: "VESEMIR", banned: ["Usta", "Yaşlı", "Kurt", "Kale", "Öğretmen"] },
    { word: "EREDIN", banned: ["Vahşi Av", "Kral", "Witcher", "Kış", "Elf"] },
    { word: "GAUNTER O'DIMM", banned: ["Ayna", "Şeytan", "Kaşık", "Anlaşma", "Zaman"] },

    // --- KARAKTERLER: THE LAST OF US ---
    { word: "JOEL MILLER", banned: ["Baba", "Saat", "Gitar", "Kaçakçı", "Sakal"] },
    { word: "ELLIE WILLIAMS", banned: ["Bağışık", "Kız", "Bıçak", "Dövme", "Dina"] },
    { word: "ABBY ANDERSON", banned: ["Kaslı", "Golf", "Sopa", "İntikam", "WLF"] },
    { word: "TOMMY MILLER", banned: ["Kardeş", "Jackson", "Keskin Nişancı", "Baraj", "Maria"] },

    // --- KARAKTERLER: RESIDENT EVIL ---
    { word: "LEON S. KENNEDY", banned: ["Saç", "Polis", "Ajan", "Ada", "Raccoon"] },
    { word: "JILL VALENTINE", banned: ["Polis", "STARS", "Mavi", "Nemesis", "Kilit"] },
    { word: "CHRIS REDFIELD", banned: ["Kaya", "Yumruk", "Asker", "Kardeş", "Claire"] },
    { word: "CLAIRE REDFIELD", banned: ["Kızıl", "Motosiklet", "Kardeş", "Mont", "Şemsiye"] },
    { word: "ALBERT WESKER", banned: ["Gözlük", "Hain", "Virüs", "Sarı", "Matrix"] },
    { word: "NEMESIS", banned: ["Dev", "Roket", "Diş", "Takip", "STARS"] },
    { word: "LADY DIMITRESCU", banned: ["Uzun", "Vampir", "Şapka", "Şato", "Anne"] },
    { word: "ADA WONG", banned: ["Kırmızı", "Elbise", "Casus", "Leon", "Gizemli"] },
    { word: "KARL HEISENBERG", banned: ["Fabrika", "Metal", "Mıknatıs", "Köy", "Ethan"] },
    { word: "ETHAN WINTERS", banned: ["El", "Baba", "Köy", "Yüzsüz", "Mia"] },

    // --- KARAKTERLER: SOULS & ELDEN RING ---
    { word: "GWYN", banned: ["Plin Plin Plon", "Lord of Cinder", "Ateş", "Güneş", "Şimşek"] }, // Eklendi!
    { word: "MALENIA", banned: ["Kılıç", "Çürük", "Kanat", "Zor", "Miquella"] },
    { word: "RANNI", banned: ["Cadı", "Mavi", "Dört Kol", "Ay", "Bebek"] },
    { word: "RADAHN", banned: ["General", "At", "Yerçekimi", "Kılıç", "Meteor"] },
    { word: "MELINA", banned: ["Kız", "Göz", "Yakmak", "Rehber", "Ağaç"] },
    { word: "SOLAIRE", banned: ["Güneş", "Övgü", "Şövalye", "Miyğfer", "Dost"] },
    { word: "ARTORIAS", banned: ["Kurt", "Kılıç", "Abyss", "Kol", "Şövalye"] },
    { word: "WOLF (SEKIRO)", banned: ["Shinobi", "Kuro", "Tek Kol", "Ölümsüz", "Kılıç"] },
    { word: "GODFREY", banned: ["İlk Lord", "Aslan", "Balta", "Elden", "Savaşçı"] },
    { word: "MOHG", banned: ["Kan", "Mızrak", "Miquella", "Lord", "Yeraltı"] },

    // --- KARAKTERLER: DİĞER EFSANELER ---
    { word: "KRATOS", banned: ["Kel", "Sakal", "Öfke", "Yunan", "Baba"] },
    { word: "ATREUS", banned: ["Çocuk", "Ok", "Loki", "Boy", "Oğul"] },
    { word: "NATHAN DRAKE", banned: ["Hırsız", "Esprili", "Yüzük", "Elena", "Sully"] },
    { word: "LARA CROFT", banned: ["Örgü", "İngiliz", "Tabanca", "Şort", "Tomb"] },
    { word: "EZIO AUDITORE", banned: ["İtalyan", "Pelerin", "Floransa", "Usta", "Aile"] },
    { word: "ALTAIR", banned: ["İlk", "Parmak", "Beyaz", "Kudüs", "Kartal"] },
    { word: "SOLID SNAKE", banned: ["Bandana", "Sigara", "Asker", "Klon", "Gen"] },
    { word: "BIG BOSS", banned: ["Göz Bandı", "Lider", "Baba", "Asker", "Efsane"] },
    { word: "JIN SAKAI", banned: ["Samuray", "Hayalet", "Maske", "Amca", "Onur"] },
    { word: "ALOY", banned: ["Kızıl", "Ok", "Focus", "Anne", "Yabani"] },
    { word: "DEACON ST JOHN", banned: ["Motorcu", "Şapka", "Yelek", "Sarah", "Sakal"] },
    { word: "MASTER CHIEF", banned: ["Yeşil", "Zırh", "Spartan", "117", "Halo"] },
    { word: "DOOM SLAYER", banned: ["Kask", "Yeşil", "Tavşan", "Öfke", "Suskun"] },
    { word: "GORDON FREEMAN", banned: ["Gözlük", "Sakal", "Fizikçi", "Konuşmaz", "Levye"] },
    { word: "G-MAN", banned: ["Takım Elbise", "Çanta", "Gizemli", "Zaman", "Uyan"] },
    { word: "DANTE", banned: ["Kırmızı", "Peto", "Pizza", "Şeytan", "Beyaz Saç"] },
    { word: "VERGIL", banned: ["Mavi", "Katan", "Güç", "Kardeş", "Saç"] },
    { word: "2B", banned: ["Robot", "Göz Bandı", "Etek", "Kılıç", "Beyaz"] },
    { word: "SCORPION", banned: ["Sarı", "Zincir", "Ateş", "Gel Buraya", "Ninja"] },
    { word: "SUB-ZERO", banned: ["Mavi", "Buz", "Dondurma", "Ninja", "Lin Kuei"] },
    { word: "AGENT 47", banned: ["Kel", "Takım", "Kırmızı", "Kravat", "Piyano"] },
    { word: "MAX PAYNE", banned: ["Polis", "Ağrı kesici", "Zaman", "New York", "Aile"] },
    { word: "TREVOR PHILIPS", banned: ["Deli", "Kel", "Çöl", "GTA 5", "Uçak"] },
    { word: "CJ", banned: ["San Andreas", "Bisiklet", "Atlet", "Grove", "Tren"] },
    { word: "TOMMY VERCETTI", banned: ["Gömlek", "Vice City", "Mafya", "Yüzme", "Otel"] },
    { word: "NIKO BELLIC", banned: ["Kuzen", "Bowling", "Sırp", "Mont", "Özgürlük"] },
    { word: "VAAS", banned: ["Delilik", "Korsan", "Mohawk", "Ada", "Tanım"] },
    { word: "SANS", banned: ["İskelet", "Mavi", "Şaka", "Kemik", "Kardeş"] },
    { word: "ZAGREUS", banned: ["Hades", "Prens", "Kılıç", "Kan", "Ayak"] },
];

// Helper to generate large dataset
function generateCards(targetCount) {
    let cards = [...baseCards];
    while (cards.length < targetCount) {
        const remaining = targetCount - cards.length;
        const chunk = baseCards.slice(0, remaining).map(card => ({ ...card }));
        cards = cards.concat(chunk);
    }
    return cards;
}

const ALL_CARDS = generateCards(100); // Server keeps the deck

// Game State Management
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    socket.on('createRoom', ({ username }) => {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        rooms.set(roomId, {
            id: roomId,
            players: [{ id: socket.id, username, score: 0, isHost: true, team: null }],
            gameState: 'LOBBY',
            currentCard: null,
            timer: 60,
            settings: { time: 60 },
            turnIndex: 0,
            turnIndex: 0,
            currentTeam: 'red', // Track which team is currently describing
            deck: [...ALL_CARDS].sort(() => Math.random() - 0.5),
            teamScores: { red: 0, blue: 0 },
            passCount: 0,
            isPaused: false
        });

        socket.join(roomId);
        socket.emit('roomCreated', { roomId, username });
        io.to(roomId).emit('updatePlayerList', rooms.get(roomId).players);
    });

    socket.on('joinRoom', ({ roomId, username }) => {
        const room = rooms.get(roomId);
        if (room) {
            room.players.push({ id: socket.id, username, score: 0, isHost: false, team: null });
            socket.join(roomId);
            socket.emit('joinedRoom', { roomId, username });
            io.to(roomId).emit('updatePlayerList', room.players);
        } else {
            socket.emit('error', 'Oda bulunamadı!');
        }
    });

    socket.on('selectTeam', ({ roomId, team }) => {
        const room = rooms.get(roomId);
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.team = team;
            io.to(roomId).emit('updatePlayerList', room.players);
            io.to(roomId).emit('updateTeamScores', room.teamScores);
        }
    });

    socket.on('startGame', ({ roomId, time }) => {
        const room = rooms.get(roomId);
        if (room) {
            room.settings.time = time;
            room.gameState = 'PLAYING';
            room.turnIndex = 0;
            room.currentTeam = 'red';
            startTurn(roomId);
            io.to(roomId).emit('gameStarted');
        }
    });

    socket.on('togglePause', ({ roomId }) => {
        const room = rooms.get(roomId);
        if (!room) return;
        room.isPaused = !room.isPaused;
        io.to(roomId).emit('pauseState', room.isPaused);
    });

    socket.on('action', ({ roomId, type }) => {
        const room = rooms.get(roomId);
        if (!room) return;
        if (room.isPaused) return;

        const activePlayer = room.players[room.turnIndex];
        const playerTeam = activePlayer.team;

        // Safety check: if player has no team, don't update score (or default to red?)
        if (!playerTeam) return;

        if (type === 'correct') {
            room.teamScores[playerTeam] += 1;
            nextCard(roomId);
        } else if (type === 'taboo') {
            room.teamScores[playerTeam] -= 1;
            io.to(roomId).emit('tabooFault');
            nextCard(roomId);
        } else if (type === 'pass') {
            if (room.passCount < 3) {
                room.passCount++;
                io.to(roomId).emit('updatePassCount', room.passCount);
                nextCard(roomId);
            }
        }

        io.to(roomId).emit('updateTeamScores', room.teamScores);
    });

    socket.on('disconnect', () => {
        // Handle disconnect logic (remove player from room, delete empty room)
        rooms.forEach((room, roomId) => {
            const index = room.players.findIndex(p => p.id === socket.id);
            if (index !== -1) {
                room.players.splice(index, 1);
                io.to(roomId).emit('updatePlayerList', room.players);
                if (room.players.length === 0) {
                    if (room.timerInterval) clearInterval(room.timerInterval);
                    rooms.delete(roomId);
                }
            }
        });
    });
});

function startTurn(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    room.passCount = 0; // Reset pass count
    io.to(roomId).emit('updatePassCount', 0);

    room.timer = room.settings.time;
    room.currentCard = room.deck.pop();

    // Reshuffle if empty
    if (!room.currentCard) {
        room.deck = [...ALL_CARDS].sort(() => Math.random() - 0.5);
        room.currentCard = room.deck.pop();
    }

    const activePlayer = room.players[room.turnIndex];
    const describerTeam = activePlayer.team;

    // Send different info to different players based on their role
    room.players.forEach(player => {
        const playerSocket = io.sockets.sockets.get(player.id);
        if (!playerSocket) return;

        if (player.id === activePlayer.id) {
            // The describer sees the card
            playerSocket.emit('newTurn', {
                activePlayerId: activePlayer.id,
                username: activePlayer.username,
                timer: room.timer,
                role: 'describer',
                card: room.currentCard
            });
        } else if (player.team !== describerTeam) {
            // Opposite team sees the card (to catch taboo)
            playerSocket.emit('newTurn', {
                activePlayerId: activePlayer.id,
                username: activePlayer.username,
                timer: room.timer,
                role: 'monitor',
                card: room.currentCard
            });
        } else {
            // Same team doesn't see the card (guessing)
            playerSocket.emit('newTurn', {
                activePlayerId: activePlayer.id,
                username: activePlayer.username,
                timer: room.timer,
                role: 'guesser',
                card: null
            });
        }
    });

    // Clear existing timer if any
    if (room.timerInterval) clearInterval(room.timerInterval);

    room.timerInterval = setInterval(() => {
        if (room.isPaused) return;

        room.timer--;
        io.to(roomId).emit('timerUpdate', room.timer);

        if (room.timer <= 0) {
            clearInterval(room.timerInterval);
            endTurn(roomId);
        }
    }, 1000);
}

function nextCard(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    room.currentCard = room.deck.pop();
    if (!room.currentCard) {
        room.deck = [...ALL_CARDS].sort(() => Math.random() - 0.5);
        room.currentCard = room.deck.pop();
    }

    io.to(roomId).emit('updateCard', room.currentCard);
}

function endTurn(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    // Find next player from opposite team
    const currentPlayer = room.players[room.turnIndex];
    const currentTeam = currentPlayer.team;
    const oppositeTeam = currentTeam === 'red' ? 'blue' : 'red';

    // Find first player from opposite team
    let nextIndex = -1;
    for (let i = 0; i < room.players.length; i++) {
        const checkIndex = (room.turnIndex + 1 + i) % room.players.length;
        if (room.players[checkIndex].team === oppositeTeam) {
            nextIndex = checkIndex;
            break;
        }
    }

    // If no player found from opposite team, stay with current player (shouldn't happen normally)
    if (nextIndex === -1) {
        nextIndex = (room.turnIndex + 1) % room.players.length;
    }

    room.turnIndex = nextIndex;
    startTurn(roomId);
}

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});