const log = console.log;

const http = require('http');
const path = require('path');
const express = require("express");
const socketio = require('socket.io');

const formatmsg = require('./utils/messages')
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users');
const users = require('./utils/users');

const app = express();
const server = http.createServer(app);

const io = socketio(server);
app.use(express.static(path.join(__dirname,'/public')))

const bot = 'ChatBot';
//run when client connects
//listening to an event
try{
    io.on('connection',socket => {
        socket.on('joinRoom', ({username,room}) => {
            const user = userJoin(socket.id,username,room);
            socket.join(user.room);
            socket.emit('message',formatmsg(bot,'Welcome to the chat!')); //sending to the client side in main.js

            //Broadcasting a user connection
            socket.broadcast.to(user.room).emit('message',formatmsg(bot, `${user.username} has joined the chat!`)); //except the client

            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users:getRoomUsers(user.room)
            });
        });

        //listen fot chatmessage
        socket.on('chatmsg',(msg) => {
            const user = getCurrentUser(socket.id);
            io.to(user.room).emit('message',formatmsg(user.username,msg));
        });
        
        //When a user disconnects
        socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if(user){
            io.to(user.room).emit('message',formatmsg(bot,`${user.username} has left the chat!`));

            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users:getRoomUsers(user.room)
            });
        }
        });
    });

    const PORT = process.env.port || 4000;
    server.listen(PORT , () => log(`Server is running at ${PORT}`));
}
catch{
    log("No internet connection!");
}
