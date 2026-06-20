# Mr. Talkative

Context-aware exam intelligence powered by RAG for MNNIT students.

This README reflects the current backend implementation in the codebase.

## Backend Features (Implemented)

### 1) FastAPI service bootstrap
- App starts from server/app/main.py and mounts API routes under /api.
- Startup event performs MongoDB ping health check.

### 2) Authentication and authorization
- JWT auth with python-jose and bcrypt password hashing.
- Signup and login endpoints implemented.
- User profile endpoint implemented (/api/auth/me).
- Role-based admin guard implemented via require_admin dependency.
- Signup validation includes:
     - MNNIT email domain enforcement (@mnnit.ac.in)
     - Branch constraint (CSE, IT, EE, ECE)
     - Semester range check (1-8)

### 3) Document upload and library-aware metadata validation
- Admin-only upload endpoint implemented at /api/upload/.
- Supported file types: PDF and TXT.
- Max file size enforcement: 50 MB.
- Branch/semester/subject combination is validated against library_structure collection in MongoDB.
- Document metadata is saved in documents collection.

### 4) Background ingestion trigger for RAG indexing
- Upload returns quickly and schedules ingestion as a background task.
- Ingestion flow is production-ready for:
     - text extraction
     - chunking
     - embedding generation
     - vector upsert in Qdrant

### 5) Chat endpoints with end-to-end RAG pipeline
- /api/chat/query: full pipeline (retrieve context + generate answer).
- /api/chat/context: retrieval-only debug endpoint (returns selected chunks).
- Request/response schemas are implemented with Pydantic models.

### 6) Data layer and storage
- MongoDB (Motor) collections used:
     - users
     - documents
     - library_structure
- Qdrant vector store supports:
     - cloud mode (URL + API key)
     - local mode (embedded storage path)

## Backend Features (Scaffolded but not implemented yet)

- server/app/api/routes/quiz.py is empty.
- server/app/api/routes/evaluation.py is empty.
- server/app/services/quiz_service.py is empty.
- server/app/services/evaluation_service.py is empty.
- server/app/services/pyq_analyzer.py is empty.

## API Surface (Current)

### Auth
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me

### Upload and library metadata
- POST /api/upload/
- GET /api/upload/{document_id}
- GET /api/upload/
- GET /api/upload/library/branches
- GET /api/upload/library/semesters
- GET /api/upload/library/subjects

### Chat
- POST /api/chat/query
- POST /api/chat/context

## RAG Implementation (Detailed)

This section describes exactly what is implemented in the backend RAG stack.

### A) Ingestion pipeline (document to vectors)

Main orchestration module: server/app/rag/ingestion/pipeline.py

#### Step A1: Document loading
Module: server/app/rag/ingestion/document_loader.py

- PDF support via pypdf (PdfReader), extracting text from all pages.
- TXT support via utf-8 file read.
- Unsupported extensions are rejected.

#### Step A2: Chunking strategy
Module: server/app/rag/ingestion/chunking.py

- Uses RecursiveCharacterTextSplitter from langchain-text-splitters.
- Default chunk settings:
     - chunk_size = 500 chars
     - chunk_overlap = 100 chars
- Separator priority:
     - paragraph breaks
     - line breaks
     - sentence boundaries
     - spaces
     - character-level fallback
- Empty chunks are removed.

#### Step A3: Embedding generation
Module: server/app/rag/ingestion/embeddings.py

- Uses OllamaEmbeddings with model nomic-embed-text.
- Batch embedding generation for all chunks.
- Embedding dimension is expected to be 768.

#### Step A4: Chunk metadata enrichment
Each chunk is stored with metadata fields:
- document_id
- branch
- semester
- subject
- chunk_index
- file_name
- uploaded_by

#### Step A5: Vector persistence in Qdrant
Module: server/app/rag/retrieval/vector_store.py

- Collection auto-created if missing.
- Distance metric: cosine.
- Payload indexes created for:
     - branch
     - semester
     - subject
     - document_id
- Each chunk is stored as a point with UUID id and payload containing text + metadata.

### B) Retrieval pipeline (query to ranked chunks)

Main module: server/app/rag/retrieval/retriever.py

The retriever is hybrid and combines semantic search and lexical matching.

#### Step B1: Query processing and optimization
Module: server/app/rag/retrieval/query_processor.py

Pipeline stages:
1. Query cleaning
      - lowercasing
      - whitespace normalization
      - non-alphanumeric cleanup
      - filler-word removal
2. Technical spelling correction
      - dictionary of common CS misspellings (for example recursion, algorithm, complexity)
3. Synonym expansion (optional)
      - domain synonym map for CS/engineering terms
4. LLM query rewriting (optional)
      - uses OllamaLLM with low temperature
      - rewrites user question into compact search keywords
5. Key-term extraction
      - removes action words and keeps technical terms

Config flags in settings:
- USE_QUERY_PROCESSING
- USE_LLM_QUERY_EXPANSION
- USE_SYNONYM_EXPANSION
- QUERY_PROCESSOR_MODEL

#### Step B2: Vector retrieval
- Query embedding generated with Ollama embeddings.
- VectorStore.search applies metadata filters:
     - branch
     - semester
     - subject
- Similarity threshold filtering is applied (default 0.6).

#### Step B3: BM25 keyword retrieval on candidate pool
Module: server/app/rag/retrieval/keyword_search.py

- BM25 index is built on vector candidate texts.
- Query is tokenized and scored with rank-bm25.
- Metadata-aware filtering remains available.

#### Step B4: Score fusion and ranking
- Vector and keyword scores are merged per chunk text.
- Weighted fusion:

     combined_score = vector_score * vector_weight + normalized_keyword_score * keyword_weight

- Default weights from settings:
     - vector_weight = 0.7
     - keyword_weight = 0.3

### C) Context selection before generation

Module: server/app/rag/retrieval/context_selector.py

Implemented strategies:
- simple: score sorting + dedupe by chunk text
- mmr: relevance-diversity balancing (Maximal Marginal Relevance)
- diversity: TF-IDF cosine-similarity-aware diversity selection

Important behavior:
- Retrieval may pull a larger candidate set first.
- Selection narrows context to min/max chunk limits before answer generation.
- Defaults are settings-driven:
     - CONTEXT_MIN_CHUNKS
     - CONTEXT_MAX_CHUNKS
     - CONTEXT_SELECTION_STRATEGY

### D) Answer generation

Modules:
- server/app/rag/generation/answer_generator.py
- server/app/rag/generation/prompt_templates.py

Implementation details:
- Uses ChatOllama for response generation.
- Prompt enforces exam-style structure:
     - Definition
     - Explanation
     - Steps/Algorithm
     - Formula/Syntax
     - Example
     - Conclusion
- Context chunks are formatted into numbered context blocks.
- Optional source list is extracted and returned with answer payload.

### E) End-to-end runtime flow

#### Upload-time indexing flow
1. Admin uploads file with branch/semester/subject.
2. Metadata validated against library_structure.
3. File saved to data/uploads.
4. Document metadata saved in MongoDB.
5. Background task runs ingestion:
      - load -> chunk -> embed -> upsert to Qdrant.

#### Query-time answering flow
1. User calls /api/chat/query with question + branch/semester/subject.
2. Query processor optimizes the question.
3. Hybrid retriever gathers and fuses candidate chunks.
4. Context selector chooses final chunk set.
5. Answer generator produces structured answer from context.
6. API returns answer, chunk count, metadata, and optional sources.

## Configuration knobs used by backend

Main config module: server/app/core/settings.py

- App: APP_NAME, APP_VERSION
- MongoDB: MONGO_URI, DATABASE_NAME
- Auth: SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
- Qdrant: QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION
- LLM: LLM_MODEL, LLM_TEMPERATURE, LLM_MAX_TOKENS
- Query processor: QUERY_PROCESSOR_MODEL and feature toggles
- Retrieval/selection: top-k, candidate-k, score threshold, strategy, weights

## Tech stack used in backend

- FastAPI
- Motor (MongoDB async driver)
- Qdrant client
- LangChain components
- Ollama (Chat + Embeddings)
- rank-bm25
- scikit-learn and numpy
- python-jose
- bcrypt

## Notes on current state

- Core backend path (auth + upload + RAG chat) is implemented and wired.
- Quiz and evaluation modules are present as placeholders and can be developed next.

## License

For MNNIT educational use.

## Additional Documentation

- Backend architecture and RAG flow details: docs/backend-architecture.md
