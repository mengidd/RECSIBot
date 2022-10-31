import { Collection } from 'discord.js'
import fs from 'fs'
import path from 'path'

const selectMenusFolder = path.resolve('./src/selectMenus')

const registerSelectMenus = async (client) => {
    client.selectMenus = new Collection()

    const selectMenuFiles = fs.readdirSync(selectMenusFolder).filter(file => (file.indexOf('.') !== 0) && (file.slice(-3) === '.js'))

    for await (const file of selectMenuFiles) {
        const selectMenu = (await import(`${selectMenusFolder}/${file}`)).default
        client.selectMenus.set(selectMenu.data.data.custom_id, selectMenu)
    }
}

export default registerSelectMenus