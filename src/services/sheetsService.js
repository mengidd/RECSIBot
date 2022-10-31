import * as dotenv from 'dotenv'
import { google, Auth } from 'googleapis'
import path from 'path'
import models from './../models/index.js'
import { getStockCountChannel } from './stockCounter.js'

dotenv.config()

const { User, Setting } = models
const spreadsheetId = process.env.SPREADSHEET_ID

const auth = new Auth.GoogleAuth({
    keyFile: path.resolve('./') + '/sheets-keys.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
})

const authClient = await auth.getClient()
const googleSheets = google.sheets('v4')
let scheduler

const updateSheets = async () => {
    if (!spreadsheetId) return

    const stockCountChannel = await getStockCountChannel()

    if (!stockCountChannel) return

    const users = await User.findAll({ 
        where: { channelId: stockCountChannel.id },
        order: [['stocks', 'DESC']]
    })

    const lastUserRegistered = await User.findOne({ 
        where: { channelId: stockCountChannel.id },
        order: [['countTimestamp', 'DESC']]
    })

    const lastCountTimestampInStorage = lastUserRegistered.countTimestamp.getTime()
    const lastCountTimestampInSheets = await Setting.getSetting('lastCountTimestampSyncedToSheets')

    // Don't update unless we have some new numbers
    if (lastCountTimestampInSheets && parseInt(lastCountTimestampInSheets) === lastCountTimestampInStorage) return

    const rowValues = users.map(user => [
        user.username,
        user.stocks,
        new Date(user.countTimestamp).toISOString().split('T')[0]
    ])

    await googleSheets.spreadsheets.values.clear({
        auth,
        spreadsheetId,
        range: "Sheet1!A2:C",
    })
    
    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "Sheet1!A:C",
        valueInputOption: "USER_ENTERED",
        resource: {
            values: rowValues,
        },
    })

    console.log('Updated sheet')

    Setting.setSetting('lastCountTimestampSyncedToSheets', lastCountTimestampInStorage)
}

export const startScheduler = () => {
    scheduler = setInterval(updateSheets, (1000 * 60))
}

export const stopScheduler = () => {
    clearInterval(scheduler)
}

export default updateSheets