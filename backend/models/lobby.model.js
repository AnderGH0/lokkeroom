const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const lobbySchema = new Schema({
    name : {type: String, required: true},
    admin : {type: String, required: true}, // {type: mongoose.SchemaTypes.ObjectId, ref: "User", required: true},
    messages : {type: [Object], default: []}, // messages : {type: [{type: mongoose.SchemaTypes.ObjectId, ref:"Message"}], default: []},
    users : {type: [String], required: true}, // {type: [{type: mongoose.SchemaTypes.ObjectId , ref:"User"}], required: true}, 
    createdAt : {type: Date, default: Date.now()}
})

module.exports = mongoose.model("Lobby", lobbySchema);