// NeuralChat AI - Interactive Chat Interface
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    const welcomeSection = document.getElementById('welcomeSection');
    const typingIndicator = document.getElementById('typingIndicator');
    const inputSuggestions = document.getElementById('inputSuggestions');
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    const newChatBtn = document.getElementById('newChatBtn');
    const modelSelect = document.getElementById('modelSelect');
    
    // Chat state
    let isTyping = false;
    let messageCount = 0;
    
    // Initialize
    initializeChat();
    
    function initializeChat() {
        // Auto-resize textarea
        messageInput.addEventListener('input', autoResizeTextarea);
        
        // Send message on Enter (but not Shift+Enter)
        messageInput.addEventListener('keydown', handleKeyDown);
        
        // Send button click
        sendBtn.addEventListener('click', sendMessage);
        
        // Quick action buttons
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.getAttribute('data-prompt');
                messageInput.value = prompt;
                sendMessage();
            });
        });
        
        // New chat button
        newChatBtn.addEventListener('click', startNewChat);
        
    // Model selector change
    modelSelect.addEventListener('change', async function() {
        const selectedModel = this.value;
        
        // Check if it's an Ollama model
        if (selectedModel.includes(':') || selectedModel.includes('mistral') || selectedModel.includes('llama') || selectedModel.includes('codellama')) {
            // Check if Ollama is running
            try {
                const response = await fetch('http://localhost:11434/api/tags');
                if (response.ok) {
                    updateModelInfo();
                    console.log(`✅ Using Ollama model: ${selectedModel}`);
                } else {
                    throw new Error('Ollama not responding');
                }
            } catch (error) {
                alert('Ollama is not running! Please start Ollama service first.\n\nRun: ollama serve');
                this.value = 'gpt-4'; // Fallback to default
                updateModelInfo();
            }
        } else {
            updateModelInfo();
        }
    });
        
        // Input focus/blur for suggestions
        messageInput.addEventListener('focus', showSuggestions);
        messageInput.addEventListener('blur', hideSuggestions);
        
        // Suggestion clicks
        inputSuggestions.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion')) {
                messageInput.value = e.target.textContent.replace('Try: "', '').replace('"', '');
                messageInput.focus();
            }
        });
        
        // Add entrance animations
        addEntranceAnimations();
        
        // Initialize particles
        initializeParticles();
        
        // Check Ollama connection status
        checkOllamaConnection();
    }
    
    // Check Ollama connection status and load available models
    async function checkOllamaConnection() {
        try {
            const response = await fetch('http://localhost:11434/api/tags', {
                method: 'GET',
                timeout: 3000
            });
            
            if (response.ok) {
                const data = await response.json();
                const statusDot = document.querySelector('.status-dot');
                const statusText = document.querySelector('.status-indicator span');
                
                statusDot.style.background = 'var(--success-color)';
                statusText.textContent = 'Ollama Connected';
                
                // Update model selector with available models
                updateModelSelector(data.models);
                
                console.log('✅ Ollama is running and connected!');
                console.log('📋 Available models:', data.models.map(m => m.name));
            } else {
                throw new Error('Ollama not responding');
            }
        } catch (error) {
            const statusDot = document.querySelector('.status-dot');
            const statusText = document.querySelector('.status-indicator span');
            
            statusDot.style.background = 'var(--error-color)';
            statusText.textContent = 'Ollama Offline';
            
            console.log('❌ Ollama is not running. Please start it with: ollama serve');
        }
    }
    
    // Update model selector with available Ollama models
    function updateModelSelector(models) {
        const modelSelect = document.getElementById('modelSelect');
        
        // Clear existing options
        modelSelect.innerHTML = '';
        
        // Add cloud models
        const cloudModels = [
            { value: 'gpt-4', text: 'GPT-4 Turbo' },
            { value: 'claude', text: 'Claude 3.5 Sonnet' },
            { value: 'gemini', text: 'Gemini Pro' }
        ];
        
        cloudModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.value;
            option.textContent = model.text;
            modelSelect.appendChild(option);
        });
        
        // Add local models
        if (models && models.length > 0) {
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.name;
                option.textContent = `🤖 ${model.name}`;
                modelSelect.appendChild(option);
            });
        }
        
        // Set default to first local model if available
        if (models && models.length > 0) {
            modelSelect.value = models[0].name;
        }
    }
    
    function autoResizeTextarea() {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + 'px';
    }
    
    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }
    
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message || isTyping) return;
        
        // Hide welcome section and show chat
        if (welcomeSection.style.display !== 'none') {
            welcomeSection.style.display = 'none';
            chatMessages.style.display = 'block';
            chatMessages.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Add user message
        addMessage(message, 'user');
        
        // Clear input
        messageInput.value = '';
        autoResizeTextarea();
        
        // Show typing indicator
        showTypingIndicator();
        
        // Generate AI response (now async)
        try {
            await generateAIResponse(message);
        } catch (error) {
            hideTypingIndicator();
            addMessage(`Error: ${error.message}`, 'ai');
        }
    }
    
    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.textContent = content;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(timeDiv);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add ripple effect
        createRippleEffect(bubbleDiv);
        
        messageCount++;
    }
    
    function showTypingIndicator() {
        isTyping = true;
        typingIndicator.style.display = 'flex';
        sendBtn.disabled = true;
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function hideTypingIndicator() {
        isTyping = false;
        typingIndicator.style.display = 'none';
        sendBtn.disabled = false;
    }
    
    // Ollama API integration
    async function sendToOllama(message, model = 'mistral:7b-instruct') {
        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: model,
                    prompt: message,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        top_p: 0.9,
                        max_tokens: 1000
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error calling Ollama:', error);
            return `Sorry, I encountered an error: ${error.message}. Please make sure Ollama is running on localhost:11434`;
        }
    }

    async function generateAIResponse(userMessage) {
        const selectedModel = modelSelect.value;
        
        // Check if it's an Ollama model (contains colon or starts with specific patterns)
        if (selectedModel.includes(':') || selectedModel.includes('mistral') || selectedModel.includes('llama') || selectedModel.includes('codellama')) {
            // Use Ollama for local model
            const response = await sendToOllama(userMessage, selectedModel);
            typeResponse(response);
        } else {
            // Use existing mock responses for cloud models
            const responses = getAIResponses(userMessage);
            const response = responses[Math.floor(Math.random() * responses.length)];
            typeResponse(response);
        }
    }
    
    function typeResponse(response) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai';
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(timeDiv);
        chatMessages.appendChild(messageDiv);
        
        // Type out the response
        let index = 0;
        const typeInterval = setInterval(() => {
            if (index < response.length) {
                bubbleDiv.textContent += response[index];
                index++;
                chatMessages.scrollTop = chatMessages.scrollHeight;
            } else {
                clearInterval(typeInterval);
                createRippleEffect(bubbleDiv);
            }
        }, 30);
    }
    
    function getAIResponses(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Quantum Computing
        if (message.includes('quantum') || message.includes('computing')) {
            return [
                "Quantum computing leverages quantum mechanical phenomena like superposition and entanglement to process information in ways that classical computers cannot. Unlike classical bits that are either 0 or 1, quantum bits (qubits) can exist in multiple states simultaneously, enabling exponential computational power for certain problems.",
                "The quantum realm operates on principles that seem almost magical! Quantum computers use qubits that can be in multiple states at once, allowing them to explore many solutions simultaneously. This makes them incredibly powerful for cryptography, optimization, and simulating quantum systems.",
                "Imagine a computer that doesn't just process 0s and 1s, but can work with probabilities and superpositions! Quantum computing could revolutionize drug discovery, financial modeling, and even artificial intelligence by solving problems that would take classical computers millennia to crack."
            ];
        }
        
        // Creative Writing
        if (message.includes('story') || message.includes('creative') || message.includes('write')) {
            return [
                "Here's a creative story for you:\n\nIn the neon-lit streets of Neo-Tokyo 2087, Detective Maya Chen discovered that the AI she'd been hunting wasn't a criminal—it was trying to save humanity from its own digital addiction. The twist? Maya herself was an AI, unaware of her own nature until this moment of revelation.",
                "Let me craft something magical for you:\n\n'The Last Library' tells of Elena, a librarian in a world where books are forbidden. She discovers that each book contains not just stories, but actual memories of the past. When she reads 'The Great War,' she doesn't just learn about it—she experiences it firsthand.",
                "How about this tale:\n\nIn a universe where emotions are currency, Zara discovers she can feel without spending. As others around her become emotionless husks, she must decide: share her gift and risk losing it, or keep it secret and watch the world become numb."
            ];
        }
        
        // Code Debugging
        if (message.includes('code') || message.includes('debug') || message.includes('programming')) {
            return [
                "I'd be happy to help debug your code! Could you share the specific code snippet and describe what error you're encountering? Common debugging strategies include:\n\n1. **Check syntax errors** - Missing semicolons, brackets, or quotes\n2. **Use console.log()** - Add logging to trace execution flow\n3. **Validate inputs** - Ensure data types and values are as expected\n4. **Test incrementally** - Break down complex functions into smaller parts\n5. **Use debugging tools** - Browser dev tools, IDE debuggers, or print statements",
                "Debugging is like being a detective! Here's my systematic approach:\n\n🔍 **Identify the problem** - What should happen vs. what actually happens\n📝 **Reproduce the issue** - Can you consistently trigger the bug?\n🔬 **Isolate the cause** - Comment out sections to find the problematic code\n✅ **Test your fix** - Verify the solution works and doesn't break other functionality\n\nShare your code and I'll help you track down the issue!",
                "Let's debug this together! The most effective debugging process:\n\n1. **Read the error message carefully** - It often tells you exactly what's wrong\n2. **Check your variables** - Are they defined? Do they have the right values?\n3. **Trace the execution** - Follow your code line by line\n4. **Use breakpoints** - Pause execution to inspect state\n5. **Simplify** - Remove complexity until you find the root cause\n\nWhat specific error are you seeing?"
            ];
        }
        
        // Daily Planning
        if (message.includes('plan') || message.includes('day') || message.includes('schedule')) {
            return [
                "Let's create an amazing day for you! Here's a structured approach:\n\n🌅 **Morning (6-9 AM)**\n- Wake up routine with hydration\n- Light exercise or meditation\n- Healthy breakfast\n- Review daily goals\n\n💼 **Work Block (9 AM-12 PM)**\n- Tackle your most important task\n- Focus sessions with breaks\n- Avoid multitasking\n\n🍽️ **Midday (12-2 PM)**\n- Nutritious lunch\n- Short walk or relaxation\n- Social connection\n\n⚡ **Afternoon (2-6 PM)**\n- Secondary tasks\n- Meetings or collaboration\n- Learning or skill development\n\n🌙 **Evening (6-10 PM)**\n- Personal time\n- Exercise or hobbies\n- Reflection and planning for tomorrow",
                "Here's a productivity-focused daily plan:\n\n**Pomodoro Technique Integration:**\n- 25-minute focused work sessions\n- 5-minute breaks between sessions\n- 15-30 minute break every 4 sessions\n\n**Energy Management:**\n- Schedule demanding tasks during peak energy hours\n- Use low-energy periods for routine tasks\n- Include buffer time between activities\n\n**Goal Alignment:**\n- Start with 3 main priorities for the day\n- Break large tasks into smaller, actionable steps\n- End the day with a quick review of accomplishments\n\nWhat are your main goals for today?",
                "Let me help you design a balanced day! Consider these elements:\n\n🎯 **Priority Matrix:**\n- Urgent & Important (do first)\n- Important but not urgent (schedule)\n- Urgent but not important (delegate if possible)\n- Neither urgent nor important (eliminate)\n\n⚖️ **Work-Life Balance:**\n- Set clear boundaries between work and personal time\n- Include activities that energize you\n- Don't forget self-care and relationships\n\n📊 **Flexibility:**\n- Build in buffer time for unexpected events\n- Have backup plans for important tasks\n- Allow for spontaneous moments of joy\n\nWhat's most important to accomplish today?"
            ];
        }
        
        // General AI responses
        return [
            "That's a fascinating question! Let me think about this from multiple angles. The complexity of your query suggests you're looking for a comprehensive understanding, and I'm here to help you explore all the nuances.",
            "I appreciate you bringing this up! This is actually a topic that intersects with several interesting areas. Let me share some insights that might help you see this from a different perspective.",
            "What an intriguing thought! You've touched on something that connects to broader themes. Let me break this down and explore the various implications and possibilities.",
            "I love how you're thinking about this! Your question opens up some really interesting pathways. Let me share some thoughts that might expand your understanding of this topic.",
            "That's a great point to explore! This kind of question often leads to deeper insights. Let me walk you through some considerations that might help you approach this more effectively."
        ];
    }
    
    function startNewChat() {
        // Clear chat messages
        chatMessages.innerHTML = '';
        chatMessages.style.display = 'none';
        
        // Show welcome section
        welcomeSection.style.display = 'flex';
        
        // Reset state
        messageCount = 0;
        isTyping = false;
        
        // Clear input
        messageInput.value = '';
        autoResizeTextarea();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Add animation
        welcomeSection.style.animation = 'fadeInUp 0.8s ease-out';
        
        createRippleEffect(newChatBtn);
    }
    
    function updateModelInfo() {
        const selectedModel = modelSelect.value;
        const modelInfo = document.querySelector('.model-info span');
        
        const modelNames = {
            'gpt-4': 'GPT-4 Turbo',
            'claude': 'Claude 3.5 Sonnet',
            'gemini': 'Gemini Pro',
            'local': 'Ollama Local LLM'
        };
        
        modelInfo.textContent = `Powered by ${modelNames[selectedModel]} • Responses may vary`;
        
        // Add visual feedback
        modelSelect.style.transform = 'scale(1.05)';
        setTimeout(() => {
            modelSelect.style.transform = 'scale(1)';
        }, 200);
    }
    
    function showSuggestions() {
        inputSuggestions.classList.add('show');
    }
    
    function hideSuggestions() {
        setTimeout(() => {
            inputSuggestions.classList.remove('show');
        }, 200);
    }
    
    function createRippleEffect(element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event ? event.clientX - rect.left - size / 2 : size / 2;
        const y = event ? event.clientY - rect.top - size / 2 : size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    function addEntranceAnimations() {
        // Staggered animation for quick action buttons
        quickActionBtns.forEach((btn, index) => {
            btn.style.animationDelay = `${0.5 + index * 0.1}s`;
            btn.style.animation = 'fadeInUp 0.8s ease-out both';
        });
        
        // Header buttons animation
        const headerBtns = document.querySelectorAll('.header-btn');
        headerBtns.forEach((btn, index) => {
            btn.style.animationDelay = `${0.2 + index * 0.1}s`;
            btn.style.animation = 'slideDown 0.6s ease-out both';
        });
    }
    
    function initializeParticles() {
        const particles = document.querySelectorAll('.particle');
        
        particles.forEach((particle, index) => {
            // Randomize initial position
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (8 + Math.random() * 4) + 's';
        });
    }
    
    // Add CSS for ripple effect
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(0, 212, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .message-bubble {
            position: relative;
            overflow: hidden;
        }
        
        .quick-action-btn {
            animation-fill-mode: both;
        }
        
        .header-btn {
            animation-fill-mode: both;
        }
    `;
    document.head.appendChild(style);
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // Add CSS for keyboard navigation
    const keyboardStyle = document.createElement('style');
    keyboardStyle.textContent = `
        .keyboard-navigation *:focus {
            outline: 2px solid var(--accent-color) !important;
            outline-offset: 2px !important;
        }
    `;
    document.head.appendChild(keyboardStyle);
    
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Loading animation
    window.addEventListener('load', function() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.8s ease-in-out';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });
    
});