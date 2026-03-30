// User Profile Logic
let currentUsername = localStorage.getItem('morse_username') || "";
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let activeTone = null;

function initUser() {
    if (!currentUsername) {
        openUsernameModal();
    } else {
        updateUserUI();
    }
}

function openUsernameModal() {
    document.getElementById('username-overlay').classList.remove('hidden');
    document.getElementById('username-input').focus();
}

function saveUsername() {
    const input = document.getElementById('username-input').value.trim();
    if (input.length < 2) {
        alert("Enter at least 2 characters.");
        return;
    }
    currentUsername = input;
    localStorage.setItem('morse_username', currentUsername);
    updateUserUI();
    document.getElementById('username-overlay').classList.add('hidden');
}

function updateUserUI() {
    const navUser = document.getElementById('nav-username');
    if (navUser) navUser.textContent = currentUsername;
}

// Stats Preview Logic (Placeholder)
function updateLeaderboardPreview() {
    const preview = document.getElementById('leaderboard-preview');
    if (!preview) return;

    // Grabbing the top score from local storage if it exists
    const typingScores = JSON.parse(localStorage.getItem('morse_leaderboard_typing') || "[]");
    if (typingScores.length > 0) {
        preview.innerHTML = `<strong>${typingScores[0].wpm} WPM</strong> by You`;
    } else {
        preview.textContent = "No scores yet!";
    }
}

// Start everything when the page loads
window.addEventListener('DOMContentLoaded', () => {
    initUser();
    updateLeaderboardPreview();
});

//practice page logic
const morseAlphabet = { 'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..' };
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

let subMode = 'alpha';
let targetValue = "";
let userMorseInput = "";
let pressStartTime = 0;
let inputTimer;
let showHint = true;

// UI Control
let isPracticeActive = false; // The Gatekeeper

function openPractice() {
    const sheet = document.getElementById('practice-sheet');
    if (sheet) {
        isPracticeActive = true;
        sheet.classList.remove('hidden');

        // Resume AudioContext for modern browsers
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // Corrected function name here
        resetLevel();
    }
}

function closePractice() {
    isPracticeActive = false;
    const sheet = document.getElementById('practice-sheet');
    if (sheet) sheet.classList.add('hidden');

    // Kill any ringing tones immediately
    if (activeTone) {
        activeTone.stop();
        activeTone = null;
    }
}

function setSubMode(m) {
    subMode = m;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`sub-${m}`).classList.add('active');
    resetLevel();
}

// Core Logic
function resetLevel() {
    if (subMode === 'alpha') {
        const keys = Object.keys(morseAlphabet);
        targetValue = keys[Math.floor(Math.random() * keys.length)];
    } else {
        targetValue = wordBank[Math.floor(Math.random() * wordBank.length)];
    }

    document.getElementById('target-display').textContent = targetValue;
    updateHint();
    userMorseInput = "";
    document.getElementById('input-preview').textContent = "";
}

function updateHint() {
    const hintEl = document.getElementById('hint-display');
    if (!showHint) {
        hintEl.textContent = "";
        return;
    }
    if (subMode === 'alpha') {
        hintEl.textContent = morseAlphabet[targetValue];
    } else {
        hintEl.textContent = targetValue.split('').map(l => morseAlphabet[l]).join(' ');
    }
}

function handleInputStart() {
    pressStartTime = Date.now();
    clearTimeout(inputTimer);
}

function handleInputEnd() {
    const duration = Date.now() - pressStartTime;
    userMorseInput += (duration < 220) ? "." : "-";
    document.getElementById('input-preview').textContent = userMorseInput;
    inputTimer = setTimeout(validateResult, 800);
}

// Event Listeners for the Sheet
const tapZone = document.getElementById('tap-zone');
tapZone.onmousedown = (e) => { e.preventDefault(); handleInputStart(); };
tapZone.onmouseup = handleInputEnd;

// Example for the Spacebar/Keyboard
let isKeyDown = false; // Add this flag at the top of your script

window.addEventListener('keydown', (e) => {
    // 1. Gatekeeper checks
    if (!isPracticeActive) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code !== "Space" || isKeyDown) return;

    e.preventDefault();
    isKeyDown = true;

    // 2. Start Sound
    if (audioCtx.state === 'suspended') audioCtx.resume();
    activeTone = playTone();

    // 3. Start Morse Logic
    handleInputStart();
});

window.addEventListener('keyup', (e) => {
    if (e.code === "Space") {
        isKeyDown = false;
        stopAllSound(); // Use the helper here too

        if (isPracticeActive) {
            handleInputEnd();
        }
    }
});

// Example for the Tap Zone (Mouse/Touch)
const tapZonePractice = document.getElementById('tap-zone');
if (tapZonePractice) {
    tapZonePractice.addEventListener('mousedown', (e) => {
        if (!isPracticeActive) return;
        e.preventDefault();
        activeTone = playTone();
        handleInputStart();
    });

    tapZonePractice.addEventListener('mouseup', () => {
        if (activeTone && typeof activeTone.stop === 'function') {
            activeTone.stop();
            activeTone = null;
        }
        if (isPracticeActive) handleInputEnd();
    });
}

// 1. Added Numbers to the Dictionary
const morseNumbers = { '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----' };

function initPracticeLogic() {
    const miniGrid = document.getElementById('practice-cheat-grid');
    if (!miniGrid) return;

    // Combine both for the reference list
    const combined = { ...morseAlphabet, ...morseNumbers };
    miniGrid.innerHTML = Object.entries(combined).map(([char, code]) => `
        <div class="mini-item">
            <span>${char}</span>
            <span>${code}</span>
        </div>
    `).join('');
}

// 2. Updated resetLevel to handle 'numbers' mode
function resetLevel() {
    if (subMode === 'alpha') {
        const keys = Object.keys(morseAlphabet);
        targetValue = keys[Math.floor(Math.random() * keys.length)];
    } else if (subMode === 'numbers') {
        const keys = Object.keys(morseNumbers);
        targetValue = keys[Math.floor(Math.random() * keys.length)];
    } else {
        targetValue = wordBank[Math.floor(Math.random() * wordBank.length)];
    }

    document.getElementById('target-display').textContent = targetValue;
    updateHint();
    userMorseInput = "";
    document.getElementById('input-preview').textContent = "";
}

// 3. Updated validateResult for numbers
function validateResult() {
    // 1. Immediately kill any hanging sound
    // Only stop sound if the user isn't currently pressing the key
    if (!isKeyDown) {
        stopAllSound();
    }

    const fullDict = { ...morseAlphabet, ...morseNumbers };
    // ... rest of your logic    const fullDict = { ...morseAlphabet, ...morseNumbers };
    let expected = (subMode === 'words') ?
        targetValue.split('').map(l => fullDict[l]).join('') :
        fullDict[targetValue];

    const preview = document.getElementById('input-preview');
    if (userMorseInput === expected) {
        preview.style.color = "#22c55e";
        setTimeout(resetLevel, 200);
    } else {
        preview.textContent = "❌";
        preview.style.color = "#ef4444";
        setTimeout(() => {
            userMorseInput = "";
            preview.textContent = "";
            preview.style.color = "#3b82f6";
        }, 600);
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initPracticeLogic();
    // ... your other init functions
});


function toggleHint() {
    showHint = !showHint;
    const btn = document.getElementById('btn-hint-toggle');

    if (showHint) {
        btn.textContent = "💡 Hint: ON";
        btn.style.background = "#fffbeb"; // Light amber
    } else {
        btn.textContent = "💡 Hint: OFF";
        btn.style.background = "#f1f5f9";
    }
    updateHint(); // Refresh display immediately
}

function updateHint() {
    const hintEl = document.getElementById('hint-display');
    if (!showHint) {
        hintEl.textContent = "";
        return;
    }

    const fullDict = { ...morseAlphabet, ...morseNumbers };

    if (subMode === 'words') {
        hintEl.textContent = targetValue.split('').map(l => fullDict[l] || "").join('  ');
    } else {
        // Works for both 'alpha' and 'numbers' modes
        hintEl.textContent = fullDict[targetValue] || "";
    }
}

function initPracticeLogic() {
    // Populate Numbers column
    const numGrid = document.getElementById('num-ref-grid');
    numGrid.innerHTML = Object.entries(morseNumbers).map(([char, code]) => `
        <div class="mini-item"><span>${char}</span><span>${code}</span></div>
    `).join('');

    // Populate Letters column
    const alphaGrid = document.getElementById('alpha-ref-grid');
    alphaGrid.innerHTML = Object.entries(morseAlphabet).map(([char, code]) => `
        <div class="mini-item"><span>${char}</span><span>${code}</span></div>
    `).join('');
}

// Call init on load
window.addEventListener('DOMContentLoaded', initPracticeLogic);

function setSubMode(m) {
    subMode = m;
    // Remove active class from all buttons
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    // Add active class to clicked button
    const activeBtn = document.getElementById(`sub-${m}`);
    if (activeBtn) activeBtn.classList.add('active');

    resetLevel(); // Generate new target
}

//profile for everypage
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('name-modal');
    const nameDisplay = document.getElementById('user-display-name');
    const nameInput = document.getElementById('name-input');
    const editBtn = document.getElementById('edit-profile-btn');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    // 1. Load saved name on startup
    const savedName = localStorage.getItem('globalUsername') || "Guest";
    nameDisplay.textContent = savedName;

    // 2. Open Modal
    editBtn.addEventListener('click', () => {
        nameInput.value = nameDisplay.textContent;
        modal.classList.add('active');
        nameInput.focus();
    });

    // 3. Save Logic
    const saveName = () => {
        const newName = nameInput.value.trim();
        if (newName) {
            nameDisplay.textContent = newName;
            localStorage.setItem('globalUsername', newName);
        }
        modal.classList.remove('active');
    };

    saveBtn.addEventListener('click', saveName);

    // 4. Cancel / Close Logic
    cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

    // Close if clicking outside the box
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // Allow 'Enter' key to save
    nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveName();
        if (e.key === 'Escape') modal.classList.remove('active');

    });
});

let longPressTimer;
let isDash = false;

const tapArea = document.getElementById('tap-zone-typing');

if (tapArea) {
    // 1. TOUCH START (Finger Down / Mouse Down)
    const handleStart = (e) => {
        if (e) e.preventDefault();
        isDash = false; // Reset for new press

        // Start a timer. If it hits 250ms, it's a Dash.
        longPressTimer = setTimeout(() => {
            isDash = true;
            // Optional: You could trigger a small vibration here for feedback
            if (navigator.vibrate) navigator.vibrate(20);
            console.log("Promoted to DASH");
        }, 250);

        handleInputStart();
    };

    // 2. TOUCH END (Finger Up / Mouse Up)
    const handleEnd = (e) => {
        if (e) e.preventDefault();
        clearTimeout(longPressTimer); // Stop the dash timer

        // Overwrite the buffer logic manually
        userMorseBuffer += isDash ? "-" : ".";

        // Update the UI indicator
        const cursor = document.getElementById('morse-cursor');
        if (cursor) cursor.textContent = userMorseBuffer;

        // Reset the auto-submit timeout
        clearTimeout(morseTimeout);
        morseTimeout = setTimeout(submitLetter, 500);
    };

    // Listeners for both Mobile and Desktop
    tapArea.addEventListener('pointerdown', handleStart);
    tapArea.addEventListener('pointerup', handleEnd);
    tapArea.addEventListener('contextmenu', (e) => e.preventDefault());
}

// --- IMPROVED SOUND LOGIC ---
// 1. Better to use a direct Audio object to avoid HTML ID issues


// Pre-load to ensure instant playback
beep.preload = 'auto';

window.addEventListener('keydown', (e) => {
    // 1. Don't play sound if typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // 2. Only trigger if Space is pressed and NOT already held down
    if (e.code === "Space" && !isKeyDown) {
        e.preventDefault(); // Stop the page from scrolling down
        isKeyDown = true;

        if (audioCtx.state === 'suspended') audioCtx.resume(); // Wake up AudioContext
        activeTone = playTone();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === "Space") {
        isKeyDown = false; // Reset the flag

        if (activeTone) {
            activeTone.stop();
            activeTone = null;
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('name-modal');
    const nameDisplay = document.getElementById('user-display-name');
    const nameInput = document.getElementById('name-input');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    // 1. CHECK FOR FIRST ENTRY
    const savedName = localStorage.getItem('globalUsername');

    if (!savedName) {
        // No name found: This is the first visit!
        modal.classList.add('active');
        nameInput.focus();
    } else {
        // Name found: Display it
        nameDisplay.textContent = savedName;
    }

    // 2. SAVE LOGIC
    const saveName = () => {
        const newName = nameInput.value.trim().toUpperCase();
        if (newName) {
            localStorage.setItem('globalUsername', newName);
            nameDisplay.textContent = newName;
            modal.classList.remove('active');
        } else {
            alert("Please enter a callsign!");
        }
    };

    saveBtn.addEventListener('click', saveName);

    // Allow Enter key
    nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveName();
    });

    // Close/Skip
    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
});

// --- AUDIO ENGINE ---
function playTone() {
    if (!isPracticeActive) return { stop: () => { } };

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();

    // Create the control object
    const toneControl = {
        stop: () => {
            // Fade out to prevent "popping" sound
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
            setTimeout(() => {
                try { osc.stop(); } catch (e) { }
            }, 60);
        }
    };

    // Assign the CONTROL object to activeTone
    activeTone = toneControl;
    return toneControl;
}

function stopAllSound() {
    if (activeTone && typeof activeTone.stop === 'function') {
        activeTone.stop();
        activeTone = null; // CRITICAL: Clear it so it can't be stopped twice
    }
}

