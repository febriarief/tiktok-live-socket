import { TikTokLiveConnector } from './tiktok-live-connector.js'
import * as http from 'http'
import express from 'express'
import { Server } from 'socket.io'


var app = express()
var server = http.createServer(app)
var io = new Server(server)
var tiktokLiveConnector = {}

io.on('connection', (socket) => {
    var currentRoomId

    socket.on('start', (username) => {
        socket.join(username)
        currentRoomId = username

        tiktokLiveConnector[currentRoomId] = new TikTokLiveConnector()
        tiktokLiveConnector[currentRoomId].startServer(username)

        tiktokLiveConnector[currentRoomId].on('connection', ({ room, status, message }) => {
            io.to(room).emit('connection', { status, message })
        })
    
        tiktokLiveConnector[currentRoomId].on('chats', ({ room, data }) => {
            io.to(room).emit('chats', data)
        })
    
        tiktokLiveConnector[currentRoomId].on('gifts', ({ room, data }) => {
            io.to(room).emit('gifts', data)
        })
    
        tiktokLiveConnector[currentRoomId].on('streamEnd', ({ room }) => {
            io.to(room).emit('connection', { status: 'end', message: 'Live ended' })
        })
    })
    
    socket.on('disconnect', () => {
        if (tiktokLiveConnector[currentRoomId]) tiktokLiveConnector[currentRoomId].disconnect(currentRoomId)
    })
})


const PORT = 40000
server.listen(PORT)
console.log('SERVER LISTEN ON PORT : ' + PORT)
