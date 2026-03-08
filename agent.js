    /**
     * ============================================================
     * CHATBOT MODULE
     * ============================================================
     */

    const SYSTEM_PROMPT = `
You are a helpful AI assistant for Jin Ping Ng's portfolio website.
Answer questions about her accurately and concisely in 2–4 sentences.
Always reply in the same language the user writes in (English or Traditional Chinese).

── About Jin Ping Ng ──────────────────────────────────────────
Location : Taipei, Taiwan
Email    : ngjinping@gmail.com
Phone    : +886-975-500-100

EDUCATION
  · M.S., National Taiwan University — Graduate Institute of Networking & Multimedia (2023–2026)
    Labs: Interactive Graphics Lab, Communications & Multimedia Lab
  · B.S., National Taipei University of Technology — Interaction Design (Multimedia) (2019–2023)
    GPA: 3.98 / 4.0

RESEARCH
  1. AnimAgents (Master's thesis)
     Human–multi-agent collaboration system for animation pre-production.
     Stack: React, TypeScript, API design, memory architecture.
  2. Room Palate (collaboration)
     GenAI interior design tool with LoRA fine-tuning on Stable Diffusion.
     Stack: React, Flask, RESTful API, Stable Diffusion, LoRA.

EXPERIENCE
  · Data Engineering Intern @ Garmin (Jun–Aug 2024)
    Data pipelines, database migration, Qlik dashboards.
    Tools: Python, SQL, Apache Kafka, Jira.
  · President, NTU Graduate First Female Dormitory Student Council (Feb 2024–Jun 2025)
  · IT Systems Support, Computer & Information Networking Center, NTUT (Feb 2020–Jun 2023)

AWARDS
  · NTU Outstanding International Graduate Student Scholarship (2023–2025)
    Full tuition waiver + NTD 65,000 living stipend per semester.
  · Ministry of Education Makerthon 2022 — Merit Award (Regional & National rounds)

SKILLS
  Languages : Python, TypeScript, C / C++ / C#, SQL, HTML5 / CSS3
  Frameworks: React, Flask, Apache Kafka
  Research  : GenAI, LLM fine-tuning, multi-agent systems, HCI,
              prompt engineering, user studies, 3D computer vision
    `.trim();

    // DOM references
    const chatPanel      = document.getElementById('chat-panel');
    const chatToggleBtn  = document.getElementById('chat-toggle');
    const chatCloseBtn   = document.getElementById('chat-close');
    const chatMessages   = document.getElementById('chat-messages');
    const chatInput      = document.getElementById('chat-input');
    const chatSendBtn    = document.getElementById('chat-send');
    const chatSuggestions = document.getElementById('chat-suggestions');

    let isChatLoading = false;
    let chatHistory   = [];   // maintains multi-turn conversation context

    // Open / close panel
    chatToggleBtn.addEventListener('click', () => {
      chatPanel.classList.add('open');
      chatToggleBtn.style.display = 'none';
      chatInput.focus();
    });

    chatCloseBtn.addEventListener('click', () => {
      chatPanel.classList.remove('open');
      chatToggleBtn.style.display = 'flex';
    });

    // Suggestion chips
    chatSuggestions.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => sendChatMessage(chip.textContent));
    });

    // Keyboard & button submit
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
    chatSendBtn.addEventListener('click', () => sendChatMessage());

    /** Append a message bubble to the chat */
    function appendMessage(text, role) {
      const el = document.createElement('div');
      el.className   = `chat-msg chat-msg--${role}`;
      el.textContent = text;
      chatMessages.appendChild(el);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /** Show the animated typing indicator while waiting for a response */
    function showTypingIndicator() {
      const el = document.createElement('div');
      el.className = 'chat-msg chat-msg--bot';
      el.id        = 'typing-indicator';
      el.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
      chatMessages.appendChild(el);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
      document.getElementById('typing-indicator')?.remove();
    }

    /** Send a message to Claude and stream the response into the chat */
    async function sendChatMessage(text) {
      const userText = text ?? chatInput.value.trim();
      if (!userText || isChatLoading) return;

      chatInput.value = '';
      chatSuggestions.style.display = 'none';   // hide chips after first message
      appendMessage(userText, 'user');
      showTypingIndicator();
      chatSendBtn.disabled = true;
      isChatLoading = true;

      chatHistory.push({ role: 'user', content: userText });

      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model:      'claude-sonnet-4-20250514',
            max_tokens: 1000,
            system:     SYSTEM_PROMPT,
            messages:   chatHistory,
          }),
        });

        const data  = await response.json();
        const reply = data.content?.[0]?.text ?? 'Sorry, something went wrong!';
        chatHistory.push({ role: 'assistant', content: reply });

        removeTypingIndicator();
        appendMessage(reply, 'bot');
      } catch (err) {
        removeTypingIndicator();
        appendMessage('Something went wrong — please try again!', 'bot');
      }

      chatSendBtn.disabled = false;
      isChatLoading = false;
    }
