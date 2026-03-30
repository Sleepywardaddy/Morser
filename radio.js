//sound
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let activeTone = null;
//modechange
let pendingMode = null; // Tracks which mode the user clicked
let audioInterrupt = false;

// --- CONFIG & STATE ---
const MORSE_MAP = { 'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..', };
const wordBank = [
    // --- YOUR ORIGINAL WORDS ---
    "THE", "AND", "FOR", "WITH", "BUT", "THAT", "FROM", "THIS", "WILL", "YOUR", "NOT", "ARE", "WHICH", "THEY", "HAVE", "SOME", "WHAT", "THERE", "ABOUT", "WHO", "WHEN", "MAKE", "LIKE", "TIME", "JUST", "KNOW", "TAKE", "PERSON", "INTO", "YEAR", "GOOD", "COULD", "THEM", "THAN", "THEN", "NOW", "LOOK", "ONLY", "COME", "ITS", "OVER", "ALSO", "BACK", "AFTER", "USE", "TWO", "HOW", "OUR", "WORK", "RADIO", "SIGNAL", "CODE", "MORSE", "WAVE", "SHIP", "TOWER", "SOUND", "HELLO", "WORLD", "TEST", "CABLE", "WIRE", "VOICE", "DATA", "UNIT", "SPEED", "FAST", "LONG", "SHORT", "DOTS", "DASH", "SPACE", "KEY", "TELLER", "SEND", "LINK", "BASE", "PEOPLE", "HISTORY", "WAY", "ART", "INFORMATION", "MAP", "FAMILY", "GOVERNMENT", "HEALTH", "SYSTEM", "COMPUTER", "MEAT", "THANKS", "MUSIC", "READING", "METHOD", "FOOD", "UNDER", "SIDE", "NIGHT", "HOME", "LIFE", "POWER", "ABILITY", "BASIC", "COURSE", "MEMBER", "FAT", "EGG", "BIRD", "STORY", "FACT", "IDEA", "WAR", "AREA", "SOCIETY", "ORDER", "GAME", "MOVIE", "STAR", "BOOK", "GOAL", "NEWS", "OFFICE", "USER", "VIDEO", "PARTY", "FORCE", "PLANT", "BLOOD", "WINDOW", "STORE", "DOG", "CAT", "CITY", "EARTH", "PAPER", "COUPLE", "GROUP", "PROBLEM", "FORM", "SCENE", "PHONE", "POINT", "CHILD", "TEAM", "TRUCK", "SMILE", "NATURE", "CHANCE", "SIGHT", "MOMENT", "STREET", "FLIGHT", "DREAM", "CHOICE", "GIRL", "BOY", "STUFF", "FRIEND", "SCHOOL", "DRINK", "FRUIT", "LUNCH", "BREAD", "GREEN", "BLUE", "RED", "WHITE", "BLACK", "SMALL", "LARGE", "STRONG", "HAPPY", "CLEAN", "YOUNG", "FREE", "OLD", "READY", "EASY", "BUSY", "QUIET", "SLOW", "LOUD", "RICH", "POOR", "HARD", "SOFT", "NEAR", "FAR", "HIGH", "LOW", "RIGHT", "LEFT", "TRUE", "FALSE", "DANGEROUS", "SAFE", "THROUGH", "BETWEEN", "WITHOUT", "AGAINST", "DURING", "BEFORE", "WITHIN", "TOWARDS",

    // --- EXPANSION 1: ACTION & MOVEMENT ---
    "WALK", "RUN", "JUMP", "STOP", "HOLD", "GIVE", "FIND", "KEEP", "SHOW", "FEEL", "CALL", "TRY", "ASK", "NEED", "FEEL", "MOVE", "PLAY", "LIVE", "BELIEVE", "BRING", "HAPPEN", "WRITE", "SIT", "STAND", "LOSE", "PAY", "MEET", "INCLUDE", "SET", "LEARN", "CHANGE", "LEAD", "UNDERSTAND", "WATCH", "FOLLOW", "CREATE", "SPEAK", "READ", "ALLOW", "SPEND", "GROW", "OPEN", "WALK", "WIN", "OFFER", "REMEMBER", "LOVE", "CONSIDER", "APPEAR", "BUY", "WAIT", "SERVE", "DIE", "SEND", "BUILD", "STAY", "FALL", "CUT", "REACH", "KILL", "REMAIN",

    // --- EXPANSION 2: OBJECTS & PLACES ---
    "HOUSE", "DOOR", "FLOOR", "DESK", "CHAIR", "TABLE", "LIGHT", "WATCH", "CLOCK", "MONEY", "COIN", "CARD", "BAG", "BOX", "KEY", "PEN", "TOOL", "ROAD", "PARK", "BRIDGE", "RIVER", "MOUNTAIN", "OCEAN", "SEA", "BEACH", "ISLAND", "FOREST", "WOOD", "TREE", "FLOWER", "SUN", "MOON", "RAIN", "SNOW", "WIND", "STORM", "FIRE", "ICE", "GOLD", "IRON", "STEEL", "STONE", "GLASS", "CLOTH", "SHIRT", "SHOES", "HAT", "FOOD", "WATER", "COFFEE", "TEA", "MILK", "SUGAR", "MEAL", "SOUP", "CAKE", "PLATE", "FORK", "KNIFE", "SPOON",

    // --- EXPANSION 3: ABSTRACT & ACADEMIC ---
    "THOUGHT", "MIND", "SOUL", "SPIRIT", "SPACE", "TIME", "FUTURE", "PAST", "PRESENT", "CAUSE", "EFFECT", "REASON", "LOGIC", "SENSE", "VALUE", "PRICE", "COST", "TAX", "MARKET", "BANK", "TRADE", "DEBT", "CRIME", "LAW", "COURT", "JUDGE", "POLICE", "ARMY", "PEACE", "TRUTH", "TRUST", "HONOR", "GLORY", "POWER", "CHURCH", "PRAYER", "GIFT", "ART", "DANCE", "SONG", "VOICE", "SOUND", "NOISE", "SILENCE", "SPACE", "PLANET", "UNIVERSE", "ENERGY", "HEAT", "COLD", "SHADOW", "LIGHT", "COLOR", "SHAPE", "CIRCLE", "SQUARE", "LINE",

    // --- EXPANSION 4: TECHNOLOGY & MODERN LIFE ---
    "DEVICE", "SCREEN", "BATTERY", "CHARGER", "SIGNAL", "NET", "WEB", "SITE", "LINK", "FILE", "FOLDER", "IMAGE", "PHOTO", "AUDIO", "VIDEO", "STREAM", "CHAT", "MAIL", "POST", "BLOG", "APP", "CODE", "BOT", "CHIP", "DISK", "DRIVE", "HOST", "CLOUD", "TECH", "DIGITAL", "ONLINE", "LOCAL", "GLOBAL", "SOCIAL", "MEDIA", "SEARCH", "ENGINE", "TOOL", "GEAR", "MACHINE", "ENGINE", "MOTOR", "RADIO", "ANTENNA", "STATION", "BEAM", "FIELD", "SENSORS", "ROBOT", "SPACE", "ROCKET", "PLANE", "DRONE", "PILOT", "RADAR",

    // --- EXPANSION 5: HUMAN QUALITIES & STATES ---
    "BRAVE", "SMART", "WISE", "KIND", "PROUD", "ANGRY", "SAD", "AFRAID", "BRAVE", "CALM", "COLD", "HOT", "DARK", "BRIGHT", "SHARP", "BLUNT", "HEAVY", "LIGHT", "SWEET", "SOUR", "BITTER", "FRESH", "ROTTEN", "SICK", "WELL", "ALIVE", "DEAD", "BEAUTIFUL", "UGLY", "DEEP", "SHALLOW", "WIDE", "NARROW", "THICK", "THIN", "SMOOTH", "ROUGH", "WET", "DRY", "DIRTY", "EXPENSIVE", "CHEAP", "FAMOUS", "STRANGE", "NORMAL", "PERFECT", "WRONG", "ANCIENT", "MODERN", "PRIVATE", "PUBLIC", "SECRET", "COMMON", "SPECIAL", "SIMPLE", "COMPLEX", "SINGLE", "DOUBLE", "TOTAL", "WHOLE"
];



// --- DUAL STREAK STORAGE ---
let mode = "letters"; 
let stats = JSON.parse(localStorage.getItem('radioStats')) || {
    letters: { current: 0, best: 0 },
    words: { current: 0, best: 0 }
};

let currentTarget = "";
let isPlaying = false, hasStarted = false;

// --- 1. CORE ENGINE ---
function updateStatus(state, customText = "") {
    const statusText = document.getElementById('signal-status');
    const wave = document.getElementById('waveform');
    if (!statusText || !wave) return;

    switch(state) {
        case 'IDLE':
            statusText.textContent = "READY - TYPE";
            statusText.style.color = "#22c55e"; 
            wave.classList.remove('playing');
            break;
        case 'BUFFERING':
            statusText.textContent = customText || "WAIT... PREPARING NEXT";
            statusText.style.color = "#fbbf24";
            wave.classList.remove('playing');
            break;
        case 'PLAYING':
            statusText.textContent = customText || "INCOMING SIGNAL...";
            statusText.style.color = "#ef4444";
            wave.classList.add('playing');
            break;
        case 'REPLAY':
            statusText.textContent = "REPLAYING SIGNAL...";
            statusText.style.color = "#38bdf8";
            wave.classList.add('playing');
            break;
    }
}

// --- 2. GAMEFLOW & MODE SWITCHING ---
function startRadioTest() {
    hasStarted = true;
    const unlock = (a) => { a.play().then(()=> {a.pause(); a.currentTime=0;}).catch(()=>{}); };
    unlock(dotAudio); unlock(dashAudio);
    
    document.getElementById('start-btn').style.display = 'none';
    updateStreakDisplay(); // Show saved best streaks on start
    resetQuestion();
}

// Logic for the "SWITCH MODE" button inside the modal
document.getElementById('confirm-mode-btn').addEventListener('click', () => {
    // 1. Actually update the mode now
    mode = pendingMode;
    
    // 2. Hide the modal
    document.getElementById('mode-modal').classList.add('hidden');

    // 3. Update the UI Button active states
    document.getElementById('btn-letters').classList.toggle('active', mode === 'letters');
    document.getElementById('btn-words').classList.toggle('active', mode === 'words');

    // 4. Update the layout (Grid vs Input)
    const wordInput = document.getElementById('word-input-container');
    const letterGrid = document.getElementById('letter-grid');

    if (mode === 'letters') {
        wordInput.classList.add('hidden');
        letterGrid.classList.remove('hidden');
    } else {
        wordInput.classList.remove('hidden');
        letterGrid.classList.add('hidden');
        // Small delay to focus the input box
        setTimeout(() => document.getElementById('guess-input').focus(), 100);
    }

    // 5. Update streaks and start a new question
    updateStreakDisplay();
    if (hasStarted) {
        updateStatus('BUFFERING', `SWITCHING TO ${mode.toUpperCase()}...`);
        setTimeout(resetQuestion, 1200);
    }
});

// Logic for the "CANCEL" button
function closeModeModal() {
    document.getElementById('mode-modal').classList.add('hidden');
    updateStatus('IDLE');
}

function updateStreakDisplay() {
    document.getElementById('streak-count').textContent = stats[mode].current;
    document.getElementById('best-streak').textContent = stats[mode].best;
}

function saveStats() {
    localStorage.setItem('radioStats', JSON.stringify(stats));
}

// --- 3. THE GENERATOR ---
function resetQuestion() {
    if (!hasStarted) return;
    audioInterrupt = false;
    
    const pool = (mode === 'letters') ? Object.keys(MORSE_MAP) : wordBank;
    currentTarget = pool[Math.floor(Math.random() * pool.length)];
    
    updateStatus('BUFFERING', "NEW SIGNAL READY...");
    setTimeout(() => playSignalLogic(false), 800);
}

// --- 4. THE AUDIO MASTER ---
async function playSignalLogic(isReplay = false) {
    if (isPlaying) return;
    isPlaying = true;
    audioInterrupt = false; 

    updateStatus(isReplay ? 'REPLAY' : 'PLAYING');
    const morseString = currentTarget.split('').map(c => MORSE_MAP[c]).join(' ');

    for (let char of morseString) {
        // --- THE KILL SWITCH CHECK ---
        if (audioInterrupt) {
            isPlaying = false;
            return; // Exit the function entirely right now
        }

        if (char === '.' || char === '-') {
            const tone = playTone();
            const duration = (char === '.') ? 100 : 300;
            await new Promise(r => setTimeout(r, duration));
            tone.stop();
            await new Promise(r => setTimeout(r, 100));
        } else if (char === ' ') {
            await new Promise(r => setTimeout(r, 400));
        }
    }

    isPlaying = false;
    updateStatus('IDLE');
}

// --- 5. INPUT & STREAK LOGIC ---
function checkAnswer(input) {
    const userGuess = input.toUpperCase().trim();
    
    if (userGuess === currentTarget) {
        stats[mode].current++;
        if(stats[mode].current > stats[mode].best) {
            stats[mode].best = stats[mode].current;
        }
        
        updateStatus('BUFFERING', "SIGNAL RECEIVED! ✅");
        setTimeout(resetQuestion, 1000);
    } else {
        stats[mode].current = 0;
        updateStatus('BUFFERING', `SIGNAL LOST! (WAS ${currentTarget})`);
        setTimeout(resetQuestion, 2000);
    }

    updateStreakDisplay();
    saveStats();
}

// Load name profile logic stays same...

//lettergrid
// --- 1. INITIALIZE THE GRID ---
function createLetterGrid() {
    const grid = document.getElementById('letter-grid');
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
    
    grid.innerHTML = alphabet.map(char => 
        `<button class="letter-tile" onclick="checkAnswer('${char}')">${char}</button>`
    ).join("");
}

// --- 2. UPDATED MODE SWITCHER ---

// --- TRIGGERED BY "SWITCH MODE" (The Confirm Button) ---
document.getElementById('confirm-mode-btn').addEventListener('click', () => {
    if (!pendingMode) return;

    // 1. KILL RECENT SOUND IMMEDIATELY
    audioInterrupt = true; 
    isPlaying = false;
    
    // Stop the actual oscillator if it's mid-beep
    if (activeTone) {
        activeTone.stop();
        activeTone = null;
    }

    // 2. APPLY THE CHANGE
    mode = pendingMode;
    document.getElementById('mode-modal').classList.add('hidden');

    // 3. UI SYNC
    document.getElementById('btn-letters').classList.toggle('active', mode === 'letters');
    document.getElementById('btn-words').classList.toggle('active', mode === 'words');

    const wordInput = document.getElementById('word-input-container');
    const letterGrid = document.getElementById('letter-grid');

    if (mode === 'letters') {
        wordInput.classList.add('hidden');
        letterGrid.classList.remove('hidden');
    } else {
        wordInput.classList.remove('hidden');
        letterGrid.classList.add('hidden');
        setTimeout(() => document.getElementById('guess-input').focus(), 100);
    }

    // 4. RESET GAMEFLOW
    updateStreakDisplay();
    if (hasStarted) {
        updateStatus('BUFFERING', `REBOOTING TO ${mode.toUpperCase()}...`);
        currentTarget = ""; // Clear current target so old mode logic doesn't linger
        setTimeout(resetQuestion, 1000);
    }

    pendingMode = null;
});

// --- TRIGGERED BY CANCEL ---
function closeModeModal() {
    document.getElementById('mode-modal').classList.add('hidden');
    pendingMode = null;
}

// --- 3. THE INSTANT KEY LISTENER ---
window.addEventListener('keydown', (e) => {
    if (document.activeElement === chatInput) {
        if (e.key === "Escape") chatInput.blur();
        return;
    }
    if (e.code === "Space") { e.preventDefault(); startTap(); }
    if (e.code === "Enter") sendTransmission();
    if (e.key === "Backspace") {
        e.preventDefault();
        currentBuffer = currentBuffer.slice(0, -1);
        updateBuffer();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === "Space") endTap();
});

// Run this when the page loads
// --- 1. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Sync the local 'mode' variable with what is in the stats first
    // This ensures 'mode' isn't just defaulting to "letters" if you were on "words"
    const savedStats = JSON.parse(localStorage.getItem('radioStats'));
    
    // We need a way to remember which mode was active last. 
    // Let's check which button was active or add a 'lastMode' key to stats.
    // For now, let's ensure the UI reflects the current 'mode' variable:
    
    createLetterGrid();
    updateStreakDisplay();
    
    // Force UI to match the mode variable immediately
    const wordInput = document.getElementById('word-input-container');
    const letterGrid = document.getElementById('letter-grid');
    const btnLetters = document.getElementById('btn-letters');
    const btnWords = document.getElementById('btn-words');

    if (mode === 'letters') {
        wordInput.classList.add('hidden');
        letterGrid.classList.remove('hidden');
        btnLetters.classList.add('active');
        btnWords.classList.remove('active');
    } else {
        wordInput.classList.remove('hidden');
        letterGrid.classList.add('hidden');
        btnWords.classList.add('active');
        btnLetters.classList.remove('active');
    }
});

//startbutton
function startRadioTest() {
    // 1. Audio Unlock (Synth version)
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // 2. UI Transition
    const overlay = document.getElementById('start-overlay');
    const interface = document.getElementById('radio-interface');
    if (overlay) overlay.classList.add('hidden');
    if (interface) interface.classList.remove('hidden');

    // 3. System Boot
    hasStarted = true;
    updateStatus('BUFFERING', "SYSTEM ONLINE...");
    
    if (mode === 'words') {
        setTimeout(() => {
            document.getElementById('guess-input').focus();
        }, 1000);
    }

    setTimeout(resetQuestion, 1500);
}

//modechange
// Ensure these variables are at the TOP of your radio.js
 

// --- THE TRIGGER (Clicking the top buttons) ---
// --- THE TRIGGER (Clicking the top buttons) ---
function changeMode(m) {
    if (mode === m) return; 
    
    // Stage the mode and show the window
    pendingMode = m;
    const modal = document.getElementById('mode-modal');
    if (modal) modal.classList.remove('hidden');
}

// --- THE CONFIRMATION (The only one you need) ---
document.getElementById('confirm-mode-btn').addEventListener('click', () => {
    if (!pendingMode) return;

    // 1. KILL RECENT SOUND IMMEDIATELY
    audioInterrupt = true; 
    isPlaying = false;
    
    // Stop the actual oscillator if it's mid-beep
    if (activeTone) {
        try { activeTone.stop(); } catch(e) {}
        activeTone = null;
    }

    // 2. APPLY THE CHANGE
    mode = pendingMode;
    document.getElementById('mode-modal').classList.add('hidden');

    // 3. UI SYNC & ACTIVE CLASS FIX
    // Remove active from all buttons first
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    // Add active to the correct one
    const activeBtn = document.getElementById(`btn-${mode}`);
    if (activeBtn) activeBtn.classList.add('active');

    const wordInput = document.getElementById('word-input-container');
    const letterGrid = document.getElementById('letter-grid');

    if (mode === 'letters') {
        wordInput.classList.add('hidden');
        letterGrid.classList.remove('hidden');
    } else {
        wordInput.classList.remove('hidden');
        letterGrid.classList.add('hidden');
        setTimeout(() => {
            const input = document.getElementById('guess-input');
            if (input) input.focus();
        }, 100);
    }

    // 4. RESET GAMEFLOW
    updateStreakDisplay();
    if (hasStarted) {
        updateStatus('BUFFERING', `REBOOTING TO ${mode.toUpperCase()}...`);
        currentTarget = ""; 
        setTimeout(resetQuestion, 1200);
    }

    pendingMode = null;
});

// --- THE CONFIRMATION (Clicking SWITCH MODE) ---
document.getElementById('confirm-mode-btn').addEventListener('click', () => {
    if (!pendingMode) return;

    // 1. Force Silence
    audioInterrupt = true;
    isPlaying = false;
    if (activeTone) { activeTone.stop(); activeTone = null; }

    // 2. Change the actual mode variable
    mode = pendingMode;

    // 3. Hide the window
    document.getElementById('mode-modal').classList.add('hidden');

    // 4. Swap the UI Layout
    const wordInput = document.getElementById('word-input-container');
    const letterGrid = document.getElementById('letter-grid');
    
    if (mode === 'letters') {
        wordInput.classList.add('hidden');
        letterGrid.classList.remove('hidden');
    } else {
        wordInput.classList.remove('hidden');
        letterGrid.classList.add('hidden');
        setTimeout(() => document.getElementById('guess-input').focus(), 100);
    }

    // 5. Update Buttons and Restart
    document.getElementById('btn-letters').classList.toggle('active', mode === 'letters');
    document.getElementById('btn-words').classList.toggle('active', mode === 'words');
    
    updateStreakDisplay();
    if (hasStarted) {
        updateStatus('BUFFERING', `REBOOTING TO ${mode.toUpperCase()}...`);
        currentTarget = ""; // Clear old signal
        setTimeout(resetQuestion, 1000);
    }

    pendingMode = null; // Reset for next time
});

// --- THE CANCEL BUTTON ---
function closeModeModal() {
    document.getElementById('mode-modal').classList.add('hidden');
    pendingMode = null;
    updateStatus('IDLE');
}
// This runs if they click "SWITCH MODE"
document.getElementById('confirm-mode-btn').addEventListener('click', () => {
    mode = pendingMode;
    
    // Update UI Button Classes
    document.getElementById('btn-letters').classList.toggle('active', mode === 'letters');
    document.getElementById('btn-words').classList.toggle('active', mode === 'words');

    // Update the layout (Grid vs Input Box)
    const wordInput = document.getElementById('word-input-container');
    const letterGrid = document.getElementById('letter-grid');

    if (mode === 'letters') {
        wordInput.classList.add('hidden');
        letterGrid.classList.remove('hidden');
    } else {
        wordInput.classList.remove('hidden');
        letterGrid.classList.add('hidden');
        setTimeout(() => document.getElementById('guess-input').focus(), 100);
    }

    // Reset stats for the new mode and close
    closeModeModal();
    updateStreakDisplay();
    resetQuestion();
});

function closeModeModal() {
    document.getElementById('mode-modal').classList.add('hidden');
    // If they canceled, we might want to resume the signal, 
    // but usually, it's cleaner to let them manually 'Replay'
    updateStatus('IDLE');
}

// Call this on page load to set the default 'active' button
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById(`btn-${mode}`).classList.add('active');
});

//user
// --- GLOBAL USER SYNC ---
function syncGlobalUser() {
    const nameDisplay = document.getElementById('user-display-name');
    const navName = document.getElementById('nav-username'); // In case you use this ID in the navbar
    
    // Pull the name from storage
    const savedName = localStorage.getItem('globalUsername');

    if (savedName) {
        // Update any element that shows the name
        if (nameDisplay) nameDisplay.textContent = savedName;
        if (navName) navName.textContent = savedName;
    } else {
        // If it's their first time, force the modal open
        const modal = document.getElementById('name-modal');
        if (modal) {
            modal.classList.add('active');
            const nameInput = document.getElementById('name-input');
            if (nameInput) nameInput.focus();
        }
    }
}

// Run immediately on every page load
document.addEventListener('DOMContentLoaded', syncGlobalUser);

// Listen for changes made in other tabs/pages
window.addEventListener('storage', (e) => {
    if (e.key === 'globalUsername') {
        syncGlobalUser(); 
    }
});

function saveGlobalUsername() {
    const nameInput = document.getElementById('name-input');
    const nameDisplay = document.getElementById('user-display-name');
    const modal = document.getElementById('name-modal');
    
    const newName = nameInput.value.trim().toUpperCase();

    if (newName && newName.length >= 2) {
        // 1. Save to LocalStorage
        localStorage.setItem('globalUsername', newName);
        
        // 2. Update UI
        if (nameDisplay) nameDisplay.textContent = newName;
        
        // 3. Close Modal
        if (modal) modal.classList.remove('active');
        
        console.log("Global Callsign Synced:", newName);
    } else {
        alert("Enter at least 2 characters.");
    }
}

//thebettersound
// --- AUDIO ENGINE ---


// --- THE BETTER SOUND (Fixed for Kill Switch) ---
function playTone() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain); 
    gain.connect(audioCtx.destination);
    
    osc.frequency.value = 600; 
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    
    // SAVE TO GLOBAL VARIABLE SO KILL SWITCH CAN STOP IT
    activeTone = osc; 
    
    return { 
        stop: () => {
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
            setTimeout(() => {
                try { osc.stop(); } catch(e) {}
                activeTone = null; // Clear it once stopped
            }, 100);
        }
    };
}

//killswitch of audio
// This connects to your "SWITCH MODE" button in the HTML above
document.getElementById('confirm-mode-btn').addEventListener('click', () => {
    if (!pendingMode) return;

    // 1. INSTANT SILENCE
    audioInterrupt = true; // Signals the playSignalLogic loop to stop
    isPlaying = false;
    
    // Stop the actual oscillator if it's currently making noise
    if (activeTone) {
        activeTone.stop();
        activeTone = null;
    }

    // 2. APPLY THE MODE CHANGE
    mode = pendingMode;
    document.getElementById('mode-modal').classList.add('hidden');

    // 3. UI LAYOUT SWAP
    const wordInput = document.getElementById('word-input-container');
    const letterGrid = document.getElementById('letter-grid');
    
    if (mode === 'letters') {
        wordInput.classList.add('hidden');
        letterGrid.classList.remove('hidden');
    } else {
        wordInput.classList.remove('hidden');
        letterGrid.classList.add('hidden');
        setTimeout(() => document.getElementById('guess-input').focus(), 100);
    }

    // 4. RESET SYSTEM
    updateStreakDisplay();
    if (hasStarted) {
        updateStatus('BUFFERING', `REBOOTING TO ${mode.toUpperCase()}...`);
        currentTarget = ""; // Clear the word so it doesn't check the old one
        setTimeout(resetQuestion, 1200);
    }

    pendingMode = null;
});