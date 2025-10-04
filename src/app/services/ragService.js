// services/ragService.js
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatGroq } from "@langchain/groq";
import { join } from 'path';
import { readdirSync, existsSync } from 'fs';

// Global vector store
let vectorStore = null;
let isInitialized = false;

// Custom Jina embeddings class (FREE API!)
class JinaEmbeddings {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.jina.ai/v1/embeddings';
  }

  async embedDocuments(texts) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'jina-embeddings-v2-base-en',
        input: texts
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Jina API error: ${JSON.stringify(data)}`);
    }
    
    return data.data.map(item => item.embedding);
  }

  async embedQuery(text) {
    const embeddings = await this.embedDocuments([text]);
    return embeddings[0];
  }
}

// Initialize embeddings
const embeddings = new JinaEmbeddings(process.env.JINA_API_KEY);

// Initialize Groq LLM
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.3,
});

// Load initial PDFs from default directory
async function initializeRAG() {
  if (isInitialized) return;

  try {
    console.log('Initializing RAG system...');
    
    const allDocs = [];
    const defaultPDFDir = join(process.cwd(), 'data', 'exoplanets');
    
    if (existsSync(defaultPDFDir)) {
      const files = readdirSync(defaultPDFDir);
      const pdfFiles = files.filter(f => f.endsWith('.pdf'));

      console.log(`Found ${pdfFiles.length} default PDFs`);

      for (const file of pdfFiles) {
        try {
          console.log(`Loading ${file}...`);
          const loader = new PDFLoader(join(defaultPDFDir, file));
          const docs = await loader.load();
          allDocs.push(...docs);
        } catch (err) {
          console.error(`Error loading ${file}:`, err.message);
        }
      }
    }

    // Split documents
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = allDocs.length > 0 
      ? await splitter.splitDocuments(allDocs)
      : [];

    console.log(`Creating vector store with ${splitDocs.length} chunks...`);

    // Create vector store
    if (splitDocs.length > 0) {
      vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
      console.log('Vector store created successfully');
    } else {
      // Create empty store
      console.log('No default PDFs found, creating empty vector store');
      vectorStore = new MemoryVectorStore(embeddings);
    }

    isInitialized = true;
    console.log('RAG system initialized successfully');
  } catch (error) {
    console.error('RAG initialization error:', error);
    console.error('Error details:', error.message);
    isInitialized = true;
    throw error;
  }
}

// Process and add new PDFs
export async function processAndIndexPDFs(pdfPaths) {
  await initializeRAG();

  console.log(`Processing ${pdfPaths.length} new PDFs...`);

  const allDocs = [];

  for (const path of pdfPaths) {
    try {
      console.log(`Loading PDF: ${path}`);
      const loader = new PDFLoader(path);
      const docs = await loader.load();
      allDocs.push(...docs);
      console.log(`Loaded ${docs.length} pages from ${path}`);
    } catch (err) {
      console.error(`Error loading ${path}:`, err.message);
      throw err;
    }
  }

  // Split new documents
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await splitter.splitDocuments(allDocs);
  
  console.log(`Adding ${splitDocs.length} chunks to vector store...`);

  // Add to vector store
  await vectorStore.addDocuments(splitDocs);

  console.log('PDFs indexed successfully');
}

// Query the RAG system with semantic search
export async function queryRAG(question) {
  await initializeRAG();

  try {
    console.log(`Query: ${question}`);

    // Search for relevant chunks
    const relevantDocs = await vectorStore.similaritySearch(question, 5);

    console.log(`Found ${relevantDocs.length} relevant chunks`);

    // Build context from relevant documents
    const context = relevantDocs.length > 0
      ? relevantDocs.map(doc => doc.pageContent).join('\n\n---\n\n')
      : 'No relevant documents found in the knowledge base. You can upload exoplanet research papers to expand my knowledge.';

    // Create prompt
    const prompt = `You are an expert on exoplanets and astronomy. Answer the question based on the context provided from scientific papers.

Context from research papers:
${context}

Question: ${question}

Provide a detailed, scientifically accurate answer. If the context doesn't contain enough information, you can supplement with general astronomical knowledge, but clearly indicate when you're doing so.
If not asked a particular question, answer casually.
`;

    console.log('Generating response with Groq...');
    const response = await model.invoke(prompt);
    console.log('Response generated successfully');
    
    return response.content;
  } catch (error) {
    console.error('Query error:', error);
    console.error('Error details:', error.message);
    throw error;
  }
}

// Initialize on import
initializeRAG().catch(err => {
  console.error('Failed to initialize RAG:', err);
});