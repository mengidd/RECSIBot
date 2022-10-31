import { Events } from 'discord.js'
import { updateCountFromMessage } from '../services/stockCounter.js'

export default {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.type !== 0) return
        
        await updateCountFromMessage(message)
    }
}