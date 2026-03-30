// --- Multiplayer Lobby System (Firebase-based) ---
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const db = window.db;
const roomsCollection = collection(db, 'rooms');
const LOBBY_CLEANUP_MS = 10000; // 10 seconds empty room grace period

let roomsCache = [];
let unsubscribeRooms = null;

function getRooms() {
  return roomsCache;
}

async function saveRoom(room) {
  await setDoc(doc(roomsCollection, room.id), room);
}

async function deleteRoom(roomId) {
  await deleteDoc(doc(roomsCollection, roomId));
}

function cleanupRooms() {
  const now = Date.now();
  roomsCache = roomsCache.filter(room => {
    if (!room || !room.id || !room.name) return false;

    const playerCount = (room.players || []).length;
    if (playerCount > 0) {
      delete room.deadSince;
      return true;
    }

    if (!room.deadSince) {
      room.deadSince = now;
      return true;
    }

    if (now - room.deadSince > LOBBY_CLEANUP_MS) {
      deleteRoom(room.id); // async, but filter out
      return false;
    }
    return true;
  });
  return roomsCache;
}

function refreshLobbyDisplay() {
  const grid = document.getElementById('room-ticket-grid');
  if (!grid) return;

  const rooms = cleanupRooms();
  if (rooms.length === 0) {
    grid.innerHTML = '<div class="no-rooms">No active frequencies found. Create a room to get started.</div>';
    return;
  }

  grid.innerHTML = rooms.map(room => {
    const playerCount = (room.players || []).length;
    const maxPlayers = room.maxPlayers || 8;
    const privateIcon = room.isPrivate ? '<i class="fas fa-lock"></i>' : '';

    return `
    <div class="room-card ${playerCount >= maxPlayers ? 'full' : ''}">
      <div class="room-top">
        <span class="room-id">FRQ // ${room.id}</span>
        <h3 class="room-name">${room.name}</h3>
        <span class="room-topic-tag">${(room.topic || 'common').toUpperCase()}</span>
      </div>
      <div class="room-bottom">
        <span class="ops-count">${playerCount}/${maxPlayers} Ops ${privateIcon}</span>
        <button class="join-btn" onclick="tryJoinRoom('${room.id}')" ${playerCount >= maxPlayers ? 'disabled' : ''}>INTERCEPT</button>
      </div>
    </div>`;
  }).join('');
}

let _pendingJoinRoomId = null;

async function tryJoinRoom(id) {
  const room = roomsCache.find(r => r.id === id);
  if (!room) return;

  if (room.isPrivate) {
    _pendingJoinRoomId = id;
    document.getElementById('join-lock-modal')?.classList.remove('hidden');
    return;
  }

  await joinRoom(id);
}

async function submitJoinPassword() {
  const passInput = document.getElementById('join-pass-input');
  const password = (passInput && passInput.value) ? passInput.value : '';
  const room = roomsCache.find(r => r.id === _pendingJoinRoomId);
  if (!room) return;

  if (room.password === password) {
    await joinRoom(_pendingJoinRoomId);
    closeJoinModal();
  } else {
    alert('WRONG ACCESS KEY — try again.');
  }
}

function closeJoinModal() {
  const input = document.getElementById('join-pass-input');
  if (input) input.value = '';
  document.getElementById('join-lock-modal')?.classList.add('hidden');
}

async function joinRoom(id) {
  const username = getUsername();
  const room = roomsCache.find(r => r.id === id);
  if (!room) return;

  if (!room.players) room.players = [];
  if (!room.players.includes(username)) {
    room.players.push(username);
  }

  room.playerCount = room.players.length;
  room.lastActive = Date.now();
  room.deadSince = undefined;

  if (!room.scores) room.scores = {};
  if (room.scores[username] == null) room.scores[username] = 0;

  await saveRoom(room);
  localStorage.setItem('activeGameTopic', room.topic || 'common');
  window.location.href = `game.html?id=${id}`;
}

async function confirmCreateRoom() {
  const nameInput = document.getElementById('maker-room-name');
  const limitInput = document.getElementById('maker-player-limit');
  const topicInput = document.getElementById('maker-topic');
  const privateInput = document.getElementById('maker-is-private');
  const passInput = document.getElementById('maker-password');

  if (!nameInput || !limitInput || !topicInput) return;

  const roomId = 'TX-' + Math.floor(100 + Math.random() * 899);
  const maxPlayers = parseInt(limitInput.value, 10) || 8;
  const username = getUsername();

  const newRoom = {
    id: roomId,
    name: nameInput.value.trim() || 'Unknown Signal',
    topic: topicInput.value || 'common',
    maxPlayers,
    isPrivate: privateInput?.checked || false,
    password: privateInput?.checked ? (passInput?.value.trim() || '') : null,
    players: [username],
    playerCount: 1,
    scores: {[username]: 0},
    currentTarget: '',
    lastActive: Date.now(),
    deadSince: null
  };

  await saveRoom(newRoom);
  localStorage.setItem('activeGameTopic', newRoom.topic);
  window.location.href = `game.html?id=${roomId}`;
}

function initMultiplayerUI() {
  const username = getUsername();
  const nameDisplay = document.getElementById('user-display-name');
  if (nameDisplay) nameDisplay.textContent = username === 'GUEST_OP' ? 'Guest' : username;

  if (!localStorage.getItem('globalUsername')) {
    document.getElementById('name-modal')?.classList.remove('hidden');
  }

  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');

  if (saveBtn) {
    saveBtn.onclick = () => {
      const input = document.getElementById('name-input');
      if (!input) return;
      const value = input.value.trim().toUpperCase();
      if (value.length < 2) {
        alert('Enter at least 2 characters for callsign');
        return;
      }
      setUsername(value);
      if (nameDisplay) nameDisplay.textContent = value;
      document.getElementById('name-modal')?.classList.add('hidden');
      refreshLobbyDisplay();
    };
  }

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      document.getElementById('name-modal')?.classList.add('hidden');
    };
  }

  // Listen for rooms changes
  unsubscribeRooms = onSnapshot(roomsCollection, (snapshot) => {
    roomsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    refreshLobbyDisplay();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initMultiplayerUI();
  setInterval(cleanupRooms, 1000); // periodic cleanup
});

// Additional functions for UI
function openRoomMaker() {
  document.getElementById('room-maker-modal')?.classList.remove('hidden');
}

function closeRoomMaker() {
  document.getElementById('room-maker-modal')?.classList.add('hidden');
}

function togglePasswordField() {
  const checkbox = document.getElementById('maker-is-private');
  const group = document.getElementById('password-input-group');
  if (checkbox && group) {
    group.classList.toggle('hidden', !checkbox.checked);
  }
}

function toggleEye(inputId, eyeIcon) {
  const input = document.getElementById(inputId);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
    eyeIcon.classList.toggle('fa-eye');
    eyeIcon.classList.toggle('fa-eye-slash');
  }
}

