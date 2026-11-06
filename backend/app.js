const express = require('express');
const mongoose = require('mongoose');

const Task = mongoose.model('Task', new mongoose.Schema({
  title: { type: String, required: true },
  done:  { type: Boolean, default: false }
}));

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'UP' }));

app.get('/api/tasks', async (req, res) => {
  res.json(await Task.find().sort({ _id: -1 }));
});

app.post('/api/tasks', async (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ error: 'title is required' });
  }
  res.status(201).json(await Task.create({ title: req.body.title }));
});

module.exports = app;
