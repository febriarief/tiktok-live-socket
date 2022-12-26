import { WebcastPushConnection } from 'tiktok-live-connector'
import { EventEmitter } from 'events'

export class TikTokLiveConnector extends EventEmitter
{
    _webcastPushConnection = {}

    constructor()
    {
        super()
    }

    startServer(username) {
        this._webcastPushConnection[username] = new WebcastPushConnection(username)

        this._webcastPushConnection[username].connect().then(() => {
            console.log(`[SERVER INFO] Connection to room ${username} success`)
            this.emit('connection', { room: username, status: 'connected', message: null })
        }).catch(err => {
            console.log(err)
            console.log(`[SERVER INFO] Connection to room ${username} failed`)
            this.emit('connection', { room: username, status: 'failed', message: err })
        })

        this._webcastPushConnection[username].on('chat', data => {
            let message = ''
            if (data.comment && data.comment.length > 30) {
                message = data.comment.substring(0, 30).concat('...')
            } else {
                message = data.comment
            }

            console.log(`[ROOM - ${username}] New message: ${message}`)
            this.emit('chats', { room: username, data })
        })
        
        this._webcastPushConnection[username].on('gift', data => {
            console.log(`[ROOM - ${username}] New gift: ${data.uniqueId} give ${data.repeatCount}x ${data.giftName}`)
            this.emit('gifts', { room: username, data })
        })
    
        this._webcastPushConnection[username].on('streamEnd', () => {
            console.log(`[ROOM - ${username}] Live ended`)
            this.emit('streamEnd', { room: this.username })
        })
    }

    disconnect(username) {
        try {
            if (this._webcastPushConnection[username]) {
                console.log(`[ROOM - ${username}] Disconnect room by client`)
                this._webcastPushConnection[username].disconnect()
            }
        } catch(e) {
            // Eaaaaaaaa
        }
    }
}
