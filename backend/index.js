require('dotenv').config();

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_ATLAS_STRING); // mongoAtlas string testuser testuser123

//models
const User = require('./models/user.model');    // Importing the User model
const Message = require('./models/message.model');    // Importing the Message model
const Lobby = require('./models/lobby.model');    // Importing the Lobby model

//Express
const express = require("express");
const app = express();

//cors
const cors = require("cors"); 
app.use(cors({
    origin:'*',
}));

//jwt
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./utilities');

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World");
});

// ------------------------------------------------- Routes -------------------------------------------------

// Create Account
app.post("/api/register", async (req, res) => { // req: {userName, email, password} res: A message stating the user has been created (or the approriate error, if any)
    const {userName, email, password} = req.body;
    if(!userName || !email || !password){        // If any of the fields are missing
        const missingField = !userName ? "userName" : !email ? "email" : "password";
        return res.status(400).json({message: `${missingField} is required`});
    }

    const isUser = await User.findOne({email: email}); // Search the user in the database
    if(isUser){ // User is already registered
        return res.status(400).json({message: "User already exists"});
    }
    const user = new User({userName, email, password}); // Create a new user
    const accessToken = jwt.sign({user}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "36000m"}); // Create a JWT token
    user.token = accessToken;
    await user.save(); // Save the user to the database

    return res.json({error: false, accessToken, user, message: "User created successfully"}); // Return the JWT token, the user and a message confirming the user has been created
}); 

// Login
app.post("/api/login", async (req, res) => { // req: {login, password} res: A JWT token (or the approriate error, if any)
    const {email, password} = req.body;

    if(!email || !password){ // If any of the fields are missing
        const missingField = !email ? "email" : "password";
        return res.status(400).json({message: `${missingField} is required`});
    }

    const userInfo = await User.findOne({email: email}); // Search the user in the database
    if(!userInfo){ // User is not registered
        return res.status(400).json({message: "User not found"});
    }

    if(userInfo.password !== password){ // Password is incorrect
        return res.status(400).json({message: "Incorrect password"});
    }
    const user = {user: userInfo}
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "36000m"}); // Create a JWT token
    
    return res.json({error: false, accessToken, userInfo, message: "Loggin successful"}); // Return the JWT token and the user
});     

// --------------- LOBBY ROUTES -----------------
app.post("/api/lobby/create-lobby", authenticateToken, async (req, res) => { //CREATE A LOBBY req: {userID, lobbyName} res: A message stating the lobby has been created
    const {userName, lobbyName} = req.body;
    if(!userName){  // If the user is missing
        return res.status(400).json({message: "A user is required to create a lobby"});
    }
    const isLobby = await Lobby.findOne({admin: userName, name: lobbyName}); // Search the lobby in the database
    if(isLobby){    // User already has a lobby with this name
        return res.status(400).json({message: "User has already a lobby with this name"});
    }

    const lobby = new Lobby({name: lobbyName, admin: userName, users: [userName]}); // create a lobby
    await lobby.save(); // Save the lobby to the database
    const userData = await User.findOne({userName: userName}); // Search the user in the database
    userData.lobbies.push(lobbyName); // Add the lobby to the user
    await userData.save(); // Update the user
    return res.json({error: false, message:"Lobby created successfully", admin: userName, "_id": lobby._id}); // Return a message confirming the lobby has been created

}); 

app.post("/api/lobby/:lobbyId", authenticateToken, async (req, res) => {  // CREATE A MESSAGE req: {message} res: A message stating the message has been posted (or the approriate error, if any)
    const {content, userName} = req.body;
    const lobbyId = req.params.lobbyId;
    if(!content){ // If the message is missing
        return res.status(400).json({message: "There must be a message to post"});
    }
    try {
        const currentLobby = await Lobby.findOne({_id: lobbyId}); // Search the lobby in the database
        if(!currentLobby){ // Lobby does not exist
            return res.status(400).json({message: "Lobby does not exist"});
        } 
        //verify User is in the lobby
        if(!currentLobby.users.includes(userName)){
            return res.status(400).json({message: "User is not in the lobby"});
        }
        const message = new Message({ owner: userName,content, lobby : currentLobby.name}); // Create a message
        await message.save(); // Save the message to the database
        currentLobby.messages.push(message); // Add the message to the lobby
        await currentLobby.save(); // Update the lobby to the database

        return res.json({error: false, message: "Message posted successfully", message}); // Return a message confirming the message has been posted
    } catch (error) {
        return res.status(400).json({error: true, message: "Message could not be posted"});   
    }
});


app.get("/api/lobby/:lobbyId", authenticateToken, async (req, res) => { // An Array containing all the messages from the lobby
    const lobbyId = req.params.lobbyId;
    const {userName} = req.body;
    try {
        const currentLobby = await Lobby.findOne({_id: lobbyId}); // Search the lobby in the database
        if(!currentLobby){ // Lobby does not exist
            return res.status(400).json({message: "Lobby does not exist"});
        }
        if(!currentLobby.users.includes(userName)){
            return res.status(400).json({message: "User is not in the lobby"});
        }
        return res.json({error: false, message:"Here are all the messages in the lobby" , messages : currentLobby.messages}); // Return the messages
    } catch (error) {
        return res.status(400).json({message: "Messages could not be retrieved"});
    }
}); 

app.get("/api/lobby/:lobbyId/:messageId", authenticateToken, async (req, res) => {  // A single message from the lobby. ????????????
    const lobbyId = req.params.lobbyId;
    const messageId = req.params.messageId;
    try {
        const currentLobby = await Lobby.findOne({_id: lobbyId}); // Search the lobby in the database
        if(!currentLobby){ // Lobby does not exist
            return res.status(400).json({message: "Lobby does not exist"});
        }
        const currentMessage = await Message.findOne({_id: messageId}); // Search the message in the database
        if(!currentMessage){ // Message does not exist
            return res.status(400).json({message: "Message does not exist"});
        }
        let found = false;
        currentLobby.messages.forEach(message => { // Check if the message is in the lobby
            if(message._id.toString() == currentMessage._id.toString()){
                found = true;
            }
        });
        if(found) return res.json({error: false, message: "Here is the message", message: currentMessage}); // Return the message
        return res.status(400).json({message: "Message is not in the lobby"});
    } catch (error) {
        return res.status(400).json({message: "Message could not be retrieved"});
    }  
}); 

app.post("/api/lobby/:lobbyId/add-user", authenticateToken, async (req, res) => { // req: {user} res: Add user to the lobby. Admin only
    const {admin, invitedUser} = req.body;
    const lobbyId = req.params.lobbyId;
    try {
        const currentLobby = await Lobby.findOne({_id: lobbyId}); // Search the lobby in the database
        if(!currentLobby){ // Lobby does not exist
            return res.status(400).json({message: "Lobby does not exist"});
        }
        if(admin !== currentLobby.admin){ // User is not the admin
            return res.status(400).json({message: "Only the admin can add users to the lobby"});
        }
        const invitedUserData = await User.findOne({userName: invitedUser}); // Search the user in the database
        if(!invitedUserData){ // User does not exist
            return res.status(400).json({message: "User does not exist"});
        }
        if(currentLobby.users.includes(invitedUser)){ // User is already in the lobby
            return res.status(400).json({message: "User is already in the lobby"});
        }
        currentLobby.users.push(invitedUser); // Add the user to the lobby
        await currentLobby.save(); // update the lobby
        invitedUserData.lobbies.push(currentLobby.name); // Add the lobby to the user
        await invitedUserData.save(); // Update the user 
        return res.json({error: false, message: "User added to the lobby", user: invitedUser}); // Return a message confirming the user has been added
    } catch (error) {
        return res.status(400).json({message: "User could not be added to the lobby"});
    }
}); 

app.post("/api/lobby/:lobbyId/remove-user", authenticateToken, async (req, res) => { // req: {user} res: Remove user from the lobby. Admin only
    const {admin, removedUser} = req.body;
    const lobbyId = req.params.lobbyId;
    try {
        const currentLobby = await Lobby.findOne({_id: lobbyId}); // Search the lobby in the database
        if(!currentLobby){ // Lobby does not exist
            return res.status(400).json({message: "Lobby does not exist"});
        }
        if(admin !== currentLobby.admin){ // User is not the admin
            return res.status(400).json({message: "Only the admin can remove users from the lobby"});
        }
        const index = currentLobby.users.indexOf(removedUser); // Find the user in the lobby
        if(index === -1){ // User is not in the lobby
            return res.status(400).json({message: "User is not in the lobby"});
        }
        if(admin === removedUser){ // User is the admin
            return res.status(400).json({message: "Admin cannot be removed from the lobby"});
        }
        currentLobby.users.splice(index, 1); // Remove the user from the lobby
        await currentLobby.save(); // Update the lobby

        const removedUserData = await User.findOne({userName: removedUser}); // Search the user in the database
        const lobbyIndex = removedUserData.lobbies.indexOf(currentLobby.name); // Find the lobby in the user  
        removedUserData.lobbies.splice(lobbyIndex, 1); // Remove the lobby from the user
        await removedUserData.save(); // Update the user   
        
        return res.json({error: false, message: "User removed from the lobby", user: removedUser}); // Return a message confirming the user has been removed
    } catch (error) {
        return res.status(400).json({message: "User could not be removed from the lobby"});
    }
}); 

app.patch("/api/lobby/:lobbyId/:messageId", authenticateToken, async (req, res) => { // Both the owner and admin can edit the messages
    const {content, user} = req.body;
    const lobbyId = req.params.lobbyId;
    const messageId = req.params.messageId;

    try {
        const currentLobby = await Lobby.findOne({_id: lobbyId}); // Search the lobby in the database
        if(!currentLobby){ // Lobby does not exist
            return res.status(400).json({message: "Lobby does not exist"});
        }
        const currentMessage = await Message.findOne({_id: messageId}); // Search the message in the database
        if(!currentMessage){ // Message does not exist
            return res.status(400).json({message: "Message does not exist"});
        }
        if(user === currentMessage.owner || user === currentLobby.admin){ // User is the owner or the admin
            currentMessage.content = content; // Update the message
            await currentMessage.save(); // Save the message to the database
            return res.json({error: false, message: "Message edited successfully", message: currentMessage}); // Return a message confirming the message has been edited
            
        }
        return res.status(400).json({message: "Only the owner or the admin can edit the message"}); // User is not the owner nor the admin
    } catch (error) {
        return res.status(400).json({message: "Message could not be edited"});
    }
}); 

// --------------- USER ROUTES -------------------
app.get("/api/users", authenticateToken, async (req, res)=>{ // All user from the lobby. Admin only?
    const {lobby} = req.body;

    try {
        const currentLobby = await Lobby.findOne({name: lobby}); // Search the lobby in the database
        if(!currentLobby){ // Lobby does not exist
            return res.status(400).json({message: "Lobby does not exist"});
        }
        return res.json({error: false, message: "Here are all the users in the lobby", users: currentLobby.users}); // Return the users
    } catch (error) {
        return res.status(400).json({message: "Users could not be retrieved"});
    }
}); 

app.get("/api/users/:userId", authenticateToken, async (req, res) => { // A single user. If the user is not an admin, can only get details from people that are in the same lobby.
    const userId = req.params.userId;
    const {userName, lobby} = req.body;
    try {
        const searchedUser = await User.findOne({_id:userId}); // Search the user in the database
        if(!searchedUser){
            return res.status(400).json({error: true, message:"User does not exist"})
        }
        const currentLobby = await Lobby.findOne({name:lobby})
        if(!currentLobby){
            return res.status(400).json({error: true, message:"Lobby does not exist"})
        }
        const indexSearchedUser = currentLobby.users.indexOf(searchedUser.userName);
        const indexUserName = currentLobby.users.indexOf(userName)
        if(userName === currentLobby.admin || (indexSearchedUser !== -1 && indexUserName !== -1)){
            return res.json({message: "Here is the information of the user", user: searchedUser})
        } else {
            return res.json({message: "You are not allowed to get information from a user not in the lobby"})
        }

    } catch (error) {
        return res.status(400).json({error: true, message:"Could not retrieve the user information" })
    }
}); 

// --------------- MESSAGE ROUTES ----------------
app.delete("/api/messages/:messageId", authenticateToken, async (req, res) => { // Delete a message, Admin Only
    const messageId = req.params.messageId;
    const {admin} = req.body;
    try {
        const message = await Message.findOne({_id: messageId}); // Search the message in the database
        if(!message){ // Message does not exist
            return res.status(400).json({message: "Message does not exist"});
        }
        const lobby = await Lobby.findOne({name: message.lobby}); // Search the lobby in the database
        if(!lobby){ // Lobby does not exist
            return res.status(400).json({message: "Lobby does not exist"});
        }
        if(admin !== lobby.admin){ // User is not the admin
            return res.status(400).json({message: "Only the admin can delete messages"});
        }
        const messageIndex = lobby.messages.forEach((msg, index) => { // Find the message in the lobby
            if(msg._id.toString() === messageId){
                return index;
            }
        });
        if(messageIndex === -1){ // Message is not in the lobby
            return res.status(400).json({message: "Message is not in the lobby"});
        }
        lobby.messages.splice(messageIndex, 1); // Remove the message from the lobby
        lobby.save(); // Update the lobby
        Message.deleteOne({_id: messageId}); // Delete the message from the database
        return res.json({error: false, message: "Message deleted successfully"}); // Return a message confirming the message has been deleted
    } catch (error) {
        return res.status(400).json({message: "Message could not be deleted"});
    }
}); 



app.listen(8000, () => {
    console.log("Server is running on port 8000");
}); 