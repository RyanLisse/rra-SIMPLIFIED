# 🚀 GPT-5-mini Chat Application with Advanced Features

A cutting-edge chat application featuring the hypothetical **GPT-5-mini model** (August 2025) with advanced reasoning capabilities, source citations, and comprehensive chat history management.

## ✨ Key Features

### 🧠 **GPT-5-mini Integration**
- **August 2025 Model**: Configured for the latest GPT-5-mini with fallback to GPT-4o
- **Three Reasoning Modes**:
  - ⚡ **Light**: Quick responses with basic logic
  - 🧠 **Medium**: Balanced analysis and creativity
  - ✨ **Deep**: Comprehensive problem-solving with detailed reasoning

### 📚 **Advanced UI Components**
- **Reasoning Display**: Collapsible reasoning process using AI elements
- **Source Citations**: Automatic source generation and display with relevance scores
- **Chat History**: Full conversation persistence with local storage
- **Session Management**: Create, delete, search, and switch between chat sessions
- **Export/Import**: Download and restore chat history as JSON

### 🎨 **Modern Interface**
- **Three Chat Modes**:
  - GPT-5 Enhanced (with history & sources)
  - Standard Enhanced Chat
  - Legacy Tools Mode
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Mode Support**: Automatic theme switching
- **Beautiful Animations**: Smooth transitions and loading states

## 🚦 Quick Start

### Prerequisites
```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash
```

### Installation
```bash
# Clone the repository
git clone <your-repo>
cd <your-repo>

# Install dependencies with Bun
bun install

# Copy environment variables
cp .env.example .env.local
```

### Configuration
```env
# .env.local
OPENAI_API_KEY=your_openai_api_key_here
USE_GPT5=false  # Set to true when GPT-5 is available (August 2025)
```

### Development
```bash
# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

## 🏗️ Architecture

### Technology Stack
- **Framework**: Next.js 15.4.6 with React 19
- **Runtime**: Bun for ultra-fast performance
- **Styling**: Tailwind CSS with shadcn/ui
- **AI SDK**: Vercel AI SDK with streaming support
- **State Management**: Zustand with persistence
- **Components**: Custom AI elements for enhanced UX

### Project Structure
```
├── app/
│   ├── api/
│   │   └── chat/          # GPT-5 chat endpoint
│   └── page.tsx           # Main application
├── components/
│   ├── ai-elements/       # AI-specific components
│   │   ├── reasoning.tsx  # Reasoning display
│   │   ├── source.tsx     # Source citations
│   │   └── response.tsx   # Formatted responses
│   ├── gpt5-chat-enhanced.tsx  # Main GPT-5 chat
│   └── chat-history-sidebar.tsx # History management
├── stores/
│   └── useChatHistoryStore.ts  # Chat persistence
└── lib/
    └── utils.ts           # Utility functions
```

## 🎯 Features in Detail

### Reasoning Display
The reasoning component shows the AI's thought process:
- Collapsible interface for easy viewing
- Color-coded by reasoning level
- Real-time streaming support
- Clear step-by-step breakdown

### Source Management
Automatic source citations with:
- Relevance scoring (0-100%)
- Visual relevance indicators
- Clickable source links
- Inline citation support

### Chat History
Comprehensive history management:
- **Persistent Storage**: All chats saved locally
- **Search**: Find conversations by content
- **Export/Import**: Backup and restore chats
- **Session Info**: Timestamps, message count, model info
- **Quick Access**: Collapsible sidebar with instant switching

### Model Configuration
Flexible model settings:
- Toggle reasoning on/off
- Select reasoning depth
- Show/hide reasoning process
- Show/hide source citations
- Real-time configuration changes

## 🔧 API Endpoints

### `/api/chat`
Main chat endpoint supporting:
```typescript
POST /api/chat
{
  messages: Message[],
  useReasoning: boolean,
  reasoningLevel: 'light' | 'medium' | 'deep'
}
```

## 💾 Data Persistence

Chat history is stored in browser's localStorage with:
- Automatic saving on each message
- Session management
- Export to JSON format
- Import from backup files
- Maximum 50 sessions retained

## 🎨 UI Components

### AI Elements Used
- `<Message>` - Message container with role styling
- `<Reasoning>` - Collapsible reasoning display
- `<Source>` - Citation component with metadata
- `<Response>` - Markdown-formatted AI responses
- `<InlineCitation>` - Inline source references

### Custom Components
- `<ChatHistorySidebar>` - Full history management
- `<GPT5ChatEnhanced>` - Main chat interface
- `<ModelSettings>` - Configuration controls

## 🚀 Performance

### Optimizations
- **Bun Runtime**: 10x faster package installation
- **Streaming Responses**: Real-time AI output
- **Lazy Loading**: Components loaded on demand
- **Local Storage**: Instant session switching
- **Optimized Rendering**: Virtual scrolling for long chats

## 📝 Future Enhancements

When GPT-5 becomes available (August 2025):
1. Enable `USE_GPT5=true` in environment
2. Access native reasoning capabilities
3. Utilize extended context windows
4. Leverage multimodal features
5. Enhanced tool calling support

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- OpenAI for GPT models
- Vercel for AI SDK
- shadcn for UI components
- Bun for blazing-fast runtime

---

**Note**: GPT-5-mini is a hypothetical model for demonstration. The application currently uses GPT-4o with simulated GPT-5 features and will seamlessly upgrade when GPT-5 becomes available.