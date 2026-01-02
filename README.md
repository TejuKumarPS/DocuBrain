# 🧠 DocuBrain - Intelligent Document Assistant

![Project Status](https://img.shields.io/badge/status-live-success)
![Tech Stack](https://img.shields.io/badge/stack-MERN-blue)
![AI Model](https://img.shields.io/badge/AI-Llama--3-orange)

**DocuBrain** is a full-stack Retrieval-Augmented Generation (RAG) application that allows users to have natural, context-aware conversations with their PDF documents. unlike standard keyword search, DocuBrain understands the *semantic meaning* of queries and retrieves exact answers with citations.

🔗 **Live Demo:** [DocuBrain](https://docu-brain-a1vc9ppxx-teju-kumar-p-ss-projects.vercel.app)

---

## 🚀 Key Features

* **📄 PDF Ingestion & Chunking:** Automatically parses and splits large PDF documents into manageable semantic chunks.
* **🔍 Vector Search (RAG):** Uses **Supabase (pgvector)** and **Cosine Similarity** to retrieve the most relevant document sections.
* **🤖 Context-Aware AI:** Includes a "Query Rephrasing" engine that understands follow-up questions (e.g., resolving pronouns like "What is *his* age?" based on chat history).
* **⚡ Real-Time Streaming:** Implements Server-Sent Events (SSE) to stream AI responses token-by-token for a zero-latency user experience.
* **📝 Markdown & Citations:** Renders rich text (bold, lists, code blocks) and provides page number citations for every answer.
* **🧹 Auto-Maintenance:** Features an automated cleanup system to manage vector storage and prevent database bloat from old sessions.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React.js (Vite)
* **Styling:** Tailwind CSS, Framer Motion (Animations)
* **State/Network:** Axios, React Hooks
* **Rendering:** React-Markdown, Lucide React (Icons)

### Backend
* **Runtime:** Node.js, Express.js
* **AI Orchestration:** LangChain.js
* **LLM Provider:** Groq API (Llama-3-8b-8192)
* **Embeddings:** Xenova/Transformers (all-MiniLM-L6-v2)

### Database
* **Database:** PostgreSQL (Supabase)
* **Extension:** `pgvector` (Vector Storage & Search)

### Deployment
* **Frontend:** Vercel
* **Backend:** Render

---

## ⚙️ Architecture

1.  **Upload:** User uploads a PDF. Backend parses text and splits it into chunks.
2.  **Embed:** Each chunk is converted into a 384-dimensional vector using HuggingFace models.
3.  **Store:** Vectors are stored in Supabase with metadata (page numbers).
4.  **Query:**
    * User asks a question.
    * **Rephraser:** AI rewrites the question to include context from previous messages.
    * **Retrieval:** Database finds the top 5 most similar chunks.
    * **Generation:** Llama-3 generates an answer using the retrieved chunks as a reference.
5.  **Stream:** The response is streamed back to the frontend in real-time.

---

## 💻 Getting Started Locally

Follow these steps to run DocuBrain on your local machine.

### Prerequisites
* Node.js (v18+)
* Supabase Account (Free Tier)
* Groq API Key (Free)

### 1. Clone the Repository
```bash
git clone [https://github.com/TejuKumarPS/DocuBrain.git](https://github.com/TejuKumarPS/DocuBrain.git)
cd docubrain
```
### 2. Database Setup
Create a database in Supabase and run this query in the SQL editor
```bash
-- Enable Vector Extension
create extension if not exists vector;

-- Create Embeddings Table
create table if not exists document_embeddings (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(384),
  created_at timestamp with time zone default now()
);

-- Optimize Search Performance
create index on document_embeddings using hnsw (embedding vector_cosine_ops);
```

### 3. Backend Setup
Navigate to server folder and install dependencies
```bash
cd server
npm install
```
Create a .env file in the server folder
```bash
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=your_database_connection_string
```
### 4. Frontend Setup
Navigate to client folder and install dependecies
```bash
cd ../client
npm install
```
Create a .env file in the client folder
```bash
VITE_API_URL=http://localhost:5000
```
### 5. Run the Application
Terminal 1 (Backend)
```bash
cd server
npm run dev
```
Terminal 2 (Frontend)
```bash
cd client
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) in your browser

---

## 🔮 Future Improvements
* [ ] **Multi-Document Support:** Allow querying across multiple PDFs simultaneously.
* [ ] **User Authentication:** Add Clerk or Firebase Auth for private user histories.
* [ ] **Hybrid Search:** Combine keyword search with vector search for better accuracy on specific terms.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.



