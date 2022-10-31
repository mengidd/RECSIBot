import { Events } from 'discord.js'

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log('Client is ready')
    }
}