import { Collection, Routes, REST } from 'discord.js'
import path from 'path'
import fs from 'fs'

const commandsFolder = path.resolve('./src/commands')

const registerCommands = async (client) => {
    client.commands = new Collection()
    client.commandsArray = []

    const commandFiles = fs.readdirSync(commandsFolder).filter(file => (file.indexOf('.') !== 0) && (file.slice(-3) === '.js'))

    for await (const file of commandFiles) {
        const command = (await import(`${commandsFolder}/${file}`)).default
        client.commands.set(command.data.name, command)
        client.commandsArray.push(command.data.toJSON())
    }

    const rest = new REST().setToken(client.token)

    try {
        console.log('Refreshing application commands')

        await rest.put(Routes.applicationGuildCommands(client.clientId, client.guildId), {
            body: client.commandsArray
        })
    } catch (error) {
        console.error(error)
    }
}

export default registerCommands