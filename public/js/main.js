// const e = require("cors");

const log = console.log;
const socket = io();
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const chatform = document.getElementById('chat-form');
const chatmessage = document.querySelector('.chat-messages');
socket.on('message', message => { //catching on the client side
    log(`${message}`);
    outputmsg(message);
    //scroll down to the new message
    chatmessage.scrollTop = chatmessage.scrollHeight;
});

const {username,room} = Qs.parse(location.search, {
    ignoreQueryPrefix:true
});

socket.emit('joinRoom',{username,room});

//Get room and users
socket.on('roomUsers', ({room,users}) => {
    outputRoomName(room);
    outputUsers(users);
})
//Message submission
chatform.addEventListener('submit' , (e) => {
    e.preventDefault(); //dont save in a file

    //targetting the 'msg' element in chat.html,get msg text
    const msg = e.target.elements.msg.value;

    //emitting msg to the server,need to be catched in server.js
    socket.emit('chatmsg',msg);

     //clear sent msg
     e.target.elements.msg.value = '';
     e.target.elements.msg.focus();
});

//output msg to dom
function outputmsg(message) {
    //This function adds up the message sent by the user
    const div = document.createElement('div'); //creates an element
    div.classList.add('message'); //adding a class 'message' to div
    //creating the HTMl format for message and displaying it
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    //Adding this div to the 'chat-messages' class
    document.querySelector('.chat-messages').appendChild(div);
}


//Add roomname to DOM
function outputRoomName(room){
    roomName.innerText = room;

}

//Add users to Dom
function outputUsers(users){
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}