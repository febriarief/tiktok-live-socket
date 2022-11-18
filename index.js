const { WebcastPushConnection } = require('tiktok-live-connector'),
http = require('http'),
express = require('express'),
socketio = require('socket.io'),
app = express()
server = http.createServer(app),
io = socketio(server),
events = require('events')


let tiktokLiveConnection = undefined,
serverEventCommand = new events.EventEmitter()


io.on('connection', (socket) => {    
    socket.on('start', (username) => {
        serverEventCommand.emit('serverStart', username)
    }) 

    socket.on('end_live', () => {
        serverEventCommand.emit('serverEnd')
    })    
})


serverEventCommand.on('serverStart', (username) => {
    if (tiktokLiveConnection) tiktokLiveConnection.disconnect()

    tiktokLiveConnection = new WebcastPushConnection(username)
    serverEventCommand.emit('serverReady')
})

serverEventCommand.on('serverReady', () => {
    console.log('SERVER STARTED!')
    
    tiktokLiveConnection.connect().then(state => {
        console.log('CONNECTION SUCCESS!')
        io.emit('connection', { status: 'connected', message: null })
    }).catch(err => {
        console.log('CONNECTION FAILED!')
        io.emit('connection', { status: 'failed', message: err })
    })
    
    tiktokLiveConnection.on('chat', data => {
        console.log('[NEW CHAT] ' + data.comment)
        io.emit('chats', data)
    })
    
    tiktokLiveConnection.on('gift', data => {
        console.log(`${data.uniqueId} give ${data.repeatCount}x ${data.giftName}`)
        io.emit('gifts', data)
    })
})

serverEventCommand.on('serverEnd', () => {
    console.log('SERVER END!')

    if (tiktokLiveConnection) {
        tiktokLiveConnection.disconnect()
        tiktokLiveConnection = undefined
    }

    io.emit('connection', { status: 'end', message: 'Live ended' })
})

console.log('SERVER LISTEN ON PORT : 3000')
server.listen(3000)