const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    owner : {type: String, required: true}, // {type: mongoose.SchemaTypes.ObjectId, ref: "User", required: true},
    createdAt : {type: Date, default: Date.now()},
    content : {type: String, required: true},
    lobby: {type: String, required: true} // {type: mongoose.SchemaTypes.ObjectId, ref: "Lobby", required: true}
})

module.exports = mongoose.model("Message", messageSchema);