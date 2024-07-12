import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    accountType: { type: String },
    githubLink: { type: String },
    linkedInLink: { type: String },
    portfolioLink: { type: String },
    about: { type: String },
    tags: { type: [String] },
    profileImage: { type: String } // Base64 encoded string or URL
});

const User = mongoose.model('User', userSchema);

export default User;
