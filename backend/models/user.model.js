const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName : {type: String, required: true},
    email : {type: String, required: true},
    password : {type: String, required: true},
    lobbies : {type: [String], default: []}, // lobbies : {type: [mongoose.SchemaType.ObjectId], ref: "Lobby" , required: true},
    createdAt : {type: Date, default: Date.now()}
})

module.exports = mongoose.model("User", userSchema);