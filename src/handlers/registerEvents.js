import fs from 'fs'
import path from 'path'

const eventsFolder = path.resolve('./src/events')

const registerEvents = async (client) => {
    const eventFiles = fs.readdirSync(eventsFolder).filter(file => (file.indexOf('.') !== 0) && (file.slice(-3) === '.js'))

    for await (const file of eventFiles) {
        const event = (await import(`${eventsFolder}/${file}`)).default
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client))
        } else {
            client.on(event.name, (...args) => event.execute(...args, client))
        }
    }
}

export default registerEvents