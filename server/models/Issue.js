const mongoose = require('mongoose');

   const issueSchema = new mongoose.Schema({
     title: { type: String, required: true },
     description: { type: String, required: true },
     priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
     status: { type: String, enum: ['open', 'closed'], default: 'open' },
     project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   });

   module.exports = mongoose.model('Issue', issueSchema);