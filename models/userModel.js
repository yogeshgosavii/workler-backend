import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username : {type : String ,required : true},
    birthDate : {type : Date ,required : true},
    accountType : {type: String ,required : true}
},{collection : "users"});

const User = model('User', userSchema);

export default User;
