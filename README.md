# FourthChat

**The Open Source, Self-Hosted AI Assistant Platform.**

<p align="center">
  <img src="public/cover.png" alt="FourthChat Cover" width="100%" />
</p>

Everyone should have an assistant.
Not a company-owned assistant.
Not a cloud-owned assistant.
Your assistant.

FourthChat exists for one simple reason:
**every person and business deserves a private AI assistant that works only for them.**

---

## What this is

FourthChat is an **open-source, self-hosted platform** to build your own AI assistant with frontend.

You can:
* Upload your files
* Store them in a vector database
* Chat with your data
* Add tools and actions
* Extend your assistant over time

Think of it as your **digital second brain** or your own **Jarvis**, **Friday**, **Edith**, or maybe **Veronica**... whatever you want to call it.

---

## Technical Stack

Built with modern, robust technologies:

* **Framework**: [Next.js](https://nextjs.org/) (App Router)
* **Database**: [PostgreSQL](https://www.postgresql.org/) (Data) & [Qdrant](https://qdrant.tech/) (Vectors)
* **ORM**: [Drizzle](https://orm.drizzle.team/)
* **AI Engine**: [Vercel AI SDK](https://sdk.vercel.ai/docs)
* **Authentication**: [NextAuth.js](https://authjs.dev/)

---

## Getting Started

### Prerequisites

* **Node.js**: v18 or later
* **Docker**: For running PostgreSQL and Qdrant locally
* **PostgreSQL** (optional): If you prefer a local Postgres installation

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database (Postgres)
POSTGRES_URL="postgresql://postgres:postgres@localhost:5432/fourthchat"

# Vector Database (Qdrant)
QDRANT_URL="http://localhost:6333"
# QDRANT_API_KEY="your-api-key-here" (Optional: only if using authentication)

# Authentication (generate with: openssl rand -base64 32)
AUTH_SECRET="your-super-secret-key-at-least-32-chars"
```

> **Note:** API Keys (OpenAI, Google Gemini, etc.) are managed directly within the FourthChat dashboard settings, not in environment variables.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/mentterlabs/fourthchat.git
    cd fourthchat
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start required services (DB & Vector Store)**
    ```bash
    docker compose -f docker-compose.dev.yml up -d
    ```

4.  **Set up the database**
    
    **Option A: Quick setup (development)**
    ```bash
    npm run db:push
    ```

    **Option B: Migration-based setup (production)**
    ```bash
    npm run db:migrate
    ```

5.  **Run the development server**
    ```bash
    npm run dev
    ```

6.  **Open your browser**
    Navigate to `http://localhost:3000` to create your admin account and start building your assistant.

---

## Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate migration files from schema changes |
| `npm run db:migrate` | Apply pending migrations to the database |
| `npm run db:push` | Push schema directly to DB (dev only, may cause data loss) |
| `npm run db:studio` | Open Drizzle Studio to browse/edit data |

### Production Workflow
```bash
# After modifying lib/schema.ts:
npm run db:generate    # Generate SQL migration files
npm run db:migrate     # Apply migrations to database
```

---

## Privacy by Design

This is not a promise. It is architecture.

* **Self-hosted**: Your data stays on your machine/server.
* **No Telemetry**: We don't track you.
* **No Training**: Your data is yours. It is never sent to train external models unless you explicitly choose a provider that does valid privacy guarantees (and even then, you control the keys).

If your server is off, your assistant is off. That is real privacy.

---

## Core Ideas

* **Assistant**: A FourthChat AI with memory and behavior.
* **Knowledge Base**: Your files stored as embeddings.
* **Tools**: Optional actions your assistant can perform.
* **Plugins**: Ways to extend where and how your assistant works.

Everything is modular. Nothing is mandatory.

---

## Roadmap

* Faster onboarding
* Better file handling
* Cleaner assistant controls
* More tool integrations
* Community plugins

Built slowly. Built right.

---

## Open Source Mindset

* Transparent code
* Community driven
* No dark patterns
* No artificial limits

This project grows with its users.

---

## Contributing

If this idea resonates with you:

* Use it
* Break it
* Improve it

Pull requests and discussions are welcome.

---

## License

MIT License.

Use it freely. Make it yours.

---

## Final Thought

You do not need a smarter AI.
You need one that is **yours**.

That is why FourthChat exists.
