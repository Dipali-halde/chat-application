const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rooms = {}; // Stores users in each room
// Serve static files
app.use(express.static("public"));

// Handle WebSocket connections
io.on("connection", (socket) => {
   // Handle user joining a room
socket.on("joinRoom", ({ username, room }) => {
    // If the room doesn't exist, initialize it
    if (!rooms[room]) rooms[room] = [];
    // Check if the user already exists in the room
    const userExists = rooms[room].includes(username);
    if (userExists) {
        // Notify the user that they are already in the room
        socket.emit("error", { message: `User ${username} is already in room ${room} user different username` });
    } else {
        // Add the user to the room
        rooms[room].push(username);
        socket.join(room);
        socket.username=username
        // Notify others in the room
        io.to(room).emit("userJoined",{username} );
        io.to(room).emit("updateUsers", rooms[room]);
    }
});

    // Handle new messages
    socket.on("sendMessage", ({ room, username, message }) => {
        const timestamp = new Date().toLocaleTimeString();
        io.to(room).emit("newMessage", { username, message, timestamp });
    });

    // Handle user leaving
    socket.on("disconnect", () => {
        const {username}=socket
        // Find the user's room and remove them
        for (const room in rooms) {
            const index = rooms[room].indexOf(socket.username);
            if (index !== -1) {
                rooms[room].splice(index, 1); // Remove the user
                io.to(room).emit("updateUsers", rooms[room]); // Notify all users
                io.to(room).emit("leftUser", {username});
                break;
            }
        }
    });
});

// Start server
server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
