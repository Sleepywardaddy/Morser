/**
 * game.js - multiplayer game logic
 * Supports role-based sender/receiver, morse sync, scoring, and restart voting.
 */

import { doc, getDoc, updateDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const db = window.db;

// --- CONFIG ---
const DOT_MAX_MS = 150;
const LETTER_GAP_MS = 300;
const WORD_GAP_MS = 700;
const TARGET_WIN_SCORE = 300;

const MORSE_ALPHABET = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-',
  5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.'
};
const MORSE_DECODER = Object.fromEntries(Object.entries(MORSE_ALPHABET).map(([k,v]) => [v,k]));

// --- STATE ---
let myUsername = localStorage.getItem('globalUsername') || 'GUEST_OP';
let role = 'RECEIVER';
let currentTarget = '';
let currentBuffer = '';
let score = 0;
let isGameOver = false;
let timeLeft = 600;
let gameTimer = null;
let audioCtx = null;
let activeTone = null;
let tapStart = 0;
let letterTimer = null;
let wordTimer = null;
let lastSignalId = null;
let currentRoom = null;
let unsubscribeRoom = null;

const bufferDisplay = document.getElementById('signal-buffer');
const tapBtn = document.getElementById('tap-key');
const chatInput = document.getElementById('chat-input');
const chatLog = document.getElementById('chat-messages');

async function getCurrentRoom() {
  if (currentRoom) return currentRoom;
  const roomId = new URLSearchParams(window.location.search).get('id');
  if (!roomId) return null;
  const docSnap = await getDoc(doc(db, 'rooms', roomId));
  if (docSnap.exists()) {
    currentRoom = { id: docSnap.id, ...docSnap.data() };
    return currentRoom;
  }
  return null;
}

async function saveCurrentRoom() {
  if (currentRoom) {
    await updateDoc(doc(db, 'rooms', currentRoom.id), currentRoom);
  }
}

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playTone() {
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 600;
  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);

  return {
    stop() {
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);
      setTimeout(() => osc.stop(), 120);
    }
  };
}

function decodeMorse(sequence) {
  if (!sequence) return '';
  const words = sequence.trim().split('   ');
  return words.map(w => {
    return w.trim().split(' ').map(token => MORSE_DECODER[token] || '?').join('');
  }).join(' ');
}

function updateRoleCard() {
  let roleCard = document.getElementById('role-card');
  if (!roleCard) {
    roleCard = document.createElement('div');
    roleCard.id = 'role-card';
    roleCard.style.cssText = 'position:fixed; top:16px; left:16px; padding:8px 12px; border-radius:8px; z-index:100; font-weight:bold; backdrop-filter: blur(5px); background:rgba(0,0,0,0.8); color:#f8fafc; transform:scale(0); transition:transform 0.5s ease;';
    document.body.appendChild(roleCard);
  }
  const isSender = role === 'SENDER';
  roleCard.innerHTML = `<span style="color:${isSender ? '#16a34a' : '#0284c7'}">${role}</span> • ${isSender ? 'transmits' : 'intercepts'}`;
  roleCard.style.transform = 'scale(1)';
}

function updateLeaderboard() {
  if (!currentRoom) return;
  const leaderboard = document.getElementById('leaderboard-list');
  if (!leaderboard) return;
  const sorted = Object.entries(currentRoom.scores || {}).sort((a,b) => b[1] - a[1]);
  leaderboard.innerHTML = sorted.map(([name, pts]) => `<li>${name}: ${pts}</li>`).join('');
}

function syncPresence() {
  if (!currentRoom) return;
  currentRoom.lastActive = Date.now();
  currentRoom.playerCount = (currentRoom.players || []).length;

  const opCount = document.getElementById('player-count');
  if (opCount) opCount.textContent = `${currentRoom.playerCount}/${currentRoom.maxPlayers || 8}`;

  const operatorList = document.getElementById('operator-list');
  if (operatorList) {
    operatorList.innerHTML = (currentRoom.players || []).map(p => `<li><span class="status-dot"></span> ${p}${p === myUsername ? ' (YOU)' : ''}</li>`).join('');
  }

  saveCurrentRoom();
}

async function initGame() {
  myUsername = localStorage.getItem('globalUsername') || 'GUEST_OP';
  currentRoom = await getCurrentRoom();
  if (!currentRoom) {
    window.location.href = 'multiplayer.html';
    return;
  }

  // Listen for room changes
  unsubscribeRoom = onSnapshot(doc(db, 'rooms', currentRoom.id), (docSnap) => {
    if (docSnap.exists()) {
      currentRoom = { id: docSnap.id, ...docSnap.data() };
      // Update UI based on changes
      syncPresence();
      pollSignal();
      updateLeaderboard();
      if (currentRoom.restartVotes && currentRoom.restartVotes.length >= currentRoom.players.length) {
        restartGame();
      }
    }
  });

  if (!currentRoom.players) currentRoom.players = [];
  if (!currentRoom.players.includes(myUsername)) currentRoom.players.push(myUsername);
  currentRoom.scores = currentRoom.scores || {};
  if (currentRoom.scores[myUsername] == null) currentRoom.scores[myUsername] = 0;

  if (!currentRoom.currentTarget) {
    const topic = (localStorage.getItem('activeGameTopic') || 'common').toLowerCase();
    const topics = {
      common: ['RADIO', 'SIGNAL', 'VECTOR', 'INTERCEPT', 'WINDOW', 'COFFEE', 'NATURE'],
      anime: ['LUFFY', 'NARUTO', 'GOKU', 'ZORO'],
      brands: ['NIKE', 'APPLE', 'GOOGLE', 'ADIDAS'],
      food: ['APPLE', 'BANANA', 'MANGO', 'TOMATO'],
      superheroes: ['BATMAN', 'SUPERMAN', 'THOR', 'HULK'],
      countries: ['JAPAN', 'USA', 'INDONESIA', 'BRAZIL']
    };
    const pool = topics[topic] || topics.common;
    currentRoom.currentTarget = pool[Math.floor(Math.random() * pool.length)];
  }

  role = currentRoom.players[0] === myUsername ? 'SENDER' : 'RECEIVER';
  currentTarget = currentRoom.currentTarget;
  score = currentRoom.scores[myUsername] || 0;

  document.body.classList.add(role === 'SENDER' ? 'role-sender' : 'role-receiver');
  document.getElementById('my-score').textContent = score;

  updateRoleCard();
  updateTaskDisplay();
  syncPresence();
  updateLeaderboard();

  document.getElementById('waiting-overlay')?.classList.add('hidden');

  setInterval(syncPresence, 3000);
  startCountdown();
  await saveCurrentRoom();

  // Add button listeners
  document.getElementById('agree-restart-btn')?.addEventListener('click', voteRestart);
}

function appendChatMessage(sender, message, system = false) {
  const msgEl = document.createElement('div');
  msgEl.className = system ? 'msg system' : 'msg';
  msgEl.innerHTML = `<strong>[${sender}]:</strong> ${message}`;
  chatLog?.appendChild(msgEl);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function playFx(type) {
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  if (type === 'correct') {
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  } else {
    osc.frequency.value = 220;
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  }

  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
  setTimeout(() => osc.stop(), 500);
}

function startTap() {
  if (isGameOver || document.activeElement === chatInput) return;
  tapStart = Date.now();
  if (tapBtn) tapBtn.classList.add('active');
  activeTone = playTone();
}

function endTap() {
  if (tapBtn) tapBtn.classList.remove('active');
  if (activeTone) {
    activeTone.stop();
    activeTone = null;
  }

  const pressLen = Date.now() - tapStart;
  const symbol = pressLen < DOT_MAX_MS ? '.' : '-';
  currentBuffer += symbol;
  if (bufferDisplay) bufferDisplay.textContent = currentBuffer;

  clearTimeout(letterTimer);
  clearTimeout(wordTimer);

  letterTimer = setTimeout(() => {
    currentBuffer += ' ';
    if (bufferDisplay) bufferDisplay.textContent = currentBuffer;
  }, LETTER_GAP_MS);

  wordTimer = setTimeout(() => {
    currentBuffer += '  ';
    if (bufferDisplay) bufferDisplay.textContent = currentBuffer;
  }, WORD_GAP_MS);
}

function clearBuffer() {
  currentBuffer = '';
  if (bufferDisplay) bufferDisplay.textContent = '';
}

function sendTransmission() {
  if (role !== 'SENDER') {
    appendChatMessage('SYSTEM', 'Only sender can send morse transmission.', true);
    return;
  }

  const code = currentBuffer.trim();
  if (!code) {
    appendChatMessage('SYSTEM', 'No morse code to transmit.', true);
    return;
  }

  if (!currentRoom) return;

  currentRoom.lastSignal = code;
  currentRoom.lastSignalId = Date.now();
  currentRoom.currentTarget = currentTarget;
  saveCurrentRoom();

  appendChatMessage('SYSTEM', `Signal broadcast: ${code} (target ${currentTarget})`, true);
  currentBuffer = '';
  if (bufferDisplay) bufferDisplay.textContent = '';
}

function pollSignal() {
  if (role !== 'RECEIVER' || !currentRoom) return;
  if (!currentRoom.lastSignalId || currentRoom.lastSignalId === lastSignalId) return;

  lastSignalId = currentRoom.lastSignalId;
  if (bufferDisplay) {
    bufferDisplay.textContent = currentRoom.lastSignal;
    bufferDisplay.style.color = '#f59e0b';
    setTimeout(() => { if (bufferDisplay) bufferDisplay.style.color = ''; }, 180);
  }
}

function submitReceiverAnswer() {
  if (role !== 'RECEIVER' || isGameOver || !currentRoom) return;

  const decoded = decodeMorse(currentBuffer.trim());
  if (!decoded) {
    appendChatMessage('SYSTEM', 'No morse code entered to submit.', true);
    return;
  }

  const normalized = decoded.trim().toUpperCase();

  if (normalized === currentTarget.toUpperCase()) {
    currentRoom.scores = currentRoom.scores || {};
    currentRoom.scores[myUsername] = (currentRoom.scores[myUsername] || 0) + 100;
    score = currentRoom.scores[myUsername];
    document.getElementById('my-score').textContent = score;
    saveCurrentRoom();

    appendChatMessage('SYSTEM', `CORRECT! You decoded ${normalized}. +100`, true);
    playFx('correct');
    // Visual effect
    document.body.style.backgroundColor = '#16a34a';
    setTimeout(() => document.body.style.backgroundColor = '', 500);
    resetRound();

    if (score >= TARGET_WIN_SCORE) {
      endMission(`${myUsername} reaches ${score} and wins!`);
      return;
    }
  } else {
    appendChatMessage('SYSTEM', `WRONG decode: ${normalized}. Target is ${currentTarget}.`, true);
    playFx('wrong');
    // Visual effect
    document.body.style.backgroundColor = '#dc2626';
    setTimeout(() => document.body.style.backgroundColor = '', 500);
    currentBuffer = '';
    if (bufferDisplay) bufferDisplay.textContent = '';
  }
}

function resetRound() {
  if (!currentRoom) return;

  const topic = (currentRoom.topic || localStorage.getItem('activeGameTopic') || 'common').toLowerCase();
  const wordsByTopic = {
    common: ['RADIO', 'SIGNAL', 'VECTOR', 'INTERCEPT', 'WINDOW', 'COFFEE', 'NATURE'],
    anime: ['LUFFY', 'NARUTO', 'GOKU', 'ZORO'],
    brands: ['NIKE', 'APPLE', 'GOOGLE', 'ADIDAS'],
    food: ['APPLE', 'BANANA', 'MANGO', 'TOMATO'],
    superheroes: ['BATMAN', 'SUPERMAN', 'THOR', 'HULK'],
    countries: ['JAPAN', 'USA', 'INDONESIA', 'BRAZIL']
  };

  const pool = wordsByTopic[topic] || wordsByTopic.common;
  const nextWord = pool[Math.floor(Math.random() * pool.length)];
  currentTarget = nextWord;
  currentRoom.currentTarget = nextWord;
  saveCurrentRoom();
  updateTaskDisplay();
  currentBuffer = '';
  if (bufferDisplay) bufferDisplay.textContent = '';
}

function startCountdown() {
  const timer = document.getElementById('timer');
  clearInterval(gameTimer);
  gameTimer = setInterval(() => {
    if (isGameOver) return;
    if (timeLeft <= 0) {
      endMission('TIME UP');
      return;
    }
    timeLeft -= 1;
    if (timer) timer.textContent = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;
  }, 1000);
}

function endMission(text) {
  isGameOver = true;
  clearInterval(gameTimer);

  const modal = document.getElementById('result-modal');
  const title = document.getElementById('result-title');
  const winner = document.getElementById('winner-display');

  if (title) title.textContent = text;
  if (winner && currentRoom) {
    const sorted = Object.entries(currentRoom.scores || {}).sort((a,b) => b[1]-a[1]);
    if (sorted.length > 0) {
      winner.textContent = `${sorted[0][0]}: ${sorted[0][1]} points`;
    } else {
      winner.textContent = 'No one yet';
    }
  }

  modal?.classList.remove('hidden');
}

let restartVotes = new Set();
function voteRestart() {
  if (isGameOver && currentRoom) {
    restartVotes.add(myUsername);
    currentRoom.restartVotes = Array.from(restartVotes);
    saveCurrentRoom();
    appendChatMessage('SYSTEM', `Restart vote from ${myUsername} (${restartVotes.size}/${currentRoom.players.length})`, true);

    if (restartVotes.size >= currentRoom.players.length) {
      restartGame();
    }
  }
}

function restartGame() {
  if (!currentRoom) return;
  appendChatMessage('SYSTEM', 'All players agreed. Restarting...', true);
  isGameOver = false;
  timeLeft = 600;
  restartVotes.clear();
  currentRoom.restartVotes = [];
  document.getElementById('result-modal')?.classList.add('hidden');
  resetRound();
  startCountdown();
  saveCurrentRoom();
}

function executeExit() {
  if (currentRoom) {
    currentRoom.players = (currentRoom.players || []).filter(p => p !== myUsername);
    currentRoom.playerCount = currentRoom.players.length;
    if (currentRoom.playerCount === 0) currentRoom.deadSince = Date.now();
    saveCurrentRoom();
  }
  if (unsubscribeRoom) unsubscribeRoom();
  window.location.href = 'multiplayer.html';
}

window.confirmExit = () => document.getElementById('exit-modal')?.classList.remove('hidden');
window.closeExitModal = () => document.getElementById('exit-modal')?.classList.add('hidden');
window.voteRestart = voteRestart;

window.addEventListener('beforeunload', executeExit);

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (document.activeElement !== chatInput) startTap();
  }

  if (e.code === 'Enter') {
    if (document.activeElement === chatInput) {
      if (role === 'SENDER') {
        const message = chatInput.value.trim();
        if (message) {
          appendChatMessage(myUsername, message);
          chatInput.value = '';
        }
      }
    } else if (role === 'RECEIVER') {
      e.preventDefault();
      submitReceiverAnswer();
    }
  }

  if (e.code === 'Backspace' && document.activeElement !== chatInput) {
    e.preventDefault();
    clearBuffer();
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'Space') {
    endTap();
  }
});

window.addEventListener('DOMContentLoaded', initGame);


function playFeedbackSFX(isCorrect) {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (isCorrect) {
        // Soothing: High pitch, soft fade
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        document.body.style.backgroundColor = "#065f46"; // Green flash
    } else {
        // Disturbing: Low "thud" pitch
        oscillator.frequency.setValueAtTime(110, audioCtx.currentTime); // A2 note
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        document.body.style.backgroundColor = "#7f1d1d"; // Red flash
    }

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    oscillator.stop(audioCtx.currentTime + 0.5);

    // Reset background color after 300ms
    setTimeout(() => { document.body.style.backgroundColor = ""; }, 300);
}