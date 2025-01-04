const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'Ongoing', 'Completed'], default: 'Pending' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
