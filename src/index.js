const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')

const app = express();
const server = http.createServer(app)
const io = new socketio.Server(server)

const publicDir = path.join(__dirname, "../public")
const port = 3000;

app.use(express.static(publicDir));

io.on('connection', (socket) => {
    console.log('a user connected.')

    socket.on('join', (options, callback) => {
        const {error, user} = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage({
            username:'Admin',
            message:'Welcome!'
        }))
        socket.broadcast.to(user.room).emit('message', generateMessage({
            username:'Admin',
            message:`${user.username} has joined the chat!`
        }))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!');
        }

        const user = getUser(socket.id);

        io.to(user.room).emit('message', generateMessage({
            username: user.username,
            message
        }))
        callback();
    })

    socket.on('sendLocation', (coordinate, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage', generateLocationMessage({
            username: user.username,
            lat: coordinate.latitude,
            long: coordinate.longitude
        }))
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage({
                username: "Admin",
                message: `${user.username} has left!`
            }))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }

    })
});



server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
});