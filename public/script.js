const socket = io();

const usernameInput = document.getElementById("username");
const roomSelect = document.getElementById("room");
const joinRoomBtn = document.getElementById("join-room");
const chatRoom = document.getElementById("chat-room");
const roomSelection = document.getElementById("chat-app");
const messageInput = document.getElementById("message");
const sendMessageBtn = document.getElementById("send-message");
const messagesDiv = document.getElementById("messages");
const usersList = document.getElementById("users");
const currentRoom = document.getElementById("current-room");
const currentUser = document.getElementById("current-user");
const CreateButton = document.getElementById("create-new-room")
const NewRoomName = document.getElementById("new-room")

let username;
let room;
let currentLoggedUser;

// Event to join room
joinRoomBtn.addEventListener("click", () => {
    username = usernameInput.value;
    currentLoggedUser=username
    room = roomSelect.value;
    if (!username || !room) return alert("Please enter a username and select a room.");
    socket.emit("joinRoom", { username, room });
    socket.on("error", ({ message }) => {
        alert(message); // Display the error message to the user
    });
    roomSelection.classList.add("hidden");
    chatRoom.classList.remove("hidden");
    currentRoom.textContent = room;
});

sendMessageBtn.addEventListener("click", () => {
    const message = messageInput.value;
    if (!message) {
        alert("Message box can't be empty");
        return};
    socket.emit("sendMessage", { room, username, message });
    messageInput.value = "";
});

socket.on("newMessage", ({ username, message, timestamp }) => {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message");
    // Create a message container for left and right alignments
    const messageContent = document.createElement("div");
    messageContent.classList.add(username === currentLoggedUser ? 'message-right' : 'message-left');
    messageContent.textContent = `${message}`;
     // Add the timestamp to the message
     const UserDiv = document.createElement("div");
     UserDiv.classList.add("user");
     UserDiv.textContent = (username === currentLoggedUser ? `You : ${timestamp}` : `${username} : ${timestamp}`);
    // Add the message to the div
    msgDiv.appendChild(UserDiv)
    msgDiv.appendChild(messageContent);
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on("userJoined",({username})=>{
    const joinedDiv = document.createElement("div");
    joinedDiv.className = "joinedDiv"
    joinedDiv.textContent =`${username} has joined the room`
    messagesDiv.append(joinedDiv);
})

// on user exit
socket.on("leftUser",({username})=>{
    const LeftDiv = document.createElement("div");
    LeftDiv.className = "leftDiv"
    LeftDiv.textContent =`${username} has left the room`
    messagesDiv.append(LeftDiv);
})

socket.on("updateUsers", (users) => {
    usersList.innerHTML = ""; 
    users.forEach((user) => {
        const li = document.createElement("li");
        li.className = "userList";
        li.textContent = user;
        usersList.appendChild(li);
    });
});
// function to load the option in the room selection categories
function loadOptions() {
    const savedOptions = JSON.parse(localStorage.getItem('selectionOptions')) || [];
    savedOptions.forEach(option => {
      const newOption = document.createElement('option');
      newOption.value = option;
      newOption.textContent = option;
      roomSelect.appendChild(newOption);
    });
  }
  CreateButton.addEventListener("click",addOption)
  
  // Function to add a new option
  function addOption() {
    const newOptionValue = NewRoomName.value.trim();
    if (!newOptionValue){
        alert("Please enter a room name")
    return }; // Do nothing if input is empty

    // Append new option to the select element
    const newOption = document.createElement('option');
    newOption.value = newOptionValue;
    newOption.textContent = newOptionValue;

    // Save the new option to localStorage
    const savedOptions = JSON.parse(localStorage.getItem('selectionOptions')) || [];
    const roomExist=savedOptions.includes(newOptionValue)
    if(roomExist) {
    NewRoomName.value = '';
    alert( `room with ${newOptionValue} already exists please create room with different name`)
    return
    }
    alert(`Your room with ${newOptionValue} is created`)
    roomSelect.appendChild(newOption);
    savedOptions.push(newOptionValue);
    localStorage.setItem('selectionOptions', JSON.stringify(savedOptions));
    // Clear the input field
    NewRoomName.value = '';
  }
  // Load options on page load
  window.onload = loadOptions;
  