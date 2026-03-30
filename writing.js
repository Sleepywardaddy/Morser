//localtestsing
// Create a "Radio Frequency" for all tabs to listen to
const lobbyChannel = new BroadcastChannel('morse_lobby_sync');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let activeTone = null;

// When a lobby is created or roles rotate, "Broadcast" it
function broadcastSync(data) {
    lobbyChannel.postMessage(data);
}

// Listen for updates from other tabs
lobbyChannel.onmessage = (event) => {
    const { type, payload } = event.data;

    if (type === 'NEW_LOBBY') {
        console.log("Found a lobby created in another tab!", payload);
        // Update your UI here
    }
    
    if (type === 'ROLE_SWAP') {
        currentOperatorIndex = payload.newIndex;
        rotateRoles(); // Run your rotation logic
    }
};

const DOT_MAX_MS = 25;      // Under 150ms is a dot
const DASH_LIMIT = 30;    // Anything held > 200ms is a Dash
const LETTER_GAP_MS = 150;   // Wait 0.35s of silence to "print" the letter
const WORD_GAP_MS = 275;    // Wait 1s of silence to add a space

// 1. Configuration
const MORSE_DICT = {
    '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
    '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
    '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
    '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
    '-.--': 'Y', '--..': 'Z', '.----': '1', '..---': '2', '...--': '3',
    '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8',
    '----.': '9', '-----': '0'
};

let userMorseBuffer = "";
let startTime = 0;
let letterTimer = null;
let spaceTimer = null;

const paper = document.getElementById('writing-paper');
const placeholder = document.getElementById('paper-placeholder');
const preview = document.getElementById('input-preview');
const beep = document.getElementById('morse-beep');

// 2. Input Functions
function startPress() {
    // THIS IS THE FIX:
    // If a space was scheduled to appear, kill it because I just pressed a button!
    clearTimeout(spaceTimer); 
    clearTimeout(letterTimer); // Also kill the letter timer just in case

    startTime = Date.now();
    if (beep) {
        beep.currentTime = 0; // Reset sound for realism
        beep.play().catch(() => { });
    }
}

function endPress() {
    if (beep) {
        beep.pause();
        beep.currentTime = 0;
    }

    const duration = Date.now() - startTime;
    const symbol = (duration < 250) ? "." : "-";

    userMorseBuffer += symbol;
    if (preview) preview.textContent = userMorseBuffer;

    // Wait 700ms of silence to "lock in" the letter
    clearTimeout(letterTimer);
    letterTimer = setTimeout(translateBuffer, 200);
}

function translateBuffer() {
    const character = MORSE_DICT[userMorseBuffer];

    if (character && paper) {
        if (placeholder) placeholder.style.display = "none";

        // Type the letter
        paper.textContent += character;

        // Auto-space after 1.5 seconds of total silence
        clearTimeout(spaceTimer);
        spaceTimer = setTimeout(() => {
            if (!paper.textContent.endsWith(" ")) paper.textContent += " ";
        }, 500);
    }

    // Reset buffer
    userMorseBuffer = "";
    if (preview) preview.textContent = "";
}

// 3. Event Listeners (Mouse, Touch, Keyboard)
const tapZone = document.getElementById('tap-zone');
if (tapZone) {
    tapZone.addEventListener('pointerdown', (e) => { e.preventDefault(); startPress(); });
    tapZone.addEventListener('pointerup', (e) => { e.preventDefault(); endPress(); });
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat) startPress();
    }
    // Backspace logic (B key) for the Paper
    if (e.key.toLowerCase() === 'b') {
        const paper = document.getElementById('writing-paper');
        if (paper && paper.textContent.length > 0) {
            // This removes the last character, and the CSS cursor will follow
            paper.textContent = paper.textContent.slice(0, -1);

            // Show placeholder again if empty
            const placeholder = document.getElementById('paper-placeholder');
            if (paper.textContent === "" && placeholder) {
                placeholder.style.display = "block";
            }
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') endPress();
});

//ms delay
function handleInputEnd() {
    stopBeep();
    
    const holdTime = Date.now() - startTime;
    const symbol = (holdTime < DASH_LIMIT) ? "." : "-";
    
    // 1. Add to the BUFFER, don't print yet!
    userMorseBuffer += symbol;
    
    // 2. Show the buffer in a small "Preview" so you know it's working
    if (preview) preview.textContent = userMorseBuffer;

    // 3. THE FIX: The Gap Timer
    // We clear the old timer every time you tap. 
    // It only finishes if you STOP tapping for 500ms.
    clearTimeout(letterTimer); 
    
    letterTimer = setTimeout(() => {
        commitLetterToPaper(); 
    }, LETTER_GAP);
}


function commitLetterToPaper() {
    // Now we look at the WHOLE buffer (e.g., "---")
    const char = MORSE_DICT[userMorseBuffer]; 
    
    if (char) {
        paper.textContent += char; // This prints 'O' for '---' instead of 'TTT'
    }
    
    // Reset for the next letter
    userMorseBuffer = "";
    if (preview) preview.textContent = "";
}

//profile for every page
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

    const soundBtn = document.getElementById('nav-sound-toggle');
    if (soundBtn) {
        soundBtn.addEventListener('click', toggleMute);

        // Set initial state from memory
        if (isMuted) {
            soundBtn.classList.add('muted');
            const icon = soundBtn.querySelector('i');
            if (icon) icon.className = 'fas fa-volume-mute';
        }
    }
});

//thebettersound
// --- AUDIO ENGINE ---


function playTone() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); 
    gain.connect(audioCtx.destination);
    
    osc.frequency.value = 600; // The "Golden" Morse pitch
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    
    return { 
        stop: () => {
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
            setTimeout(() => osc.stop(), 100);
        }
    };
}