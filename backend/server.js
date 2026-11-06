const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/appdb';

mongoose.connect(MONGO_URL)
  .then(() => app.listen(PORT, () => console.log(`API listening on ${PORT}`)))
  .catch((err) => { console.error(err); process.exit(1); });
