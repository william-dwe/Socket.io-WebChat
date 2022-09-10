const generateMessage = ({username, message}) => {
    return {
        username,
        message,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = ({ username, lat, long }) => {
    const url = `https://google.com/maps?q=${lat},${long}`
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}