require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const connectDB = require('./config/db');

const notify = require('./utils/notify');
const pushRoutes = require('./routes/push').router;

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});

// init socket notifier
if (notify && typeof notify.init === 'function') {
  notify.init(io);
}

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);
  socket.on('disconnect', () => console.log('Socket disconnected', socket.id));
});

// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// connect DB
connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gas-detection')
  .catch(err => {
    console.error('DB connection failed', err);
    process.exit(1);
  });

app.get('/test', (req, res) => res.send('Server working'));

// mount routes
app.use('/auth', require('./routes/auth'));
app.use('/sensors', require('./routes/sensors'));
app.use('/data', require('./routes/data'));   // ✅ your data route
app.use('/profile', require('./routes/profile'));
app.use('/logs', require('./routes/logs'));
app.use('/api/settings', require('./routes/settings'));
app.use('/valves', require('./routes/valves'));
app.use('/assistant', require('./routes/assistant'));
app.use('/push', pushRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
