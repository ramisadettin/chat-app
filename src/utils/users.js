// useres array is an array of user objects each object has the following
// {id, userName, roomName}
const users = []

// add user to users array
const addUser = ({ id, userName, roomName }) => {
  // Clean the data
  userName = userName.trim().toLowerCase()
  roomName = roomName.trim().toLowerCase()

  // Validate Data
  if (!userName || !roomName) {
    return {
      error: 'Username and room are required!'
    }
  }
  // Check for existing user
  const existingUser = users.find((user) => {
    return user.roomName === roomName && user.userName === userName
  })
  if (existingUser) {
    return {
      error: 'Username is in use!'
    }
  }
  // store user
  const user = { id, userName, roomName }
  users.push(user)
  return { user }
}

// remove user from users array
const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id
  })
  if (index !== -1) {
    return users.splice(index, 1)[0]
  }
}

// get a user from the array 
const getUser = (id) => {
  return users.find((user) => user.id === id)
}

// get users in a certain room
const getUsersInRoom = (roomName) => {
  return users.filter((user) => user.roomName === roomName.trim().toLowerCase())
}

module.exports = {addUser, removeUser, getUser, getUsersInRoom }


