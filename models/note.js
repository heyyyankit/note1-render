const {Schema, model} = require("mongoose");

const noteSchema = new Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' } // reference to User model
});

const Note = model('Note', noteSchema);
module.exports = Note;