const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = 3000;

// MongoDB connection string (local)
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// Middlewares
app.use(cors());

// ✅ Increase JSON payload size limit to handle base64 avatars
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

async function main() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('profilepilot'); // database name
    const usersCollection = db.collection('users'); // collection name

    // 📄 GET all users
    app.get('/api/users', async (req, res) => {
      try {
        const users = await usersCollection.find({}).toArray();
        res.json(users);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
      }
    });

    // ➕ POST new user
    app.post('/api/users', async (req, res) => {
      try {
        const newUser = req.body;

        // Basic validation (optional)
        if (!newUser.name || !newUser.email) {
          return res.status(400).json({ message: 'Name and Email are required' });
        }

        const result = await usersCollection.insertOne(newUser);
        res.status(201).json({ message: 'User added', id: result.insertedId });
      } catch (error) {
        res.status(500).json({ message: 'Error adding user', error: error.message });
      }
    });

    // ❌ DELETE user
    app.delete('/api/users/:id', async (req, res) => {
      try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: 'Invalid user ID' });
        }

        const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
          res.json({ message: 'User deleted' });
        } else {
          res.status(404).json({ message: 'User not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
      }
    });

    // 🚀 Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err);
  }
}

main();
