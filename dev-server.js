// Simple development server for API functions
import express from 'express';
import path from 'path';
import cors from 'cors';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

// Load environment variables from .env.local
config({ path: '.env.local' });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Dynamic import function for CommonJS modules
async function importHandler(modulePath) {
  const module = await import(modulePath);
  return module.default;
}

// API Routes
app.post('/api/generate', async (req, res) => {
  try {
    const handler = await importHandler('./api/generate.js');
    await handler(req, res);
  } catch (error) {
    console.error('Generate API Error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        details: error.message
      }
    });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    const handler = await importHandler('./api/health.js');
    await handler(req, res);
  } catch (error) {
    console.error('Health API Error:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message
    });
  }
});

app.get('/api/types', async (req, res) => {
  try {
    const handler = await importHandler('./api/types.js');
    await handler(req, res);
  } catch (error) {
    console.error('Types API Error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch contract types',
        details: error.message
      }
    });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Development server running at http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   - POST http://localhost:${PORT}/api/generate`);
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
  console.log(`   - GET  http://localhost:${PORT}/api/types`);
  console.log(`💡 Frontend with API integration ready!`);
});