import client from './../client.js'
import models from './../models/index.js'

const { MessageHistoryTail, User, Setting, BannedUser } = models

let scheduler
let isCounting = false
let currentStockCountChannel

/**
 * Returns the channel that is currently set as the channel to count in
 */
const getStockCountChannel = async (refreshCache = false) => {
    if (currentStockCountChannel && !refreshCache) return currentStockCountChannel

    const channelSetting = await Setting.getSetting('counterChannelId')
    if (! channelSetting) return null

    const channel = await client.channels.fetch(channelSetting)
    if (! channel) return null

    currentStockCountChannel = channel

    return channel
}

/**
 * Fetch messages that have been sent after the last message we have recorded, 
 * to make sure we are always up to speed with the latest numbers. We do also
 * track numbers with the messageCreate event, but this method is to scan messages
 * in case the bot has been disconnected.
 * 
 * This method runs in a loop until there is no messages left to scan.
 */
const checkAfterLastMessage = async () => {
    if (isCounting === true) return
    isCounting = true

    const messagesFetchConfig = { limit: 100 }
    const stockCountChannel = await getStockCountChannel()

    // If no stock count channel is set, don't do anything
    if (! stockCountChannel) {
        isCounting = false
        return
    }

    // Fetch information about the last message we have scanned
    const [ tail ] = await MessageHistoryTail.findOrCreate({ where: {
        channel: stockCountChannel.id,
    }})

    if (tail.lastMessageId) {
        messagesFetchConfig.after = tail.lastMessageId
    }

    const messages = await stockCountChannel.messages.fetch(messagesFetchConfig)

    if (messages.size === 0) {
        isCounting = false
        return
    }

    await updateCountFromMessages(messages)
    await tail.update({ lastMessageId: messages.first().id })
    isCounting = false

    // Rerun the same method to make sure we have fetched all the messages
    await checkAfterLastMessage()
}

/**
 * This method is only ment to be ran once, and will scan all messages all the way back since the origin of time
 */
const checkBeforeFirstMessage = async () => {
    const messagesFetchConfig = { limit: 100 }
    const stockCountChannel = await getStockCountChannel()

    if (! stockCountChannel) return

    // Fetch information about the first message we have scanned (as in the earliest message we're aware of)
    const [ tail ] = await MessageHistoryTail.findOrCreate({ where: {
        channel: stockCountChannel.id,
    }})

    if (tail.firstMessageId) {
        messagesFetchConfig.before = tail.firstMessageId
    }

    const messages = await stockCountChannel.messages.fetch(messagesFetchConfig)
    if (messages.size === 0) return

    await updateCountFromMessages(messages)
    await tail.update({ firstMessageId: messages.last().id })

    // Run the method again to keep fetching until we reach 0 new messages
    await checkBeforeFirstMessage()
}

const updateCountFromMessages = async (messages) => {
    for (const message of messages.values()) {
        await updateCountFromMessage(message)
    }
}

/**
 * Checks and updates the users count from a message object
 */
const updateCountFromMessage = async (message) => {
    if (message.author.bot === true) return

    // Check if the message starts with a number. Any number like 1000, 10 000, 100.000, 1.000.001, 200k will work
    const numberMatch = message.content.match(/^(\d+((\.| )\d+)*)k?/i)
    if (numberMatch === null) return
    
    const isBanned = await BannedUser.findOne({ where: { userId: message.author.id }})
    if (isBanned) return

    const [ user ] = await User.findOrCreate({
        where: {
            userId: message.author.id,
            channelId: message.channelId
        },
        default: {
            username: message.author.username,
        }
    })

    // If we already had a count that was posted later than the candidate, just return
    if (user.countTimestamp >= message.createdTimestamp) return

    const number = parseInt(
        numberMatch[0]
            .replace(/k/i, '000')
            .replace('.', '')
            .replace(' ', '')
        )

    if (number >= 420625659) return // Skip guaranteed troll

    if (number === 0) {
        user.destroy()
        return
    }

    await user.update({
        stocks: number,
        countTimestamp: message.createdTimestamp,
        username: message.author.username
    })
}

const checkMessageHistory = async () => {
    await checkBeforeFirstMessage()
    await checkAfterLastMessage()
}

const startScheduler = async () => {
    console.log('Stock counter scheduler started')
    scheduler = setInterval(checkAfterLastMessage, 60000)
}

const stockCounter = {
    init: () => {
        console.log('Stock counter init')

        let readyCheckTimer = setInterval(() => {
            if (client.isReady()) {
                clearInterval(readyCheckTimer)
                checkMessageHistory()
                startScheduler()
            }
        }, 1000)
    }
}

export default stockCounter
export { 
    updateCountFromMessage,
    updateCountFromMessages,
    checkMessageHistory,
    getStockCountChannel,
}