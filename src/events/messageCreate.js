import { Events } from 'discord.js'
import { updateCountFromMessage } from '../services/stockCounter.js'
import { getStockCountChannel } from '../services/stockCounter.js'

export default {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.type !== 0) return
        
        const stockCountChannel = await getStockCountChannel()
        if (message.channel.id !== stockCountChannel.id) return
        
        await updateCountFromMessage(message)
    }
}