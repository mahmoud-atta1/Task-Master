const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

dotenv.config();

const authRoute = require('./routes/auth.route');
const todoRoute = require('./routes/todo.route');

const errorHandler = require('./middlewares/errorMiddleware');

const connectDB = require('./config/database');
const frontendPath = path.join(__dirname, '..', 'frontend');

connectDB();

const app = express();

app.use(helmet());

app.use(morgan('combined'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const envCorsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultDevOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

const allowAllOrigins = envCorsOrigins.includes('*');
const allowedOrigins = new Set([...defaultDevOrigins, ...envCorsOrigins]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowAllOrigins || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.static(frontendPath));

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/todos', todoRoute);

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is running 🚀',
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route not found',
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`TaskMaster running on http://localhost:${PORT}`);
});

module.exports = app;
