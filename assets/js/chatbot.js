/* Chatbot Logic */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Create HTML Structure
    const chatbotHTML = `
        <div class="chatbot-wrapper">
            <div class="chat-bubble" id="chat-bubble">
                <i class="fa-solid fa-comments"></i>
            </div>
            <div class="chat-window" id="chat-window">
                <div class="chat-header">
                    <i class="fa-solid fa-robot"></i>
                    <div>
                        <div style="font-weight: 700; font-size: 14px;">Asistente jvargas</div>
                        <div style="font-size: 11px; opacity: 0.8;">En línea ahora</div>
                    </div>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="message bot">¡Hola! Soy el asistente virtual de <b>jvargas</b>. ¿En qué puedo ayudarte hoy? ¿Estás buscando alguna propiedad en especial?</div>
                </div>
                <div class="chat-input-area">
                    <input type="text" class="chat-input" id="chat-input" placeholder="Escribe tu consulta...">
                    <button class="chat-send-btn" id="chat-send">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    const bubble = document.getElementById('chat-bubble');
    const window = document.getElementById('chat-window');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const messagesContainer = document.getElementById('chat-messages');

    // Generate or get Session ID for Rate Limiting
    let sessionId = localStorage.getItem('chatSessionId');
    if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('chatSessionId', sessionId);
    }

    let history = []; // Memory for the AI

    // Toggle Chat
    bubble.addEventListener('click', () => {
        window.classList.toggle('active');
        if (window.classList.contains('active')) {
            input.focus();
        }
    });

    // Send Message
    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        // Add User Message to UI
        appendMessage('user', text);
        input.value = '';

        // Add loading state
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot typing';
        loadingDiv.innerText = 'Consultando catálogo...';
        messagesContainer.appendChild(loadingDiv);
        scrollToBottom();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mensaje: text,
                    historial: history,
                    sessionId: sessionId
                })
            });

            const data = await response.json();
            loadingDiv.remove();

            if (data.respuesta) {
                appendMessage('bot', data.respuesta);

                // Update History (Memory)
                // Gemini format: { role: 'user'|'model', parts: [{ text: '...' }] }
                history.push({ role: 'user', parts: [{ text: text }] });
                history.push({ role: 'model', parts: [{ text: data.respuesta }] });
            } else {
                appendMessage('bot', 'Lo siento, tuve un problema al procesar tu consulta. Intenta de nuevo.');
            }
        } catch (error) {
            loadingDiv.remove();
            appendMessage('bot', 'Error de conexión con el servidor del chatbot.');
        }
    }

    function appendMessage(role, text) {
        const msg = document.createElement('div');
        msg.className = `message ${role}`;

        // Basic Markdown Bold to HTML
        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // **negrita**
            .replace(/__(.*?)__/g, '<b>$1</b>')     // __negrita__
            .replace(/\n/g, '<br>');                // saltos de línea

        msg.innerHTML = formattedText;
        messagesContainer.appendChild(msg);
        scrollToBottom();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
