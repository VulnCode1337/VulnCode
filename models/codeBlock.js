const mongoose  = require('mongoose');
const Vulnerability = require('./vulnerability');

// create the database schema for the code blocks
const codeBlockSchema = new mongoose.Schema({
    vulerability: { type: mongoose.Schema.Types.ObjectId, ref: 'Vulnerability' },
    secureCode: { type: String, required: true },
    vulnerableCode: { type: String, required: true }
});

module.exports = mongoose.model('CodeBlock', codeBlockSchema);