// Global Mute State - persisted in LocalStorage
let isMuted = localStorage.getItem('morse_muted') === 'true';
let isBeeping = false; // Track if sound is currently playing
//sound
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let activeTone = null;

// 1. Configuration
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

// 2. State Management (Combined)
let queue = [];
let currentIndex = 0;
let currentWordProgress = "";
let userMorseBuffer = "";
let timeLeft = 60; // Set to 10 seconds as requested
let timerInterval = null;
let testStarted = false;
let pressStartTime = 0;
let morseTimeout;
let totalCorrectChars = 0; // Add this to stop the crash!

// Tracking Variables for Results
let totalCharsTyped = 0;
let correctCharsTyped = 0;
let wrongWordsCount = 0;
let correctWordsCount = 0;
let hasErrorInCurrentWord = false;

//trackhistory
let wordStatus = []; // Stores "correct" or "wrong" for each word


// 3. UI Functions
function generateQueue() {
    queue = Array.from({ length: 60 }, () => wordBank[Math.floor(Math.random() * wordBank.length)]);
    renderQueue();
}

function renderQueue() {
    const wordDisplay = document.getElementById('word-display');
    if (!wordDisplay) return;

    wordDisplay.innerHTML = queue.map((word, i) => {
        let className = "word";

        if (i < currentIndex) {
            // Check if this finished word was correct or wrong
            // (Assuming you have a way to track this, like an array of results)
            className += " finished";
        }

        // Inside the .map() loop in renderQueue
        if (i < currentIndex) {
            // If the word is in the past, get its saved status (correct or wrong)
            // This adds the class "word correct" or "word wrong"
            className += ` ${wordStatus[i] || ""}`;
        }

        if (i === currentIndex) {
            className += " current";
            // THIS IS THE KEY: If there's an error, add the 'is-wrong' class to the WHOLE word
            if (hasErrorInCurrentWord) {
                className += " is-wrong";
            }

            let letters = word.split('').map((char, index) => {
                // If the word is wrong, we don't show individual green letters anymore
                let charClass = "";
                if (!hasErrorInCurrentWord && index < currentWordProgress.length) {
                    charClass = "char-done";
                }
                return `<span class="${charClass}">${char}</span>`;
            }).join('');

            return `<span class="${className}">${letters}</span>`;
        }
        return `<span class="${className}">${word}</span>`;
    }).join('');
}

// 4. Input Logic
function handleInputStart() {
    if (timeLeft <= 0) return;

    // Play sound for Tap Zone (Mouse/Touch)
    // Keyboard sound is handled by the window listener above
    if (!isBeeping) {
        isBeeping = true;
        beep.currentTime = 0;
        beep.play().catch(() => { });
    }

    if (!testStarted) {
        testStarted = true;
        startTimer();
    }
    pressStartTime = Date.now();
    clearTimeout(morseTimeout);

    // 1. Always run the timer/game logic (so time doesn't stop)
    const isPractice = !document.getElementById('practice-sheet').classList.contains('hidden');
    if (!isPractice && !testStarted) {
        testStarted = true;
        if (typeof startTimer === 'function') startTimer();
    }

    pressStartTime = Date.now();
    clearTimeout(inputTimer);

    // 2. ONLY play sound if master switch is ON
    if (!isMuted && !isBeeping && beep) {
        isBeeping = true;
        beep.currentTime = 0;
        beep.play().catch(() => { });
    }
}

function handleInputEnd() {
    if (timeLeft <= 0) return;

    // Stop sound
    isBeeping = false;
    beep.pause();
    beep.currentTime = 0;

    const duration = Date.now() - pressStartTime;
    
    // --- MATCH WRITING.JS DOT/DASH SPLIT (250ms) ---
    userMorseBuffer += (duration < 250) ? "." : "-";

    const cursor = document.getElementById('morse-cursor');
    if (cursor) cursor.textContent = userMorseBuffer;

    clearTimeout(morseTimeout);
    
    // --- MATCH WRITING.JS LETTER GAP (200ms) ---
    // This is the "Speed" fix. Changing 600 to 200 makes it print instantly.
    morseTimeout = setTimeout(submitLetter, 200); 
    
    handleLineJump();
}

function submitLetter() {
    const letter = Object.keys(morseAlphabet).find(key => morseAlphabet[key] === userMorseBuffer);
    const targetWord = queue[currentIndex];
    const typedSpan = document.getElementById('typed-text');

    if (letter && targetWord) {
        totalCharsTyped++;
        currentWordProgress += letter;
        if (typedSpan) typedSpan.textContent = currentWordProgress;

        // --- THE LOCK LOGIC ---
        // If it was already wrong, it STAYS wrong. 
        // If it was correct but this new letter is wrong, it BECOMES wrong.
        const expectedLetter = targetWord[currentWordProgress.length - 1];
        if (letter !== expectedLetter || hasErrorInCurrentWord) {
            hasErrorInCurrentWord = true;
        }
        // ----------------------

        // This block triggers when you finish the last letter of a word
        if (currentWordProgress.length === targetWord.length) {

            if (hasErrorInCurrentWord) {
                // 1. Mark for HISTORY (Queue Display)
                wordStatus[currentIndex] = "wrong";
                // 2. Mark for RESULT (Modal Table)
                wrongWordsCount++;
            } else {
                // 1. Mark for HISTORY (Queue Display)
                wordStatus[currentIndex] = "correct";
                // 2. Mark for RESULT (Modal Table)
                correctWordsCount++;
            }

            // Prepare for the next word
            currentIndex++;
            currentWordProgress = "";
            hasErrorInCurrentWord = false;

            // Clear the actual text on the screen
            const typedSpan = document.getElementById('typed-text');
            if (typedSpan) {
                typedSpan.textContent = "";
            }
        }
    }

    userMorseBuffer = "";
    if (document.getElementById('morse-cursor')) {
        document.getElementById('morse-cursor').textContent = "";
    }
    renderQueue();
}



// 5. Timer & System
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            timeLeft = 0;
            clearInterval(timerInterval);
            finishTest();
            return;
        }

        timeLeft--;

        // Update Timer Display
        const timerEl = document.getElementById('timer');
        if (timerEl) {
            let mins = Math.max(0, Math.floor(timeLeft / 60));
            let secs = Math.max(0, timeLeft % 60);
            timerEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }

        // REMOVED: Real-time WPM calculation logic is gone from here.

    }, 1000);
}

function finishTest() {
    console.log("Timer finished. Starting finishTest...");

    if (timerInterval) clearInterval(timerInterval);

    // 1. Calculate character counts from the display classes
    const greenWords = document.querySelectorAll('.word.correct');
    const redWords = document.querySelectorAll('.word.wrong');

    let correctChars = 0;
    let wrongChars = 0;

    greenWords.forEach(word => { correctChars += word.textContent.length; });
    redWords.forEach(word => { wrongChars += word.textContent.length; });

    const totalChars = correctChars + wrongChars;
    const totalWordsFinished = correctWordsCount + wrongWordsCount;

    console.log("Calculating stats...", { correctWordsCount, wrongWordsCount, totalChars });

    // 2. Update the WPM (Matches id="final-wpm")
    const wpmDisplay = document.getElementById('final-wpm');
    if (wpmDisplay) wpmDisplay.textContent = totalWordsFinished;

    // 3. Update Correct/Wrong Counts (Matches your table IDs)
    const correctWordsElem = document.getElementById('correct-words-count');
    if (correctWordsElem) correctWordsElem.textContent = correctWordsCount;

    const wrongWordsElem = document.getElementById('wrong-words-count');
    if (wrongWordsElem) wrongWordsElem.textContent = wrongWordsCount;

    // 4. Update Character Breakdown (Matches id="total-chars")
    const charDisplay = document.getElementById('total-chars');
    if (charDisplay) {
        charDisplay.innerHTML = `
            <span style="color: #22c55e;">${correctChars}</span> 
            <span style="color: #475569;">|</span> 
            <span style="color: #ef4444;">${wrongChars}</span> 
            <span style="color: #1e293b; font-weight: bold; margin-left: 8px;">(${totalChars})</span>
        `;
    }

    // 5. Accuracy Calculation
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
    const accDisplay = document.getElementById('final-accuracy');
    if (accDisplay) accDisplay.textContent = accuracy + "%";

    // 6. OPEN THE MODAL
    const modal = document.getElementById('result-modal');
    if (modal) {
        console.log("Opening Modal...");
        modal.classList.remove('hidden');
        modal.style.display = 'flex'; // This overrides any CSS 'display: none'
    } else {
        console.error("CRITICAL ERROR: Element 'result-modal' not found in HTML!");
    }

    const finalScore = correctWordsCount + wrongWordsCount;

    // Update the rank visual
    updateRank(finalScore);

    // Show the card
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
}

function resetTypingTest() {
    // 1. Stop the timer immediately
    if (typeof timerInterval !== 'undefined') clearInterval(timerInterval);

    // 2. CRITICAL FIX: Reset the Logic Flags
    // This prevents the "Double Click" and "First Word Red" bugs
    testStarted = false;
    hasErrorInCurrentWord = false;
    currentIndex = 0;
    currentWordProgress = "";
    userMorseBuffer = "";

    // 3. Reset Counters
    timeLeft = 60;
    totalCharsTyped = 0;
    correctWordsCount = 0;
    wrongWordsCount = 0;

    // 4. UI Cleanup
    document.getElementById('timer').textContent = "1:00";
    document.getElementById('typed-text').textContent = "";
    document.getElementById('morse-cursor').textContent = "";

    const inputField = document.getElementById('typing-input');
    if (inputField) {
        inputField.value = "";
        inputField.focus();
    }

    // 5. Clear Word Colors
    const wordDisplay = document.getElementById('word-display');
    if (wordDisplay) {
        wordDisplay.innerHTML = ""; // Wipe the old words completely
    }

    // 6. Close the Result Window
    const modal = document.getElementById('result-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }

    // 7. Restart the Game
    if (typeof generateQueue === 'function') {
        generateQueue();
    }

    const container = document.getElementById('word-display');
    if (container) {
        container.scrollTop = 0; // Snap back to the top
    }
}

function copyResultToClipboard() {
    const wpm = document.getElementById('final-wpm').textContent;
    const acc = document.getElementById('final-accuracy').textContent;
    const text = `📻 MorsePro Result\nSpeed: ${wpm} WPM\nAccuracy: ${acc}\nCan you beat my score?`;
    navigator.clipboard.writeText(text).then(() => {
        alert("Result copied to clipboard!");
    });
}

// 6. Listeners
const tapArea = document.getElementById('tap-zone-typing');
if (tapArea) {
    tapArea.onmousedown = (e) => { e.preventDefault(); handleInputStart(); };
    tapArea.onmouseup = handleInputEnd;
}

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

// 2. FINISH THE WORD (This is where the magic happens)
// This function should be called by your Morse logic when a word is done
function completeCurrentWord() {
    // ... logic to check if word is correct ...

    currentIndex++;

    // Clear the input displays
    document.getElementById('typed-text').textContent = "";
    document.getElementById('morse-cursor').textContent = "";
    userMorseBuffer = "";

    // TRIGGER THE LINE JUMP
    handleLineJump();

    // REFRESH DISPLAY
    updateWordDisplay();
}

window.onkeyup = (e) => {
    if (e.code === 'Space') handleInputEnd();
};

generateQueue();

function shareAsImage() {
    console.log("Generating Card Screenshot...");

    // Target only the inner area with the rounded border
    const element = document.getElementById("capture-area");

    html2canvas(element, {
        backgroundColor: null, // Set to null to preserve transparency if needed
        scale: 3,             // High resolution for sharing
        logging: false,
        useCORS: true,        // Ensures emojis and external icons render correctly
        borderRadius: 20,     // Explicitly tell the renderer to respect the radius

        onclone: (clonedDoc) => {
            const area = clonedDoc.getElementById('capture-area');
            const charDisplayClone = clonedDoc.getElementById('total-chars');
            const wpmClone = clonedDoc.getElementById('final-wpm');
            const correctWordsClone = clonedDoc.getElementById('correct-words-count');
            const wrongWordsClone = clonedDoc.getElementById('wrong-words-count');

            // Force the specific visual card styles for the screenshot
            area.style.border = "1px solid #e2e8f0";
            area.style.boxShadow = "none"; // Remove shadows for a cleaner crop
            area.style.margin = "0";

            // 1. Force WPM Color
            if (wpmClone) {
                wpmClone.style.color = "#15803d";
                wpmClone.style.fontWeight = "900";
            }

            // 2. Fix Character Breakdown Colors
            const existingChars = charDisplayClone.innerText.split('|');
            const correctChars = existingChars[0] ? existingChars[0].trim() : "0";
            let wrongCharsRaw = existingChars[1] ? existingChars[1].trim() : "0 (0)";
            let wrongCharsSplit = wrongCharsRaw.match(/([^(]+)\(([^)]+)\)/);

            let wrongCharsValue = "0";
            let totalCharsValue = "0";

            if (wrongCharsSplit) {
                wrongCharsValue = wrongCharsSplit[1].trim();
                totalCharsValue = wrongCharsSplit[2].trim();
            } else {
                wrongCharsValue = wrongCharsRaw;
            }

            charDisplayClone.innerHTML = `
                <span style="color: #15803d !important; font-weight: bold;">${correctChars}</span>
                <span style="color: #64748b !important; margin: 0 5px;">|</span>
                <span style="color: #be123c !important; font-weight: bold;">${wrongCharsValue}</span>
                <span style="color: #1e293b !important; font-weight: bold; margin-left: 8px;">(${totalCharsValue})</span>
            `;

            // 3. Force Table Colors
            if (correctWordsClone) correctWordsClone.style.color = "#15803d";
            if (wrongWordsClone) wrongWordsClone.style.color = "#be123c";
        }
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `MorsePro-Result.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
}

function updateRank(wpm) {
    const emojiEl = document.getElementById('rank-emoji');
    const textEl = document.getElementById('rank-text');

    let rank = { emoji: "🌱", text: "warming up!" };

    if (wpm >= 100) {
        rank = { emoji: "🛰️", text: "Light Speed!" };
    } else if (wpm >= 80) {
        rank = { emoji: "☄️", text: "Meteor Morse!" };
    } else if (wpm >= 60) {
        rank = { emoji: "🏎️", text: "F1 Driver!" };
    } else if (wpm >= 50) {
        rank = { emoji: "🐆", text: "Cheetah Instinct!" };
    } else if (wpm >= 40) {
        rank = { emoji: "🏹", text: "Arrow's Flight!" };
    } else if (wpm >= 30) {
        rank = { emoji: "🐎", text: "Horse Power!" };
    } else if (wpm >= 20) {
        rank = { emoji: "🚲", text: "you are pushing pedals!" };
    } else if (wpm >= 10) {
        rank = { emoji: "🚶", text: "fast enough!" };
    } else if (wpm >= 5) {
        rank = { emoji: "🐢", text: "Patient one!" };
    } else {
        rank = { emoji: "🐣", text: "New Learner!" };
    }

    emojiEl.textContent = rank.emoji;
    textEl.textContent = rank.text;
}

//x button
function closeModal() {
    const modal = document.getElementById('result-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none'; // Ensure it's fully hidden
    }

    resetTypingTest();
}

//delete key
// Add this to your KeyDown listener
window.onkeydown = (e) => {
    if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        handleInputStart();
    }

    // FAST DELETE: Bind to 'V' (Right next to Space)
    if (e.code === 'KeyB') {
        e.preventDefault();
        if (currentWordProgress.length > 0) {
            currentWordProgress = currentWordProgress.slice(0, -1);

            // Re-check if the word is still "wrong" after deleting the bad letter
            const targetWord = queue[currentIndex];
            let isStillWrong = false;
            for (let i = 0; i < currentWordProgress.length; i++) {
                if (currentWordProgress[i] !== targetWord[i]) isStillWrong = true;
            }
            hasErrorInCurrentWord = isStillWrong;

            document.getElementById('typed-text').textContent = currentWordProgress;
            renderQueue();
        }
    }
};

//scroll line like 10fastfinger
function handleLineJump() {
    const container = document.getElementById('word-display');
    const allWords = container.querySelectorAll('.word');
    const currentWord = allWords[currentIndex];

    if (!currentWord) return;

    // We get the position of the word relative to the container
    const relativeTop = currentWord.offsetTop - container.offsetTop;

    // If the word is below the first line (usually > 40px)
    if (relativeTop > 40) {
        // Instant jump: set the scroll position directly
        // This forces the current line to be the NEW top line
        container.scrollTop = relativeTop;
    }
}

function completeWord() {
    // 1. Move the logic forward
    currentIndex++;

    // 2. CLEAR THE VISUAL INPUT BOXES
    const typedText = document.getElementById('typed-text');
    const morseCursor = document.getElementById('morse-cursor');
    const hiddenInput = document.getElementById('typing-input');

    if (typedText) typedText.textContent = "";     // Clears the letters typed
    if (morseCursor) morseCursor.textContent = ""; // Clears dots/dashes
    if (hiddenInput) hiddenInput.value = "";       // Clears the hidden logic

    // 3. RUN THE JUMP
    handleLineJump();

    // 4. HIGHLIGHT NEW WORD
    updateWordDisplay();
}

function updateWordDisplay() {
    const words = document.querySelectorAll('.word');
    words.forEach((word, index) => {
        word.classList.remove('current');
        if (index === currentIndex) {
            word.classList.add('current');
        }
    });
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

//clearbackspace
function clearCurrentMorse() {
    // 1. Clear the visual display
    document.getElementById('typed-text').innerText = "";

    // 2. Reset your internal Morse buffer (whatever variable holds your dots/dashes)
    // Assuming your variable is called currentMorseBuffer:
    currentMorseBuffer = "";

    // 3. Play a subtle click sound if you have the audio system set up
    console.log("Input cleared");
}

// Get the audio element
const tapSound = document.getElementById('type-sound');

// Function to play sound
function playTapSound() {
    if (tapSound) {
        tapSound.currentTime = 0; // Reset to start so it can overlap/repeat quickly
        tapSound.play().catch(error => {
            // Browsers often block audio until the user clicks something
            console.log("Audio playback delayed until user interaction.");
        });
    }
}

// --- IMPROVED SOUND LOGIC ---
const beep = document.getElementById('morse-beep');

window.addEventListener('keydown', (e) => {
    // 1. Only trigger for Spacebar
    // 2. e.repeat === true means the key is being held down. 
    //    We 'return' so it doesn't restart the sound.
    if (e.code !== 'Space' || e.repeat) return;

    if (!isBeeping) {
        isBeeping = true;
        if (beep) {
            beep.currentTime = 0; // Start from the beginning
            beep.play().catch(err => console.log("Audio blocked by browser"));
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        isBeeping = false;
        if (beep) {
            beep.pause();
            // Optional: reset to 0 so it's ready for a fresh tap
            beep.currentTime = 0;
        }
    }
});

const tapZones = ['tap-zone', 'tap-zone-typing'];

tapZones.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        // 1. Disable the Long-Press Menu (The "Share/Download" popup)
        el.oncontextmenu = function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        // 2. Use Pointer Events (Better for mobile + desktop combined)
        el.addEventListener('pointerdown', (e) => {
            e.preventDefault(); // Prevents the browser from taking over the touch
            handleInputStart();
        }, { passive: false });

        el.addEventListener('pointerup', (e) => {
            e.preventDefault();
            handleInputEnd();
        }, { passive: false });

        // 3. Handle if the finger slides off the button
        el.addEventListener('pointerleave', (e) => {
            if (isBeeping) handleInputEnd();
        });
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