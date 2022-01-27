const generateMessage = (userName, text) => {
  return {
    userName,
    text,
    createdAt: new Date().getTime()
  }
}

const generateLocation = (userName, url) => {
  return {
    userName,
    url,
    createdAt: new Date()
  }
}

module.exports = {
  generateMessage,
  generateLocation
}