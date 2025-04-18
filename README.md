# Freestyle Execute Chat

<div align="center">
  <img src="app/public/logo.svg" width="120" height="120" alt="Freestyle Execute Chat Logo" />
  <h1>Freestyle Execute Chat</h1>
  <p>An AI assistant that truly assists - with real-world capabilities</p>
</div>

## 🔍 Vision

Freestyle Execute Chat represents a new vision for AI assistants - one where they don't just talk about doing things, but can actually take action on your behalf. Unlike traditional chatbots that are limited to conversation, this assistant can:

- Execute code to solve problems in real-time
- Connect to your services and tools through extensible modules
- Perform complex workflows spanning multiple systems
- Adapt to your specific needs through customization

The core philosophy is simple: **an assistant should assist**, not just converse. By giving our AI the ability to execute code and interact with external systems, we bridge the gap between conversation and action.

Freestyle Chat is a jack of all trades, master of none chat assistant. We believe there is an incredible opportunity for people (like you) to fork it, focus on a single vertical, and master them. We encourage you to steal our code and make it your own and we're here to help you do that.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [PostgreSQL](https://www.postgresql.org/) database (or a Neon.tech account)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/freestyle-execute-chat.git
   cd freestyle-execute-chat
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   # Anthropic API key for Claude
   ANTHROPIC_API_KEY=your_anthropic_api_key

   # Database connection string
   DATABASE_URL=your_postgres_or_neon_connection_string

   # Freestyle API key for code execution
   FREESTYLE_API_KEY=your_freestyle_api_key

   # Stack Auth (for authentication)
   NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_publishable_key
   STACK_SECRET_SERVER_KEY=your_stack_secret_key
   ```

4. Run the development server:

   ```bash
   cd app
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to see the application.

### Database Setup

The project uses Drizzle ORM with PostgreSQL. To initialize the database:

```bash
pnpm dlx drizzle-kit push
```

## ✨ Key Capabilities

- 💻 **Real Code Execution** - The assistant can write and run code directly in the chat to process data, create visualizations, or solve computational problems
- 🧩 **Extensible Module System** - Connect the assistant to the tools you use every day through our module system
- 📊 **Structured Data Collection** - Request and validate specific information from users in structured formats
- 🔒 **Security-Focused Design** - Careful permission boundaries protect your data and systems
- 🎨 **Customizable UI** - Adapt the interface to your preferences with theming options
