import * as dotenv from 'dotenv'
import { Client, GatewayIntentBits } from 'discord.js'

dotenv.config()

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

client.token = process.env.TOKEN
client.clientId = process.env.CLIENT_ID
client.guildId = process.env.GUILD_ID

export default client