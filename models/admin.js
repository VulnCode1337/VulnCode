const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// hash the password before saving
adminSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

// check if the provided password matches the stored one
adminSchema.methods.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Admin", adminSchema);