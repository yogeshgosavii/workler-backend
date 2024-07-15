import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true , unique: true },
    accountType: { type: String },
    githubLink: { type: String },
    linkedInLink: { type: String },
    portfolioLink: { type: String },
    about: { type: String },
    tags: { type: [String] },
    profileImage: { type: String }, 
    profileImageCompressed : {type : String}
});

const User = mongoose.model('User', userSchema);

export default User;
