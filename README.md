# SpringCode Generator - UML Collaborative Tool

A **real-time collaborative UML diagram editor** with **AI Assistant** and **Spring Boot code generation**. Anonymous, registration-free, built with React + TypeScript.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [User Flow](#user-flow)
- [Component Structure](#component-structure)
- [Services](#services)
- [API Reference](#api-reference)
- [WebSocket System](#websocket-system)
- [AI Assistant](#ai-assistant)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)

---

## 🎯 Overview

**SpringCode Generator** enables multiple users to design UML class diagrams collaboratively and generate production-ready Spring Boot code. No registration required—just start designing.

**Stack**: React 19 + TypeScript + Vite + React Flow + Redux Toolkit + WebSocket + AI (GPT)

---

## ✨ Key Features

### 🎨 UML Editor
- Visual drag-and-drop interface (React Flow)
- Classes, Interfaces, Enums with full attribute/method support
- Relationships: Association, Aggregation, Composition, Inheritance, Dependency
- 3 connection handles per side for precise relationships

### 👥 Real-Time Collaboration
- Anonymous sessions (auto-generated nicknames like "CreativeFox247")
- WebSocket synchronization across all users
- Live presence indicators
- Title editing conflict prevention

### 🤖 AI Assistant (Password Protected)
- Context-aware chat about UML, design patterns, Spring Boot
- Natural language commands: "Create a User class with email and password"
- Diagram analysis and recommendations
- Keyboard: `Ctrl+H` (open), `Ctrl+Shift+C` (commands)

### ⚙️ Spring Boot Code Generation
- Complete Maven project: POM, entities, DTOs, repositories, services, controllers
- JPA relationship mappings from UML
- OpenAPI/Swagger documentation
- Lombok annotations
- Spring Boot 2.7.18 + Java 8

---

## 🏗️ Architecture

**Frontend Stack**:
- React 19.1.1, TypeScript 5.8.3, Vite 7.1.2
- React Flow 11.10.1 (diagrams), Redux Toolkit 2.9.0 (state)
- TailwindCSS 4.1.13, Radix UI, Lucide Icons

**Key Patterns**:
1. Anonymous authentication (session-based, no JWT)
2. Single [useWebSocket](cci:1://file:///c:/Users/PC%20Gamer/Desktop/Repositories/react/ficct-springcode-frontend/src/hooks/useWebSocket.ts:54:0-351:2) hook (clean collaboration pattern)
3. Local-first storage (localStorage fallback)
4. Password-protected AI (sessionStorage auth)
5. Service layer pattern

---

## 🚀 User Flow

```
Landing (/) 
  ├─→ Create New Diagram → /editor/:diagramId
  └─→ Browse Public (/browse) → Click → /editor/:diagramId

UML Designer (/editor/:diagramId)
  ├─→ Add Classes/Interfaces/Enums (Toolbar)
  ├─→ Edit via double-click → Modal
  ├─→ Add Relationships (Drag handles)
  ├─→ AI Assistant (Ctrl+H) → Chat/Commands/Code Gen
  ├─→ Real-time sync via WebSocket
  └─→ Save → API + localStorage
```

**Detailed Steps**:
1. **Landing**: Anonymous session created → Display recent diagrams
2. **Create**: `POST /api/diagrams/` → Navigate to `/editor/:id`
3. **Edit**: Load diagram → WebSocket connect → Real-time updates
4. **Collaborate**: Changes broadcast to all users
5. **AI**: Generate elements from text, ask questions
6. **Export**: Download Spring Boot ZIP

---

## 📦 Component Structure

```
App (BrowserRouter + ErrorBoundary)
├── LandingPage (/)
│   ├── Create Button → POST /api/diagrams/
│   └── Recent Diagrams List
├── BrowsePage (/browse)
│   └── Public Diagrams Grid
└── UMLDesignerPageClean (/editor/:id)
    ├── Header (Title Edit, Save, Connection Status)
    └── UMLFlowEditorWithAI
        ├── UMLFlowEditorBase
        │   ├── UMLToolbarSimple (Add Class/Interface/Enum)
        │   ├── ReactFlow
        │   │   ├── Nodes: UMLClassNode, UMLInterfaceNode, UMLEnumNode
        │   │   └── Edges: UMLRelationshipEdge
        │   ├── Modals: UMLClassEditor, CodeGenerator
        │   └── CollaborativeCursors
        └── AIAssistantComplete
            └── ProtectedAIAssistant (Password Gate)
                ├── Chat Tab
                ├── Commands Tab
                └── Code Generation Tab
```

---

## 🔧 Services

### 1. [anonymousSessionService.ts](cci:7://file:///c:/Users/PC%20Gamer/Desktop/Repositories/react/ficct-springcode-frontend/src/services/anonymousSessionService.ts:0:0-0:0)
Manages anonymous sessions (no registration).

```typescript
interface AnonymousSession {
  sessionId: string      // UUID
  nickname: string       // "CreativeFox247"
  createdAt: Date
  diagramIds: string[]
}
```

**Methods**: [getOrCreateSession()](cci:1://file:///c:/Users/PC%20Gamer/Desktop/Repositories/react/ficct-springcode-frontend/src/services/anonymousSessionService.ts:38:2-83:3), [getSessionId()](cci:1://file:///c:/Users/PC%20Gamer/Desktop/Repositories/react/ficct-springcode-frontend/src/services/aiAssistantService.ts:487:2-489:3), [getNickname()](cci:1://file:///c:/Users/PC%20Gamer/Desktop/Repositories/react/ficct-springcode-frontend/src/services/anonymousSessionService.ts:140:2-165:3), [clearSession()](cci:1://file:///c:/Users/PC%20Gamer/Desktop/Repositories/react/ficct-springcode-frontend/src/services/anonymousSessionService.ts:176:2-184:3)  
**Caching**: Aggressive in-memory cache to prevent localStorage spam

### 2. [diagramService.ts](cci:7://file:///c:/Users/PC%20Gamer/Desktop/Repositories/react/ficct-springcode-frontend/src/services/diagramService.ts:0:0-0:0)
CRUD operations for diagrams.

**Endpoints**: `POST/GET/PATCH/DELETE /api/diagrams/`, `GET /api/diagrams/public/`  
**Features**:
- **Debounced auto-save** (2-second delay)
- **localStorage fallback** for offline support
- **UUID validation** for backend compatibility

### 3. [aiAssistantService.ts](cci:7://file:///c:/Users/PC%20Gamer/Desktop/Repositories/react/ficct-springcode-frontend/src/services/aiAssistantService.ts:0:0-0:0)
AI-powered assistance with rate limiting.

**Endpoints**: `/ask/`, `/ask-about-diagram/:id/`, `/analyze/:id/`, `/generate-elements/`  
**Features**:
- Password protection (sessionStorage)
- 5-minute response cache
- 30 requests/hour limit

### 4. [simpleCodeGenerator.ts](cci:7://file:///c:/Users/PC%20Gamer/Desktop/Repositories/react/ficct-springcode-frontend/src/services/simpleCodeGenerator.ts:0:0-0:0)
Generates Spring Boot projects from UML.

**Generates**:
- `pom.xml`, `Application.java`, `application.properties`
- Entities with JPA annotations
- DTOs, Repositories, Services, Controllers
- OpenAPI configuration

**Relationship Mapping**:
- Association → `@OneToOne`
- Aggregation → `@OneToMany(mappedBy)`
- Composition → `@OneToMany(cascade=ALL, orphanRemoval=true)`
- Dependency → `@ManyToOne`

### 5. [anonymousApiClient.ts](cci:7://file:///c:/Users/PC%20Gamer/Desktop/Repositories/react/ficct-springcode-frontend/src/c:/Users/PC%20Gamer/Desktop/Repositories/react/ficct-springcode-frontend/src/services/anonymousApiClient.ts:0:0-0:0)
HTTP client for backend API.

**Features**: Session-based auth, error handling, timeout management

---

## 🌐 API Reference

### Diagrams
```
POST   /api/diagrams/                 Create
GET    /api/diagrams/:id/             Get by ID
PATCH  /api/diagrams/:id/             Update
DELETE /api/diagrams/:id/             Delete
GET    /api/diagrams/                 List (filtered by session)
GET    /api/diagrams/public/          Public list
```

### AI Assistant
```
POST /api/ai-assistant/ask/                     General question
POST /api/ai-assistant/ask-about-diagram/:id/   Diagram context
POST /api/ai-assistant/analyze/:id/             Diagram analysis
POST /api/ai-assistant/generate-elements/       Text to UML
```

### Configuration
```typescript
// src/config/environment.ts
VITE_API_BASE_URL=http://localhost
VITE_API_WS_URL=ws://localhost:8001
```

---

## 🔌 WebSocket System

**Hook**: [src/hooks/useWebSocket.ts](cci:7://file:///c:/Users/PC%20Gamer/Desktop/Repositories/react/ficct-springcode-frontend/src/hooks/useWebSocket.ts:0:0-0:0)

**URL Pattern**: `ws://localhost:8001/ws/diagrams/{diagramId}/{sessionId}/`

**Message Types**:
- `node_update`, `edge_update`, `diagram_change`, `title_changed`
- `user_joined`, `user_left`, `chat_message`, `typing_indicator`

**Echo Prevention**:
```typescript
const messageHash = `${type}_${sessionId}_${timestamp}`
if (receivedMessages.has(messageHash)) return  // Skip duplicates
if (message.sessionId === currentSessionId) return  // Skip self
```

**Reconnection**: Exponential backoff (1s, 2s, 4s, 8s, 16s), max 5 attempts

**Title Conflict Prevention**:
```typescript
const [isEditingName, setIsEditingName] = useState(false)
onTitleChange: (title) => {
  if (!isEditingName) setDiagramName(title)  // Only update when not editing
}
```
---

## 🤖 AI Assistant

**Authentication**: Password-protected via sessionStorage  
**Session**: 24 hours after authentication  
**Rate Limit**: 30 requests/hour

### Features

**1. Chat Tab**: Ask questions about UML, design patterns, Spring Boot
```typescript
aiAssistantService.askQuestion("What is the Repository pattern?")
```

**2. Commands Tab**: Generate UML from natural language
```
Input: "Create a User class with id, name, email, password"
Output: UMLClassNode with 4 attributes added to canvas
```

**3. Code Generation Tab**: Configure and download Spring Boot project

### Diagram Analysis
AI analyzes:
- Design patterns (Factory, Singleton, Observer)
- SOLID principles violations
- Naming conventions
- Relationship quality
- Code smells (God classes, circular dependencies)

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API running (for full features)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd ficct-springcode-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Development Server**: `http://localhost:5173`

### Available Scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Environment Variables

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost
VITE_API_WS_URL=ws://localhost:8001
VITE_API_TIMEOUT=10000
VITE_AI_FEATURES_ENABLED=true
```

---

## 📁 Project Structure

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Router + ErrorBoundary
├── index.css                   # Global styles
├── components/
│   ├── ai-assistant/          # AI chat & commands (10 files)
│   ├── browse/                # Public diagrams page
│   ├── chat/                  # Collaboration chat
│   ├── collaboration/         # ActiveUsers, CollaborativeCursor
│   ├── landing/               # Landing page
│   ├── test/                  # WebSocket test component
│   ├── ui/                    # Reusable UI (Button, Card, Input, etc.)
│   └── uml-flow/              # React Flow editor (20 files)
│       ├── nodes/             # UMLClassNode, UMLInterfaceNode, UMLEnumNode
│       ├── edges/             # UMLRelationshipEdge
│       ├── panels/            # Property editors
│       ├── modals/            # UMLClassEditor
│       └── UMLFlowEditorWithAI.tsx
├── config/
│   └── environment.ts         # Environment configuration
├── contexts/                  # React contexts (if any)
├── hooks/
│   ├── useWebSocket.ts        # Clean WebSocket hook ⭐
│   ├── useAIAuthentication.ts # AI password protection
│   ├── useMediaQuery.ts       # Responsive design
│   └── redux.ts               # Redux hooks
├── pages/
│   └── UMLDesignerPageClean.tsx  # Main editor page ⭐
├── services/
│   ├── anonymousSessionService.ts  # Session management ⭐
│   ├── diagramService.ts           # Diagram CRUD ⭐
│   ├── aiAssistantService.ts       # AI integration ⭐
│   ├── simpleCodeGenerator.ts      # Code generation ⭐
│   ├── anonymousApiClient.ts       # HTTP client
│   ├── anonymousWebSocketService.ts # (Legacy - use useWebSocket hook)
│   ├── umlCollaborationService.ts   # (Legacy - use useWebSocket hook)
│   ├── downloadService.ts          # File downloads
│   └── errorService.ts             # Global error handling
├── store/
│   ├── index.ts               # Redux store
│   ├── api/                   # RTK Query APIs
│   └── slices/                # Redux slices
├── types/
│   ├── uml.ts                 # UML type definitions
│   ├── aiAssistant.ts         # AI types
│   ├── codeGeneration.ts      # Code gen types
│   └── collaboration.ts       # Collab types
└── utils/
    ├── dateUtils.ts           # Date formatting
    └── (other utilities)
```

**⭐ = Core files for understanding the application**

---

## 🔑 Key Technical Details

### Unused/Legacy Files
These files exist but are **NOT actively used** (can be removed):
- `src/services/anonymousWebSocketService.ts` → Replaced by [useWebSocket](cci:1://file:///c:/Users/PC%20Gamer/Desktop/Repositories/react/ficct-springcode-frontend/src/hooks/useWebSocket.ts:54:0-351:2) hook
- `src/services/umlCollaborationService.ts` → Replaced by [useWebSocket](cci:1://file:///c:/Users/PC%20Gamer/Desktop/Repositories/react/ficct-springcode-frontend/src/hooks/useWebSocket.ts:54:0-351:2) hook
- `src/pages/UMLDesignerPageNew.tsx` → Replaced by [UMLDesignerPageClean.tsx](cci:7://file:///c:/Users/PC%20Gamer/Desktop/Repositories/react/ficct-springcode-frontend/src/pages/UMLDesignerPageClean.tsx:0:0-0:0)
- Commented routes in [App.tsx](cci:7://file:///c:/Users/PC%20Gamer/Desktop/Repositories/react/ficct-springcode-frontend/src/App.tsx:0:0-0:0) (DiagramEditor, WebSocketTest)

### State Management
**Redux Toolkit** with RTK Query:
```typescript
store/
├── api/
│   ├── umlApi.ts            # Diagram endpoints
│   ├── collaborationApi.ts  # Collaboration features
│   └── generationApi.ts     # Code generation
└── slices/
    └── uiSlice.ts           # UI state (modals, panels)
```

### Offline Support
- **localStorage** caching for diagrams
- Fallback when API unavailable
- Auto-sync when connection restored

### Performance Optimizations
- Message deduplication (prevents WebSocket loops)
- Debounced auto-save (2s delay)
- Aggressive session caching (reduces localStorage reads by 95%)
- React Flow static node/edge types (prevents recreations)

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
# Output: dist/ folder
```

### Environment Configuration

**Production `.env`**:
```env
VITE_API_BASE_URL=https://api.springcode.com
VITE_API_WS_URL=wss://ws.springcode.com:8001
VITE_APP_ENV=production
```

### Deploy to Vercel/Netlify

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

---

## 📝 Usage Examples

### Creating a Diagram Programmatically

```typescript
import { diagramService } from '@/services/diagramService'

const diagram = await diagramService.createDiagram({
  title: 'My System',
  diagram_type: 'CLASS',
  content: {
    nodes: [
      {
        id: '1',
        type: 'classNode',
        position: { x: 100, y: 100 },
        data: {
          label: 'User',
          attributes: [
            { name: 'id', type: 'Long', visibility: 'private' }
          ]
        }
      }
    ],
    edges: []
  }
})
```

### Using WebSocket Hook

```typescript
const { isConnected, sendMessage } = useWebSocket({
  diagramId,
  onNodesChange: (nodes) => setNodes(nodes),
  onEdgesChange: (edges) => setEdges(edges),
  onUserJoined: (user) => console.log(`${user.nickname} joined`)
})

// Send custom message
sendMessage('chat_message', { content: 'Hello!', user: nickname })
```

### AI Assistant Query

```typescript
const response = await aiAssistantService.askAboutDiagram(
  "How can I improve this design?",
  diagramId,
  { nodes: currentNodes, edges: currentEdges }
)
console.log(response.answer)
```

---

## 🐛 Troubleshooting

### WebSocket Connection Fails
- Check `VITE_API_WS_URL` in `.env`
- Verify backend is running on correct port (8001 for ASGI)
- URL pattern must be: `ws://localhost:8001/ws/diagrams/{id}/{sessionId}/`

### AI Assistant Not Working
- Check password authentication
- Verify sessionStorage: `ai_authenticated === 'true'`
- Check rate limit (30 requests/hour)

### Diagram Not Saving
- Check browser console for API errors
- Verify `diagram_data` structure (must have `nodes` and `edges` arrays)
- Check localStorage fallback: `localStorage.getItem('diagram_${id}')`

---

## 📚 Additional Resources

- **React Flow Docs**: https://reactflow.dev
- **Redux Toolkit**: https://redux-toolkit.js.org
- **Spring Boot**: https://spring.io/projects/spring-boot
- **SpringDoc OpenAPI**: https://springdoc.org

---