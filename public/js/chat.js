// establishing the connection from the client side
// here we are using the io() function that we obtained from
// the included script <script src="/socket.io/socket.io.js"></script> in index.html
const socket = io()

// here we are calling Qs.parse() from the query string library that we included in chat.html this will allow us to parse the query string the location.search returns and will create an object of it like so 
// {userName: ?rami, roomName: hello} notice the Qs.parse() doesn't ignore ? character by default so we added ignoreQueryPrefix
const { userName, roomName } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// DOM elements **
const sendLocationButton = document.getElementById('sendLocation')
const sendForm = document.getElementById('sendForm')
const msgInput = document.getElementById('msg')
const sendMsgButton = document.getElementById('sendMsgButton')

// this is the element that will contain the things that will be rendered
const messages = document.getElementById('messages')
const sideBar = document.getElementById('sideBar')

// templates **
// this is the template that contains the html that we want to render inside the messages element
const messageTemplate = document.getElementById('message-template').innerHTML
const locationTemplate = document.getElementById('location-template').innerHTML
const sideBarTemplate = document.getElementById('sideBarTemplate').innerHTML

// adding an event to the send form, and sending the message to the server using socket.emit
sendForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const msg = msgInput.value
  if (msg !== '') {
    // turning of the submit button until we receive an acknowledgement from the server
    sendMsgButton.setAttribute('disabled', 'disabled')

    // here the third argument is a callback function that will be called by the server as an acknowledgement, this function can take as an argumenet message or error message as well
    socket.emit('sendMessage', msg, (error) => {
      sendMsgButton.removeAttribute('disabled')
      if (error) {
        return console.log(error)
      }
      console.log('message delivered')
    })
    // reset the input field and focus on it
    msgInput.value = ''
    msgInput.focus()
  }

})



sendLocationButton.addEventListener('click', () => {
  // we can reach the gelocation services by using navigator, if the geolocation service is not supported by the browser the alert will be shown
  if (!navigator.geolocation) {
    return alert('GeoLocation is not supported by your browser')
  }

  // turning of the submit button until we receive an acknowledgement from the server
  sendLocationButton.setAttribute('disabled', 'disabled')

  // here we use the getCurrentPosition async method to get the postition, notice that we didn't async await or promises because they are not supported in navigator.geolocation, so we are using standard callback style
  navigator.geolocation.getCurrentPosition((position) => {
    const latitude = position.coords.latitude
    const longitude = position.coords.longitude
    // sending an object to server
    socket.emit('sendLocation', { latitude, longitude }, () => {
      sendLocationButton.removeAttribute('disabled')
      console.log('Location Shared')
    })
  })

})

const autoScroll = () => {
  // New message element
  const newMessage = messages.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle(newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = messages.offsetHeight

  // Height of messages container
  const containerHeight = messages.scrollHeight

  // How far have I scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
      messages.scrollTop = messages.scrollHeight
  }
}


// listening for a incommingMessage event from the server here we specify the name of the event as an argument and we specify a function to be called when the event is received, this function can take arguments that represents the data sent from the server
socket.on('incommingMessage', (msg) => {
  console.log(msg)
  // html is the data to be inserted we use Mustache.render to render the html and we ofcourse pass the html to be rendered as an argument and the return of this function is the final html we need to insert
  // here we send an object as an argument for the render function this will allow us to inject the data we want into the template 
  // here we used moment.js to format the timestamp to a valid date
  const html = Mustache.render(messageTemplate, {
    userName: msg.userName,
    msg: msg.text,
    createdAt: moment(msg.createdAt).format('h:mm a')
  })
  // beforeend inserts html inside the element before the end of it
  messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('incommingLocation', (location) => {
  console.log(location)
  const html = Mustache.render(locationTemplate, {
    userName: location.userName,
    locationURL: location.url,
    createdAt: moment(location.createdAt).format('h:mm a')
  })
  messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('roomData', ({ roomName, users }) => {
  const html = Mustache.render(sideBarTemplate, {
    roomName,
    users
  })
  sideBar.innerHTML = html

})

socket.emit('join', { userName, roomName }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})

