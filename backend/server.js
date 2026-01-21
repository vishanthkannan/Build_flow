const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sites', require('./routes/sites'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/allocations', require('./routes/allocations'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/users', require('./routes/users'));

// Temporary Seed Endpoint
app.get('/seed', async (req, res) => {
  const User = require('./models/User');
  try {
    await User.deleteMany({});
    const manager = await User.create({ username: 'admin', password: '123', role: 'manager' });
    const supervisor = await User.create({ username: 'e1', password: '123', role: 'supervisor' });
    res.json({ message: 'Seeded successfully', users: [manager.username, supervisor.username] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => {
  res.send('RDN Creators API is running');
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
