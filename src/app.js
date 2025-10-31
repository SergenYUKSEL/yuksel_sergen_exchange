import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cashRegisterRoutes from './routes/cashRegister.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.use('/api', cashRegisterRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server only if not in test environment
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    // Server started successfully
    if (process.env.NODE_ENV !== 'production') {
      process.stdout.write(`Server running on http://localhost:${PORT}\n`);
    }
  });
}

export default app;
export { server };
