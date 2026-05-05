require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    const aiRoom = await Room.findOne({ isAI: true });
    if (!aiRoom) {
      await Room.create({ name: 'AI Assistant', isAI: true });
      console.log('AI room created');
    } else {
      console.log('AI room already exists');
    }

    const general = await Room.findOne({ name: 'general' });
    if (!general) {
      await Room.create({ name: 'general' });
      console.log('General room created');
    }

    console.log('Seed done!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });