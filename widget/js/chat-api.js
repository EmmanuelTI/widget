// ===============================
// CONFIG
// ===============================
const API_BASE = "https://cardiobot-production.up.railway.app";
const ASK_URL = `${API_BASE}/ask`;
const AUTH_URL = `${API_BASE}/auth/anonymous`;
const FAQS_URL = `${API_BASE}/faqs/active`;
const HEALTH_URL = `${API_BASE}/health`;

// ===============================
// SESIÓN ANÓNIMA
// ===============================
let anonymousId = null;

async function createAnonymousSession() {

    if (anonymousId) {
        return anonymousId;
    }

    try {
        // 🔹 Detectar segmento
        const segment = window.ChatConfig.getSegment();
        // 🔹 Construir URL
        const url = `${AUTH_URL}?segment=${encodeURIComponent(segment)}`;
        // 🔹 Hacer petición
        const res = await fetch(url, {
            method: "POST"
        });
        if (!res.ok) {
            throw new Error("❌ No se pudo crear sesión. Status: " + res.status);
        }
        // 🔹 Leer body
        const data = await res.json();
        // 🔹 Guardar ID
        anonymousId = data.anonymous_id;
        return anonymousId;
    } catch (error) {
        throw error;
    }
}



// ===============================
// ENVIAR MENSAJE AL CHAT
// ===============================
async function sendMessageToAPI(question) {
    try {
        if (!anonymousId) {
            await createAnonymousSession();
        }
        const segment = window.ChatConfig.getSegment();
        const url = `${ASK_URL}?question=${encodeURIComponent(question)}&anonymous_id=${encodeURIComponent(anonymousId)}&segment=${encodeURIComponent(segment)}`;
        const response = await fetch(url, {
            method: "POST"
        });
        if (!response.ok) {
            throw new Error("Error en la petición");
        }
        const data = await response.json();
        return data.answer ?? "Sin respuesta del servidor";
    } catch (err) {
        console.error("🔥 Error en /ask:", err);
        return "⚠️ Error al conectar con el servidor";
    }
}

// ===============================
// FAQs
// ===============================
async function getActiveFaqs(limit = 5) {
    try {
        const response = await fetch(`${FAQS_URL}?limit=${limit}`);
        if (!response.ok) throw new Error("Error FAQs");
        const data = await response.json();
        console.log("📦 FAQs recibidas:", data);
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("Error FAQs:", err);
        return [];
    }
}



/* =========================
   VERIFICAR ESTADO DEL CHAT
========================= */
async function checkChatStatus() {
    const statusEl = document.getElementById("chat-status");
    const input = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");
    try {
        const response = await fetch(HEALTH_URL);
        console.log("📡 Respuesta fetch:", response);
        if (!response.ok) {
            throw new Error("HTTP Error " + response.status);
        }
        const data = await response.json();
        console.log("📦 Respuesta health:", data);
        // 🟢 ONLINE
        statusEl.textContent = "En línea";
        statusEl.classList.remove("offline");
        statusEl.classList.add("online");

        // 🔥 HABILITAR INPUT
        if (input) input.disabled = false;
        if (sendBtn) sendBtn.disabled = false;

    } catch (err) {

        // 🔴 OFFLINE
        statusEl.textContent = "● Fuera de línea";
        statusEl.classList.remove("online");
        statusEl.classList.add("offline");

        // 🔥 DESHABILITAR INPUT
        if (input) input.disabled = true;
        if (sendBtn) sendBtn.disabled = true;

    }
}


