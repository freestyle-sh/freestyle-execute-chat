# Freestyle Execute Chat

<div align="center">
  <img src="public/logo.svg" width="120" height="120" alt="Freestyle Execute Chat Logo" />
  <h1>Freestyle Execute Chat</h1>
  <p>A powerful, extensible chat interface with code execution capabilities</p>
</div>

## ✨ Features

- 💬 **Advanced Chat Interface** - Rich conversation experience with AI assistant
- 🧩 **Module System** - Extend functionality with integrations (AWS, GitHub, Google services, and more)
- 💻 **Code Execution** - Run and visualize code execution directly in chat
- 📊 **Structured Data** - Request and process specific information from users
- 🌓 **Theme Support** - Light and dark mode with customizable appearance
- 📱 **Responsive Design** - Works seamlessly across desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- Bun package manager
- PostgreSQL database (or Neon.tech account)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/freestyle-execute-chat.git
cd freestyle-execute-chat

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
bun dev
```

### Build and Development

```bash
# Development server with hot reload
bun dev

# Production build
bun build

# Start production server
bun start

# Run linting
bun lint

# Type checking
bunx tsc --noEmit
```

## 🧩 Modules

Freestyle Execute Chat supports various integrations through its module system:

- 📅 Google Calendar
- 📧 Gmail
- 📊 Google Sheets
- 🔍 GitHub
- ☁️ AWS
- 💵 Stripe
- 📚 Documentation integrations
- 💬 Slack
- 📨 Resend
- ⚡ Vercel
- 💾 Supabase
- 📊 Postgres
- 📱 HubSpot
- 🔍 Exa search

## 🧠 Technologies

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS
- Drizzle ORM
- Zustand for state management
- Shadcn/UI components

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the [MIT License](LICENSE).

