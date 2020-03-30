const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    eventTitle: { type: String, required: true },
    eventDate: { type: String, required: true },
    eventDescription: {type: String, required: true}
});

module.exports = mongoose.model('event', eventSchema);
