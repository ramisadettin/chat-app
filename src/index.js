// here in this app we are using another way for initializing express to be suitlbe with socket io module


// important step for initializing web socket communication 
const http = require('http')
const socketIo = require('socket.io')

// setting up the public path 
const path = require('path')
const publicDirectoryPath = path.join(__dirname, '../public')

const express = require('express')
const app = express()

// important step for initializing web socket communication 
const server = http.createServer(app)
const io = socketIo(server)

// using the public path
app.use(express.static(publicDirectoryPath))

const PORT = process.env.PORT || 3001

// require the bad-words module
const Filter = require('bad-words')

// require object from messages.js
const { generateMessage, generateLocation } = require('./utils/messages')

// require object from users.js
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

// here we are calling a function io.on that will be tirggered by an event and our event name is connection meaning that the function will be called whenever a client connects
// socket here is an object that contains information about the connection here we can use methods of socket to communicate with clients, notice that this io.on() will be called everytime there is a connection
io.on('connection', (socket) => {


  socket.on('join', ({ userName, roomName }, callback) => {

    // here we are adding user when joining and we can provide an id by using the socket.id which is the unique identifier of each connection
    const { error, user } = addUser({ id: socket.id, userName, roomName })
    if (error) {
      return callback(error)
    }

    // using the socket.join() method to join a specific room
    socket.join(user.roomName)

    // here we are using the socket's method emit method to send an event to the client , we can send data along with the event by adding extra argument here we are sending a welcome message with date created
    socket.emit('incommingMessage', generateMessage('Admin', 'Welcome!'))

    // socket.broadcast.emit will allow us to emit to all clients except the connected client
    // socket.broadcast.to(roomName).emit will allow us to emit to all clients that are in a specific room except the newly joined client
    socket.broadcast.to(user.roomName).emit('incommingMessage', generateMessage('Admin', `${user.userName} has joined!`))

    io.to(user.roomName).emit('roomData', {
      roomName: user.roomName,
      users: getUsersInRoom(user.roomName)
    })

    // remember the server must always call the callback function as an aknowledgement if the user asked for it
    callback()
  })



  // listening for an sendMessage event from the client, then forward the message to all connected clients
  socket.on('sendMessage', (msg, callback) => {

    const user = getUser(socket.id)
    // here we are using the bad-words module to detect profanity in the message if there is we send error message back to client by calling the callback function
    const filter = new Filter()
    if (filter.isProfane(msg)) {
      return callback('Profanity is not allowed !!')
    }
    // here if we use socket.emit it will only send event to the specific connection we are in
    // inorder to send event to all connections(connected clients) we should use io.emit
    io.to(user.roomName).emit('incommingMessage', generateMessage(user.userName, msg))
    // sending acknowledgement to the client 
    callback()
  })

  socket.on('sendLocation', (location, callback) => {

    const user = getUser(socket.id)
    io.to(user.roomName).emit('incommingLocation', generateLocation(user.userName, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
    // acknowledging the client that the location was shared by calling the callback function
    callback()
  })


  // we use on('disconnect') to listen to disconnecting event and then we notify all  clients that a user has disconnected
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    if (user) {
      io.to(user.roomName).emit('incommingMessage', generateMessage('Admin', `${user.userName} has left`))
      io.to(user.roomName).emit('roomData', {
        roomName: user.roomName,
        users: getUsersInRoom(user.roomName)
      })
    }
  })
})






// here we are using server.listen instead of app.listen because we are working with web socket app
server.listen(PORT, () => {
  console.log(`server is up and running on port ${PORT}`)
})