const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    owner : {type: String, required: true},
    createdAt : {type: Date, default: Date.now()},
    content : {type: String, required: true},
    lobbyName: {type: String, required: true}
})

module.exports = mongoose.model("Message", messageSchema);