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

app.use(express.static(__dirname));

const baseCards = [
    { word: "MINECRAFT", banned: ["Blok", "Küp", "Steve", "Creeper", "Elmas"] },
    { word: "TERRARIA", banned: ["2D", "Minecraft", "Boss", "Maden", "Moon Lord"] },
    { word: "STARDEW VALLEY", banned: ["Çiftlik", "Dede", "Ekin", "Mevsim", "Pelican"] },
    { word: "LETHAL COMPANY", banned: ["Hurda", "Canavar", "Şirket", "Gemi", "Ses"] },
    { word: "PHASMOPHOBIA", banned: ["Hayalet", "Telsiz", "Akıl Sağlığı", "Kanıt", "Maymuncuk"] },
    { word: "IT TAKES TWO", banned: ["Çift", "Boşanma", "Bebek", "Kitap", "Co-op"] },
    { word: "A WAY OUT", banned: ["Hapishane", "Kaçış", "İki Kişi", "Leo", "Vincent"] },
    { word: "DONT STARVE", banned: ["Açlık", "Karanlık", "Bilim", "Wilson", "Hayatta Kalma"] },
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
    { word: "RESIDENT EVIL", banned: ["Zombi", "Umbrella", "Rakun", "Virüs", "Leon"] },
    { word: "OUTLAST", banned: ["Kamera", "Deliler", "Pil", "Kaçmak", "Hastane"] },
    { word: "FNAF", banned: ["Ayı", "Pizza", "Kamera", "Robot", "Gece"] },
    { word: "RE: VILLAGE", banned: ["Köy", "Vampir", "Kurtadam", "Ethan", "Rose"] },
    { word: "ARTHUR MORGAN", banned: ["RDR2", "Kovboy", "Verem", "Günlük", "Fedakarlık"] },
    { word: "JOHN MARSTON", banned: ["RDR1", "Yara İzi", "Baba", "Çiftlik", "Abigail"] },
    { word: "DUTCH VAN DER LINDE", banned: ["Plan", "Tahiti", "Para", "Lider", "İhanet"] },
    { word: "MICAH BELL", banned: ["Hain", "Fare", "Bıyık", "Silahşör", "Kötü"] },
    { word: "SADIE ADLER", banned: ["Dul", "Ödül Avcısı", "Sarı Saç", "İntikam", "Silah"] },
    { word: "HOSEA MATTHEWS", banned: ["Yaşlı", "Akıl Hoca", "Dolandırıcı", "Kamp", "Dost"] },
    { word: "CHARLES SMITH", banned: ["Kızılderili", "Ok", "Avcı", "Sessiz", "Sadık"] },
    { word: "GERALT", banned: ["Witcher", "Ak Saç", "Rivyalı", "Kurt", "Kılıç"] },
    { word: "YENNEFER", banned: ["Büyücü", "Siyah", "Leylak", "Aşk", "Vengerberg"] },
    { word: "CIRI", banned: ["Kız", "Işınlanma", "Kılıç", "Kan", "İmparatoriçe"] },
    { word: "TRISS MERIGOLD", banned: ["Kızıl", "Büyücü", "Ateş", "Maribor", "Geralt"] },
    { word: "VESEMIR", banned: ["Usta", "Yaşlı", "Kurt", "Kale", "Öğretmen"] },
    { word: "EREDIN", banned: ["Vahşi Av", "Kral", "Witcher", "Kış", "Elf"] },
    { word: "GAUNTER O'DIMM", banned: ["Ayna", "Şeytan", "Kaşık", "Anlaşma", "Zaman"] },
    { word: "JOEL MILLER", banned: ["Baba", "Saat", "Gitar", "Kaçakçı", "Sakal"] },
    { word: "ELLIE WILLIAMS", banned: ["Bağışık", "Kız", "Bıçak", "Dövme", "Dina"] },
    { word: "ABBY ANDERSON", banned: ["Kaslı", "Golf", "Sopa", "İntikam", "WLF"] },
    { word: "TOMMY MILLER", banned: ["Kardeş", "Jackson", "Keskin Nişancı", "Baraj", "Maria"] },
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

function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    console.log(`[SHUFFLE] Shuffled ${newArray.length} cards. First 3: ${newArray.slice(0, 3).map(c => c.word).join(', ')}`);
    return newArray;
}

const ALL_CARDS = baseCards; // Use all cards from baseCards directly

// Game State Management
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    socket.on('createRoom', ({ username }) => {
        const roomId = Math.random().toString(36).toUpperCase().substring(2, 8).padEnd(6, 'X');
        rooms.set(roomId, {
            id: roomId,
            players: [{ id: socket.id, username, score: 0, isHost: true, team: null }],
            gameState: 'LOBBY',
            currentCard: null,
            timer: 60,
            settings: { time: 60 },
            turnIndex: 0,
            currentTeam: 'red', // Track which team is currently describing
            deck: shuffle(ALL_CARDS),
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

    socket.on('startGame', ({ roomId, time, rounds }) => {
        const room = rooms.get(roomId);
        if (room) {
            // Takımları karıştırarak sıraya diz (Görsel liste için)
            const redTeam = room.players.filter(p => p.team === 'red');
            const blueTeam = room.players.filter(p => p.team === 'blue');
            const others = room.players.filter(p => p.team !== 'red' && p.team !== 'blue');

            const newOrder = [];
            const maxLen = Math.max(redTeam.length, blueTeam.length);

            for (let i = 0; i < maxLen; i++) {
                if (i < redTeam.length) newOrder.push(redTeam[i]);
                if (i < blueTeam.length) newOrder.push(blueTeam[i]);
            }
            newOrder.push(...others);
            room.players = newOrder;
            io.to(roomId).emit('updatePlayerList', room.players);

            // Oyun Ayarları
            room.settings.time = time;
            room.settings.rounds = rounds || 10; // Varsayılan 10 tur
            room.currentRound = 1;

            // Reset Scores & State for new game
            room.teamScores = { red: 0, blue: 0 };
            room.passCount = 0;
            io.to(roomId).emit('updateTeamScores', room.teamScores);

            room.gameState = 'PLAYING';

            // SIRA MANTIĞI: Takım Takım ilerle
            room.redNextIdx = 0;
            room.blueNextIdx = 0;
            room.nextTeamToPlay = Math.random() < 0.5 ? 'red' : 'blue'; // Başlangıç takımı rastgele

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
        if (!room || room.gameState !== 'PLAYING' || room.isPaused) return;

        const activePlayer = room.players[room.turnIndex];
        if (!activePlayer || !activePlayer.team) {
            console.error('Action failed: activePlayer or team is undefined', { turnIndex: room.turnIndex });
            return;
        }
        
        const playerTeam = activePlayer.team;

        if (type === 'correct') {
            room.teamScores[playerTeam] += 1;
            io.to(roomId).emit('playEffect', 'correct');
            nextCard(roomId);
        } else if (type === 'taboo') {
            room.teamScores[playerTeam] -= 1;
            io.to(roomId).emit('tabooFault');
            io.to(roomId).emit('playEffect', 'taboo');
            nextCard(roomId);
        } else if (type === 'pass') {
            if (room.passCount < 3) {
                room.passCount++;
                io.to(roomId).emit('updatePassCount', room.passCount);
                io.to(roomId).emit('playEffect', 'pass');
                nextCard(roomId);
            }
        }

        io.to(roomId).emit('updateTeamScores', room.teamScores);
    });

    socket.on('disconnect', () => {
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

    // Hangi takımın sırasıysa, o takımın listesindeki sıradaki oyuncuyu seç.
    const teamToPlay = room.nextTeamToPlay;
    const teamPlayers = room.players.filter(p => p.team === teamToPlay);

    // Eğer o takımda oyuncu yoksa veya takım boşsa, diğer takıma geç
    if (teamPlayers.length === 0) {
        console.warn(`No players in ${teamToPlay} team for room ${roomId}. Skipping turn.`);
        room.nextTeamToPlay = teamToPlay === 'red' ? 'blue' : 'red';

        // Sonsuz döngü kontrolü eklenebilir ama basitlik için:
        // Tur sayısını artırmadan diğer takıma geçiyoruz, ama tur limitini kontrol etmeli miyiz?
        // Şimdilik pas geçip tekrar deniyoruz.
        // startTurn içinde zaten sonsuz döngüyü engelleyen bir yapı tam yok ama oyuncu varsa çalışır.

        const otherTeamPlayers = room.players.filter(p => p.team === room.nextTeamToPlay);
        if (otherTeamPlayers.length === 0) return; // İki takım da boşsa dur.

        startTurn(roomId);
        return;
    }

    // O takımın sıradaki oyuncusunu bul
    let playerIdxInTeam;
    if (teamToPlay === 'red') {
        playerIdxInTeam = room.redNextIdx % teamPlayers.length;
        room.redNextIdx++;
    } else { // teamToPlay === 'blue'
        playerIdxInTeam = room.blueNextIdx % teamPlayers.length;
        room.blueNextIdx++;
    }

    const activePlayer = teamPlayers[playerIdxInTeam];

    // Global listedeki indexini bul
    room.turnIndex = room.players.findIndex(p => p.id === activePlayer.id);
    room.currentTeam = teamToPlay;

    // -----------------------------------

    room.passCount = 0; // Reset pass count
    io.to(roomId).emit('updatePassCount', 0);

    room.timer = room.settings.time;
    room.currentCard = room.deck.pop();

    if (!room.currentCard) {
        console.log(`[Room ${roomId}] Deck empty, reshuffling...`);
        room.deck = shuffle(ALL_CARDS);
        room.currentCard = room.deck.pop();
    }
    
    console.log(`[Room ${roomId}] New turn - Card: ${room.currentCard?.word} (${room.deck.length} cards remaining)`);
    console.log(`[Room ${roomId}] Next 3 cards in deck: ${room.deck.slice(-3).map(c => c?.word).join(', ')}`);


    const describerTeam = activePlayer.team;

    // Send different info to different players based on their role
    room.players.forEach(player => {
        const playerSocket = io.sockets.sockets.get(player.id);
        if (!playerSocket) return;

        const commonData = {
            activePlayerId: activePlayer.id,
            username: activePlayer.username,
            team: activePlayer.team,
            timer: room.timer,
            currentRound: room.currentRound || 1,
            totalRounds: room.settings ? (room.settings.rounds || 10) : 10
        };

        if (player.id === activePlayer.id) {
            playerSocket.emit('newTurn', { ...commonData, role: 'describer', card: room.currentCard });
        } else if (player.team !== describerTeam) {
            playerSocket.emit('newTurn', { ...commonData, role: 'monitor', card: room.currentCard });
        } else {
            playerSocket.emit('newTurn', { ...commonData, role: 'guesser', card: null });
        }
    });

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
        console.log(`[Room ${roomId}] Deck empty, reshuffling...`);
        room.deck = shuffle(ALL_CARDS);
        room.currentCard = room.deck.pop();
    }
    
    console.log(`[Room ${roomId}] Next card: ${room.currentCard?.word} (${room.deck.length} cards remaining)`);
    io.to(roomId).emit('updateCard', room.currentCard);
}

function endTurn(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    // Turu tamamladık, sayacı artır
    room.currentRound++;

    // Tur limiti kontrolü
    if (room.currentRound > room.settings.rounds) {
        io.to(roomId).emit('gameOver', room.teamScores);
        // Oyunu bitir (GameState temizliği veya reset yapılabilir)
        return;
    }

    // Sadece sıradaki takımı değiştir
    room.nextTeamToPlay = room.nextTeamToPlay === 'red' ? 'blue' : 'red';

    startTurn(roomId);
}

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});