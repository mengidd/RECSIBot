import registerSelectMenus from './handlers/registerSelectMenus.js'
import registerCommands from './handlers/registerCommands.js'
import registerEvents from './handlers/registerEvents.js'
import stockCounter from './services/stockCounter.js'
import models from './models/index.js'
import client from './client.js'
import { startScheduler as startSheetsScheduler } from './services/sheetsService.js'

await models.sequelize.sync()
await registerCommands(client)
await registerEvents(client)
await registerSelectMenus(client)

stockCounter.init()

client.login(client.token)
    .then(() => {
        console.log('Logged in successfully')
        startSheetsScheduler()
    })
    .catch((error) => {
        console.error(error)
        process.exit();
    })