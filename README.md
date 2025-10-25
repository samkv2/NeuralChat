# NeuralChat AI

A modern, responsive web-based chat interface for local Large Language Models (LLMs) powered by Ollama. Features a sleek glassmorphism design with neural network animations and real-time AI conversations.

## 🚀 Features

- **Local LLM Integration**: Seamlessly connects to Ollama for private, offline AI conversations
- **Modern UI/UX**: Glassmorphism design with neural network background animations
- **Real-time Chat**: Live typing indicators and smooth message animations
- **Model Management**: Dynamic model detection and switching between different LLMs
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Privacy-First**: All conversations happen locally on your machine

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI Backend**: Ollama (Local LLM Runtime)
- **Design**: Glassmorphism, CSS Grid/Flexbox, CSS Animations
- **Architecture**: Client-side SPA with RESTful API integration

## 📋 Prerequisites

- Ollama installed and running
- Modern web browser with JavaScript enabled
- Local web server (Python, Node.js, or Live Server)

## 🚀 Quick Start

1. **Install Ollama**:
   ```bash
   # Download from https://ollama.ai/download
   ollama serve
   ollama pull mistral:7b-instruct
   ```

2. **Start Local Server**:
   ```bash
   python -m http.server 8000
   # Or: npx http-server -p 8000
   ```

3. **Open Application**:
   Navigate to `http://localhost:8000` in your browser

4. **Start Chatting**:
   Select your preferred model and begin conversing with your local AI!

## 📁 Project Structure

```
NeuralChat/
├── index.html          # Main application interface
├── styles.css          # Glassmorphism styling and animations
├── script.js           # Chat logic and Ollama integration
├── test-ollama.html    # Connection testing utility
├── instructions.txt    # Detailed setup guide
└── README.md           # This file
```

## 🎨 Design Features

- **Neural Network Background**: Animated nodes and connections
- **Glassmorphism Effects**: Translucent cards with backdrop blur
- **Gradient Animations**: Dynamic color transitions
- **Floating Particles**: Subtle ambient effects
- **Smooth Transitions**: Fluid animations throughout the interface

## 🔧 Configuration

The application automatically detects available Ollama models and populates the model selector. Supported model formats:
- `mistral:7b-instruct`
- `llama2:7b`
- `codellama:7b`
- Any Ollama-compatible model

## 🌐 Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📝 License

MIT License - Feel free to use, modify, and distribute.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

---

**Built with ❤️ for the AI community**
