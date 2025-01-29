const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const lobbySchema = new Schema({
    name : {type: String, required: true},
    admin : {type: String, required: true},
    messages : {type: [String], default: []}, // messages : {type: [mongoose.SchemaType.ObjectId], ref: "Message" , required: true},
    users : {type: [String], required: true}, // users : {type: [mongoose.SchemaType.ObjectId], ref: "User" , required: true},
    createdAt : {type: Date, default: Date.now()}
})

module.exports = mongoose.model("Lobby", lobbySchema);