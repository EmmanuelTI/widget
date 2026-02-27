// 1️⃣ Cargar primero la API del chat
// Usamos loadScript para cargar dinámicamente el archivo "chat-api.js"
// Esto permite que el widget solo se inicialice cuando la API esté lista.
loadScript("../widget/js/chat-api.js").then(() => {

    // 2️⃣ Luego cargar el HTML del widget
    // Hacemos un fetch del archivo "chat-widget.html", lo convertimos a texto
    // y lo insertamos al final del body del documento.
    fetch("../widget/chat-widget.html")
        .then(res => res.text())
        .then(html => {
            document.body.insertAdjacentHTML("beforeend", html);
            initChatWidget(); // Inicializamos el widget una vez que el HTML esté cargado
        })
        .catch(err => console.error("Error cargando widget:", err)); // Manejo de errores
});

// 🔹 Función para cargar scripts dinámicamente
// Devuelve una promesa que se resuelve cuando el script se carga correctamente
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script"); // Crear un elemento <script>
        script.src = src; // Asignar la ruta del script
        script.onload = resolve; // Resolver promesa al cargar
        script.onerror = reject; // Rechazar promesa si hay error
        document.head.appendChild(script); // Agregar script al <head>
    });
}
// ===============================
// INIT WIDGET
// ===============================
function initChatWidget() {
    const logo = document.getElementById("chat-logo-button");
    const chat = document.getElementById("chat-widget");
    const close = document.getElementById("close-chat");
    const sendBtn = document.getElementById("send-btn");
    const messageInput = document.getElementById("message-input");
    const chatBody = document.getElementById("chat-body");
      
     checkChatStatus();
    setInterval(checkChatStatus, 15000);
    // 🔓 Abrir chat
    logo.onclick = () => {
        chat.classList.add("open");
        logo.style.display = "none";

        // ✅ CARGAR FAQs AQUÍ (momento correcto)
        loadFAQsIntoChat(sendMessage);
    };

    // ❌ Cerrar chat
    close.onclick = () => {
        chat.classList.remove("open");
        logo.style.display = "block";
    };

    sendBtn.onclick = sendMessage;
 messageInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault(); // 🔥 evita comportamientos raros
        sendMessage();
    }
});

    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;
        

        if (messageInput.disabled) {
    addBotMessage("⚠️ El servicio no está disponible en este momento.");
    return; 
}


        addUserMessage(message);
        messageInput.value = "";

        const id = addBotMessage("...");
        const response = await sendMessageToAPI(message);
        updateBotMessage(id, response);
    }

    function addUserMessage(text) {
        chatBody.insertAdjacentHTML("beforeend", `
            <div class="message user">
                <div class="message-content">
                    <div class="message-text">${escapeHTML(text)}</div>
                    <div class="message-time">Ahora</div>
                </div>
            </div>
        `);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function addBotMessage(text) {
        const id = "bot-" + Date.now();
        chatBody.insertAdjacentHTML("beforeend", `
            <div class="message bot" id="${id}">
                <div class="message-content">
                    <div class="message-text">${text}</div>
                    <div class="message-time">Ahora</div>
                </div>
            </div>
        `);
        chatBody.scrollTop = chatBody.scrollHeight;
        return id;
    }

    function updateBotMessage(id, text) {
        const el = document.getElementById(id);
        if (el) el.querySelector(".message-text").innerText = text;
    }
}

// ===============================
// FAQs
// ===============================
// ===============================
// FAQs - JS SOLO INSERTA PREGUNTAS (SIN ESTILOS)
// ===============================
async function loadFAQsIntoChat(sendMessage) {
    const questionsContainer = document.getElementById("faq-questions-container");
    if (!questionsContainer) return;

    questionsContainer.innerHTML = "";

    const faqs = await getActiveFaqs();
    if (!faqs || faqs.length === 0) return;

    faqs.forEach((faq) => {
        // CREAR SOLO LA ESTRUCTURA BÁSICA
        const faqItem = document.createElement("div");
        faqItem.className = "faq-item";  // ← LA MAGIA ESTÁ AQUÍ
        
        const questionText = document.createElement("span");
        questionText.textContent = faq.question;
        
        faqItem.appendChild(questionText);
        
        // Evento click
        faqItem.addEventListener("click", () => {
            const input = document.getElementById("message-input");
            if (input) {
                input.value = faq.question;
                sendMessage();
                input.focus();
            }
        });
        
        questionsContainer.appendChild(faqItem);
    });
}

// ===============================
// HELPERS
// ===============================
function escapeHTML(str) {
    return str.replace(/[&<>"']/g, m => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[m]));
}

