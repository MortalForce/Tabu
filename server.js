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
    // --- GAMES ---
    { word: "MINECRAFT", banned: ["Blok", "Küp", "Kazma", "Steve", "Creeper"] },
    { word: "GTA", banned: ["Araba", "Hırsız", "Polis", "Görev", "Rokstar"] },
    { word: "LOL", banned: ["League", "Mid", "Orman", "Kule", "Minyon"] },
    { word: "CS:GO", banned: ["Silah", "Bomba", "Terörist", "AWP", "Dust 2"] },
    { word: "VALORANT", banned: ["Riot", "Ajan", "Spike", "Silah", "Yetenek"] },
    { word: "PUBG", banned: ["Tava", "Uçak", "Loot", "Alan", "Çorba"] },
    { word: "FORTNITE", banned: ["İnşa", "Dans", "Otobüs", "Epic", "Skin"] },
    { word: "FIFA", banned: ["Futbol", "EA", "Gol", "Kart", "Ultimate"] },
    { word: "GOD OF WAR", banned: ["Kratos", "Balta", "Zeus", "Oğlu", "Sparta"] },
    { word: "WITCHER", banned: ["Geralt", "Canavar", "Kılıç", "Büyü", "Dizi"] },
    { word: "SKYRIM", banned: ["Ejderha", "Büyü", "Ok", "Diz", "Nord"] },
    { word: "SONIC", banned: ["Kirpi", "Mavi", "Hız", "Yüzük", "Sega"] },
    { word: "TETRIS", banned: ["Blok", "Şekil", "Düşmek", "Satır", "Puan"] },
    { word: "PACMAN", banned: ["Sarı", "Yemek", "Hayalet", "Labirent", "Kiraz"] },
    { word: "AMONG US", banned: ["Imposter", "Uzay", "Katil", "Görev", "Şüpheli"] },
    { word: "ROBLOX", banned: ["Oyun", "Çocuk", "Karakter", "İnşa", "Robux"] },
    { word: "SIMS", banned: ["Ev", "Yaşam", "Havuz", "Simoleon", "Aile"] },
    { word: "ASSASSIN'S CREED", banned: ["Gizli", "Bıçak", "Tapınakçı", "Hood", "Ezio"] },
    { word: "RESIDENT EVIL", banned: ["Zombi", "Umbrella", "Virüs", "Korku", "Leon"] },
    { word: "SILENT HILL", banned: ["Sis", "Korku", "Piramit", "Kafa", "Kasaba"] },
    { word: "PORTAL", banned: ["Silah", "Turuncu", "Mavi", "Kek", "GLaDOS"] },
    { word: "DOTA 2", banned: ["Valve", "MOBA", "Hero", "Roshan", "Ancient"] },
    { word: "ROCKET LEAGUE", banned: ["Araba", "Futbol", "Top", "Uçmak", "Gol"] },
    { word: "OVERWATCH", banned: ["Blizzard", "Hero", "Payload", "Tank", "Healer"] },
    { word: "APEX LEGENDS", banned: ["Respawn", "Battle Royale", "Skill", "Squad", "Loot"] },
    { word: "CALL OF DUTY", banned: ["Savaş", "Silah", "Asker", "Warzone", "Captain"] },
    { word: "HALO", banned: ["Master Chief", "Xbox", "Cortana", "Uzaylı", "Silah"] },
    { word: "DOOM", banned: ["Şeytan", "Cehennem", "Silah", "Müzik", "Slayer"] },
    { word: "FALLOUT", banned: ["Nükleer", "Shelter", "Radyasyon", "Wasteland", "Pipboy"] },
    { word: "CYBERPUNK 2077", banned: ["Gelecek", "Şehir", "Keanu", "Bug", "Robot"] },
    { word: "ELDEN RING", banned: ["Zor", "Boss", "Yüzük", "FromSoftware", "Soul"] },
    { word: "DARK SOULS", banned: ["Ölmek", "Zor", "Bonfire", "Şövalye", "Dodge"] },
    { word: "STREET FIGHTER", banned: ["Dövüş", "Hadouken", "Ryu", "Ken", "Capcom"] },
    { word: "MORTAL KOMBAT", banned: ["Dövüş", "Fatality", "Kan", "Scorpion", "Sub-Zero"] },
    { word: "TEKKEN", banned: ["Dövüş", "Turnuva", "Jin", "Kazuya", "Panda"] },
    { word: "RED DEAD REDEMPTION", banned: ["Kovboy", "At", "Vahşi Batı", "Arthur", "Silah"] },
    { word: "LAST OF US", banned: ["Zombi", "Ellie", "Joel", "Mantar", "Dizi"] },
    { word: "UNCHARTED", banned: ["Hazine", "Nathan", "Macera", "Harita", "Hırsız"] },
    { word: "SPIDERMAN", banned: ["Örümcek", "Ağ", "Marvel", "New York", "Peter"] },
    { word: "BATMAN ARKHAM", banned: ["Joker", "Yarasa", "Gotham", "Bruce", "Oyun"] },
    { word: "TOMB RAIDER", banned: ["Lara", "Croft", "Mezar", "Macera", "Ok"] },
    { word: "METAL GEAR SOLID", banned: ["Snake", "Kutu", "Gizli", "Kojima", "Asker"] },
    { word: "ANGRY BIRDS", banned: ["Kuş", "Domuz", "Sapan", "Fırlatmak", "Yıkmak"] },
    { word: "CANDY CRUSH", banned: ["Şeker", "Patlatmak", "Telefon", "Renkli", "Saga"] },
    { word: "CLASH ROYALE", banned: ["Kart", "Kral", "Kule", "İksir", "Supercell"] },
    { word: "CLASH OF CLANS", banned: ["Köy", "Belediye", "Saldırı", "Klan", "Barbar"] },
    { word: "BRAWL STARS", banned: ["Savaş", "Kutu", "Karakter", "Yıldız", "Mobil"] },
    { word: "GÜLLE", banned: ["Fall Guys", "Jelibon", "Parkur", "Düşmek", "Yarış"] },
    { word: "IT TAKES TWO", banned: ["Çift", "İşbirliği", "Boşanma", "Bebek", "Macera"] },
    { word: "HOLLOW KNIGHT", banned: ["Böcek", "Ruh", "Çivi", "Karanlık", "Metroidvania"] },
    { word: "HADES", banned: ["Cehennem", "Oğlu", "Yunan", "Tanrı", "Kaçış"] },
    { word: "STARDEW VALLEY", banned: ["Çiftlik", "Ekim", "Madencilik", "Köy", "Balık"] },
    { word: "TERRARIA", banned: ["2D", "Minecraft", "Boss", "Kazmak", "Eşya"] },
    { word: "GENSHIN IMPACT", banned: ["Anime", "Gacha", "Element", "Karakter", "Açık Dünya"] },
    { word: "BIOSHOCK", banned: ["Denizaltı", "Rapture", "Big Daddy", "Little Sister", "Plazmid"] },
    { word: "MASS EFFECT", banned: ["Uzay", "Shepard", "Reaper", "Normandy", "Bioware"] },
    { word: "FINAL FANTASY", banned: ["RPG", "Japon", "Cloud", "Kılıç", "Büyü"] },
    { word: "WORLD OF WARCRAFT", banned: ["MMO", "Orc", "Alliance", "Horde", "Azeroth"] },
    { word: "DIABLO", banned: ["Şeytan", "Loot", "Zindan", "Cehennem", "Blizzard"] },
    { word: "HALF-LIFE", banned: ["Gordon", "Levye", "Bilim", "Headcrab", "Valve"] },
    { word: "LEFT 4 DEAD", banned: ["Zombi", "4 Kişi", "Kaçış", "Witch", "Tank"] },
    { word: "NEED FOR SPEED", banned: ["Araba", "Yarış", "Modifiye", "Hız", "Polis"] },
    { word: "GRAN TURISMO", banned: ["Araba", "Simülasyon", "Sony", "Yarış", "Pist"] },
    { word: "DEATH STRANDING", banned: ["Kargo", "Yürümek", "Bebek", "Kojima", "Kurye"] },
    { word: "SEKIRO", banned: ["Ninja", "Samuray", "Zor", "Kılıç", "Deflect"] },
    { word: "BLOODBORNE", banned: ["Avcı", "Kan", "Zor", "Gotik", "Canavar"] },

    // --- CHARACTERS ---
    { word: "KRATOS", banned: ["God of War", "Kel", "Dövme", "Sparta", "Baba"] },
    { word: "ATREUS", banned: ["Boy", "Oğul", "Ok", "Yay", "Loki"] },
    { word: "MASTER CHIEF", banned: ["Halo", "Yeşil", "Zırh", "Kask", "Asker"] },
    { word: "CORTANA", banned: ["Yapay Zeka", "Mavi", "Kadın", "Halo", "Hologram"] },
    { word: "GERALT", banned: ["Witcher", "Beyaz", "Saç", "Kılıç", "Yennefer"] },
    { word: "CIRI", banned: ["Witcher", "Kız", "Beyaz", "Işınlanmak", "Kılıç"] },
    { word: "YENNEFER", banned: ["Büyücü", "Siyah", "Witcher", "Geralt", "Mor"] },
    { word: "LARA CROFT", banned: ["Tomb Raider", "Kadın", "Arkeolog", "Tabanca", "Saç"] },
    { word: "NATHAN DRAKE", banned: ["Uncharted", "Hazine", "Avcı", "Erkek", "Tırmanmak"] },
    { word: "SNAKE", banned: ["Metal Gear", "Asker", "Bandana", "Sigara", "Kutu"] },
    { word: "SONIC", banned: ["Kirpi", "Mavi", "Hızlı", "Halka", "Sega"] },
    { word: "TAILS", banned: ["Tilki", "Sarı", "İki", "Kuyruk", "Uçmak"] },
    { word: "KNUCKLES", banned: ["Kırmızı", "Dikenli", "Güçlü", "Kirpi", "Yumruk"] },
    { word: "EGGMAN", banned: ["Dr", "Robotnik", "Kötü", "Bıyık", "Sonic"] },
    { word: "CRASH BANDICOOT", banned: ["Tilki", "Turuncu", "Kutu", "Elma", "Dönmek"] },
    { word: "SPYRO", banned: ["Ejderha", "Mor", "Ateş", "Uçmak", "Oyun"] },
    { word: "DONKEY KONG", banned: ["Maymun", "Goril", "Kravat", "Muz", "Nintendo"] },
    { word: "ARTHUR MORGAN", banned: ["Red Dead", "Kovboy", "RDR2", "Şapka", "Verem"] },
    { word: "DUTCH", banned: ["Plan", "Van der Linde", "Para", "Tahiti", "Lider"] },
    { word: "ELLIE", banned: ["Last of Us", "Kız", "Bağışık", "Dövme", "Joel"] },
    { word: "JOEL", banned: ["Last of Us", "Baba", "Sakal", "Gömlek", "Saat"] },
    { word: "ABBY", banned: ["Last of Us 2", "Kaslı", "Golf", "Kadın", "WLF"] },
    { word: "CLOUD STRIFE", banned: ["Final Fantasy", "Kılıç", "Saç", "Sarı", "Asker"] },
    { word: "SEPHIROTH", banned: ["Kötü", "Uzun", "Kılıç", "Saç", "Gümüş"] },
    { word: "TIFA", banned: ["Final Fantasy", "Dövüşçü", "Siyah", "Saç", "Bar"] },
    { word: "AERITH", banned: ["Çiçek", "Kız", "Ölmek", "Pembe", "Büyü"] },
    { word: "JIN KAZAMA", banned: ["Tekken", "Dövüş", "Şeytan", "Oğul", "Eldiven"] },
    { word: "HEIHACHI", banned: ["Tekken", "Dede", "Saç", "Bıyık", "Elektrik"] },
    { word: "RYU", banned: ["Street Fighter", "Hadouken", "Beyaz", "Kimonon", "Bandana"] },
    { word: "CHUN-LI", banned: ["Street Fighter", "Kadın", "Mavi", "Bacak", "Polis"] },
    { word: "SCORPION", banned: ["Mortal Kombat", "Sarı", "Ninja", "Zincir", "Ateş"] },
    { word: "SUB-ZERO", banned: ["Mortal Kombat", "Mavi", "Ninja", "Buz", "Dondurmak"] },
    { word: "RAIDIEN", banned: ["Mortal Kombat", "Tanrı", "Şapka", "Elektrik", "Beyaz"] },
    { word: "JETT", banned: ["Valorant", "Hızlı", "Rüzgar", "Bıçak", "Kore"] },
    { word: "SAGE", banned: ["Valorant", "Healer", "Can", "Duvar", "Diriltmek"] },
    { word: "PHOENIX", banned: ["Valorant", "Ateş", "Ceket", "Flash", "İngiliz"] },
    { word: "YASUO", banned: ["LoL", "Kılıç", "Rüzgar", "Kanser", "Hasagi"] },
    { word: "TEEMO", banned: ["LoL", "Mantar", "Sincap", "Kör", "Top"] },
    { word: "ZED", banned: ["LoL", "Gölge", "Ninja", "Suikastçı", "Maske"] },
    { word: "AHRI", banned: ["LoL", "Tilki", "Dokuz", "Kuyruk", "Kalp"] },
    { word: "LUX", banned: ["LoL", "Işık", "Lazer", "Sarı", "Gülüş"] },
    { word: "EZREAL", banned: ["LoL", "Sarı", "Eldiven", "Keşif", "Sarışın"] },
    { word: "GORDON FREEMAN", banned: ["Half-Life", "Gözlük", "Sakal", "Konuşmaz", "Bilim"] },
    { word: "ALYX VANCE", banned: ["Half-Life", "Kadın", "Robot", "Yardımcı", "Baba"] },
    { word: "G-MAN", banned: ["Half-Life", "Takım", "Elbise", "Çanta", "Gizemli"] },
    { word: "DOOM SLAYER", banned: ["Doom", "Yeşil", "Kask", "Tüfek", "Kas"] },
    { word: "COMMANDER SHEPARD", banned: ["Mass Effect", "Asker", "Uzay", "N7", "Gemi"] },
    { word: "GARRUS", banned: ["Mass Effect", "Uzaylı", "Keskin", "Nişancı", "Dost"] },
    { word: "LIARA", banned: ["Mass Effect", "Mavi", "Uzaylı", "Bilim", "Asari"] },
    { word: "EZIO AUDITORE", banned: ["Assassin", "İtalyan", "Beyaz", "Kukuleta", "Suikastçı"] },
    { word: "ALTAIR", banned: ["Assassin", "İlk", "Beyaz", "Kukuleta", "Geçmiş"] },
    { word: "TRACER", banned: ["Overwatch", "Hızlı", "Işınlanmak", "Sarı", "Gözlük"] },
    { word: "GENJI", banned: ["Overwatch", "Ninja", "Kılıç", "Robot", "Yeşil"] },
    { word: "D.VA", banned: ["Overwatch", "Robot", "Kız", "Pembe", "Gamer"] },
    { word: "MERCY", banned: ["Overwatch", "Melek", "Kanat", "Can", "Sarı"] },
    { word: "HEAVY", banned: ["TF2", "Şişman", "Silah", "Sandviç", "Rus"] },
    { word: "SCOUT", banned: ["TF2", "Hızlı", "Sopa", "Şapka", "Genç"] },
    { word: "STEVE", banned: ["Minecraft", "Karakter", "Mavi", "Kazma", "Kare"] },
    { word: "ALEX", banned: ["Minecraft", "Kız", "Yeşil", "Turuncu", "Saç"] },
    { word: "HEROBRINE", banned: ["Minecraft", "Beyaz", "Göz", "Korku", "Efsane"] },
    { word: "SANS", banned: ["Undertale", "İskelet", "Mavi", "Şaka", "Kemik"] },
    { word: "PAPYRUS", banned: ["Undertale", "İskelet", "Uzun", "Spaghetti", "Kardeş"] },
    { word: "CUPHEAD", banned: ["Fincan", "Kafa", "Kırmızı", "Şeytan", "Zor"] },
    { word: "MUGMAN", banned: ["Fincan", "Mavi", "Kardeş", "Burun", "Oyun"] },
    { word: "SAMUS ARAN", banned: ["Metroid", "Kadın", "Zırh", "Uzay", "Silah"] },
    { word: "KIRBY", banned: ["Pembe", "Top", "Yutmak", "Uçmak", "Yıldız"] },
    { word: "MEGA MAN", banned: ["Robot", "Mavi", "Silah", "Kask", "Capcom"] },
    { word: "DANTE", banned: ["Devil May Cry", "Şeytan", "Avcı", "Kırmızı", "Beyaz"] },
    { word: "VERGIL", banned: ["Devil May Cry", "Mavi", "Kılıç", "Kardeş", "Güç"] },
    { word: "BAYONETTA", banned: ["Cadı", "Gözlük", "Silah", "Saç", "Topuklu"] },
    { word: "2B", banned: ["Nier", "Robot", "Gözbağı", "Beyaz", "Kılıç"] },
    { word: "SORA", banned: ["Kingdom Hearts", "Anahtar", "Disney", "Çocuk", "Saç"] },
    { word: "RIKUU", banned: ["Kingdom Hearts", "Arkadaş", "Gümüş", "Saç", "Karanlık"] },
    { word: "KAIRI", banned: ["Kingdom Hearts", "Kız", "Prenses", "Kızıl", "Saç"] },
    { word: "ALUCARD", banned: ["Castlevania", "Vampir", "Dracula", "Oğlu", "Sarı"] },
    { word: "TREVOR BELMONT", banned: ["Castlevania", "Kamçı", "Avcı", "Sarhoş", "Pelerin"] }
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