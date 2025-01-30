const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName : {type: String, required: true},
    email : {type: String, required: true},
    password : {type: String, required: true},
    lobbies : {type: [String] , default: []},  // {type: [{type: mongoose.SchemaTypes.ObjectId, ref: "Lobby"}] , default: []}, 
    createdAt : {type: Date, default: Date.now()},
    token: {type: String, required:true}
})

module.exports = mongoose.model("User", userSchema);