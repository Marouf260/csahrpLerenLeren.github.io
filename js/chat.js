// ------------------------------------------------------------------
// C# MASTERCLASS - GLOBAL PEER-TO-PEER CHAT WIDGET
// Uses PeerJS for browser-to-browser communication without a backend.
// ------------------------------------------------------------------

const CHAT_CONFIG = {
    peerJsCdn: "https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js",
    themeColor: "#3b82f6"
};

// 1. DYNAMIC ASSET LOADING -----------------------------------------
function loadScript(url, callback) {
    if (document.querySelector(`script[src="${url}"]`)) {
        if (callback) callback();
        return;
    }
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.onload = () => {
        if (callback) callback();
    };
    document.head.appendChild(script);
}

// 2. UI GENERATION -------------------------------------------------
function injectChatWidget() {
    const widgetHtml = `
        <!-- Floating Toggle Button -->
        <button id="chat-toggle-btn" class="chat-toggle-btn" aria-label="Open Chat">
            <span style="font-size: 24px;">💬</span>
        </button>

        <!-- Chat Window -->
        <div id="chat-window" class="chat-window hidden">
            <!-- Header -->
            <div class="chat-header">
                <div class="chat-title">
                    <span style="margin-right:8px;">👨‍💻</span> Student Chat
                </div>
                <button id="chat-close-btn" class="chat-close-btn">&times;</button>
            </div>

            <!-- Connection Panel (Start) -->
            <div id="chat-panel-connect" class="chat-panel active">
                <p style="font-size: 0.9em; opacity: 0.8; margin-bottom: 15px;">
                    Verbind met een medestudent om samen code te bespreken.
                </p>
                
                <div class="chat-actions">
                    <button id="btn-start-host" class="chat-btn primary">
                        📡 Start Nieuwe Chat
                    </button>
                    <div class="divider"><span>OF</span></div>
                    <div class="join-group">
                        <input type="text" id="join-code-input" placeholder="Voer code in..." maxlength="10">
                        <button id="btn-join-peer" class="chat-btn secondary">
                            Verbind
                        </button>
                    </div>
                </div>
            </div>

            <!-- Waiting Panel (Hosting) -->
            <div id="chat-panel-waiting" class="chat-panel">
                <div class="loader-pulse"></div>
                <p>Jouw Code:</p>
                <div class="code-display" id="my-peer-id">Generating...</div>
                <p style="font-size: 0.8em; opacity: 0.6; margin-top: 10px;">
                    Geef deze code aan je partner.
                </p>
                <button id="btn-cancel-host" class="chat-btn text-only">Annuleren</button>
            </div>

            <!-- Chatting Panel (Active) -->
            <div id="chat-panel-messages" class="chat-panel">
                <div id="messages-container" class="messages-container">
                    <!-- Messages will appear here -->
                    <div class="system-msg">Welkom in de chat! 👋</div>
                </div>
                <div class="input-area">
                    <input type="text" id="msg-input" placeholder="Typ een bericht..." autocomplete="off">
                    <button id="btn-send-msg">➤</button>
                </div>
                <div class="chat-status-bar">
                    <span id="connection-status" class="status-connected">Verbonden</span>
                    <button id="btn-disconnect" title="Disconnect">❌</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHtml);
    setupEventListeners();
}

// 3. LOGIC & STATE -------------------------------------------------
let peer = null;
let conn = null;
let myId = null;
let isRestoring = false;
let messageHistory = [];

function setupEventListeners() {
    // Toggles
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const closeBtn = document.getElementById('chat-close-btn');
    const chatWindow = document.getElementById('chat-window');

    toggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        const isOpen = !chatWindow.classList.contains('hidden');
        if (isOpen) {
            toggleBtn.classList.remove('pulse-anim');
            // Scroll to bottom
            const container = document.getElementById('messages-container');
            container.scrollTop = container.scrollHeight;
        }
        sessionStorage.setItem('chat_open', isOpen);
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
        sessionStorage.setItem('chat_open', false);
    });

    // Actions
    document.getElementById('btn-start-host').addEventListener('click', () => initPeer());
    document.getElementById('btn-join-peer').addEventListener('click', () => {
        const code = document.getElementById('join-code-input').value.trim();
        if (code) joinPeer(code);
    });

    document.getElementById('btn-cancel-host').addEventListener('click', resetChat);
    document.getElementById('btn-disconnect').addEventListener('click', resetChat);

    // Messaging
    const input = document.getElementById('msg-input');
    const sendBtn = document.getElementById('btn-send-msg');

    const sendMessage = () => {
        const msg = input.value.trim();
        if (msg && conn) {
            conn.send({ type: 'text', content: msg });
            addMessage(msg, 'self');
            input.value = '';
        }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

function showPanel(id) {
    document.querySelectorAll('.chat-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function resetChat() {
    if (conn) {
        conn.close();
        conn = null;
    }
    if (peer) {
        peer.destroy();
        peer = null;
    }
    // Clear Session
    sessionStorage.removeItem('chat_my_id');
    sessionStorage.removeItem('chat_target_id');
    sessionStorage.removeItem('chat_history'); // Clear history on disconnect
    messageHistory = [];

    showPanel('chat-panel-connect');
    document.getElementById('messages-container').innerHTML = '<div class="system-msg">Chat beëindigd.</div>';
}

function addMessage(text, type, save = true) {
    const container = document.getElementById('messages-container');
    const div = document.createElement('div');
    div.className = `msg-bubble ${type}`;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;

    if (save) {
        messageHistory.push({ text, type });
        sessionStorage.setItem('chat_history', JSON.stringify(messageHistory));
    }
}

// 4. PEERJS INTEGRATION --------------------------------------------
let retryCount = 0;
const MAX_RETRIES = 5;

function initPeer(customId = null, onOpenCallback = null) {
    if (typeof Peer === 'undefined') {
        alert("PeerJS library niet geladen. Check je internetverbinding of AdBlocker.");
        return;
    }

    // Use custom ID (restored) or generate new
    const idToUse = customId || "CS-" + Math.floor(Math.random() * 9000 + 1000);

    // If we are retrying, show status
    if (retryCount > 0) {
        console.log(`Poging ${retryCount}/${MAX_RETRIES} om ID ${idToUse} te claimen...`);
    }

    peer = new Peer(idToUse, { debug: 1 });

    peer.on('open', (id) => {
        retryCount = 0; // Success! Reset retries.
        myId = id;
        sessionStorage.setItem('chat_my_id', myId);
        document.getElementById('my-peer-id').textContent = id;

        if (onOpenCallback) {
            onOpenCallback(id);
            return;
        }

        const targetId = sessionStorage.getItem('chat_target_id');
        if (isRestoring && targetId) {
            showPanel('chat-panel-messages');
            addMessage("Verbinding herstellen...", "system", false);
            setTimeout(() => joinPeer(targetId), 500);
        } else {
            showPanel('chat-panel-waiting');
        }
    });

    peer.on('connection', (connection) => {
        handleConnection(connection);
    });

    peer.on('error', (err) => {
        console.error(err);
        if (err.type === 'unavailable-id') {
            // ID is still locked by previous page instance.
            // Retry a few times before giving up.
            if (customId && retryCount < MAX_RETRIES) {
                retryCount++;
                addMessage(`ID nog vergrendeld, opnieuw proberen (${retryCount})...`, "system", false);
                peer.destroy(); // Ensure old attempt is dead
                setTimeout(() => initPeer(customId, onOpenCallback), 1500); // Wait 1.5s
            } else {
                console.log("ID permanently taken, generating new identity...");
                retryCount = 0;
                // Give up on old ID, make new one
                initPeer(null, onOpenCallback);
            }
        } else if (err.type === 'peer-unavailable') {
            // If restoring, this means the partner is gone OR also refreshing.
            // We can't do much but wait or retry.
            if (!isRestoring) {
                alert("Partner niet gevonden. Code of verbinding is fout.");
                resetChat();
            } else {
                addMessage("Partner offline. Wachten...", "system", false);
            }
        }
    });
}

function joinPeer(targetId) {
    if (typeof Peer === 'undefined') return;

    // If no peer identity yet, create one as Guest first
    if (!peer) {
        const guestId = "CS-Guest-" + Math.floor(Math.random() * 9000 + 1000);
        initPeer(guestId, () => {
            joinPeer(targetId);
        });
        return;
    }

    conn = peer.connect(targetId);
    sessionStorage.setItem('chat_target_id', targetId);

    setupConnectionHandlers();
    showPanel('chat-panel-messages');
}

function handleConnection(connection) {
    conn = connection;
    // Save the OTHER person's ID so we can reconnect if WE refresh
    sessionStorage.setItem('chat_target_id', conn.peer);

    setupConnectionHandlers();
    showPanel('chat-panel-messages');

    // If we are restoring, don't spam "Connected"
    const lastMsg = messageHistory[messageHistory.length - 1];
    if (!lastMsg || lastMsg.text !== 'Verbonden!') {
        addMessage(`Verbonden!`, 'system');
    }
}

function setupConnectionHandlers() {
    if (!conn) return;

    conn.on('data', (data) => {
        if (data.type === 'text') {
            addMessage(data.content, 'peer');
        }
    });

    conn.on('close', () => {
        addMessage('Verbinding verbroken.', 'system', false);
        // Do NOT nullify conn immediately if we want to allow reconnects? 
        // No, close means tcp closed.
        conn = null;
    });

    conn.on('open', () => {
        // Connection fully established
        console.log("Connection Open confirm");
    });
}

// 5. RESTORE STATE LOGIC -------------------------------------------
function checkRestoreState() {
    // 1. Restore History first
    try {
        const history = JSON.parse(sessionStorage.getItem('chat_history'));
        if (history && Array.isArray(history) && history.length > 0) {
            messageHistory = history;
            const container = document.getElementById('messages-container');
            container.innerHTML = ''; // clear default welcome
            history.forEach(m => addMessage(m.text, m.type, false)); // false = don't double save
        }
    } catch (e) { console.error(e); }

    // 2. UI State
    if (sessionStorage.getItem('chat_open') === 'true') {
        document.getElementById('chat-window').classList.remove('hidden');
    }

    // 3. Connection State
    const storedMyId = sessionStorage.getItem('chat_my_id');
    const storedTargetId = sessionStorage.getItem('chat_target_id');

    if (storedMyId && storedTargetId) {
        // We had a session. Attempt to reclaim ID.
        console.log("Restoring Chat Session:", storedMyId);
        isRestoring = true;
        // Show panel immediately so user sees "History"
        showPanel('chat-panel-messages');
        initPeer(storedMyId);
    }
}

// 6. INITIALIZATION ------------------------------------------------
injectChatWidget();

loadScript(CHAT_CONFIG.peerJsCdn, () => {
    console.log("PeerJS Ready");
    // Only check restore AFTER PeerJS is loaded
    setTimeout(checkRestoreState, 500); // Small delay to ensure logic is ready
});

// CLEANUP ON EXIT (Fixes "ID Taken" issues on refresh)
window.addEventListener('beforeunload', () => {
    if (peer) {
        peer.destroy(); // Releases ID immediately
    }
});
