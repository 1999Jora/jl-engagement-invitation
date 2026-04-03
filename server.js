const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON file database
const dataDir = path.join(__dirname, 'data');
const dbFile = path.join(dataDir, 'guests.json');
fs.mkdirSync(dataDir, { recursive: true });

function readGuests() {
  try {
    if (fs.existsSync(dbFile)) {
      return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    }
  } catch {}
  return [];
}

function writeGuests(guests) {
  fs.writeFileSync(dbFile, JSON.stringify(guests, null, 2), 'utf8');
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Get all guests
app.get('/api/guests', (req, res) => {
  const guests = readGuests();
  // Return without messages for privacy
  res.json(guests.map(({ message, ...g }) => g));
});

// API: Add a guest
app.post('/api/guests', (req, res) => {
  const { name, count, attending, message } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const guest = {
    id: Date.now(),
    name: name.trim().substring(0, 100),
    count: Math.min(Math.max(parseInt(count) || 1, 1), 10),
    attending: attending ? 1 : 0,
    message: typeof message === 'string' ? message.trim().substring(0, 500) : '',
    created_at: new Date().toISOString()
  };

  const guests = readGuests();
  guests.unshift(guest);
  writeGuests(guests);

  res.status(201).json(guest);
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
