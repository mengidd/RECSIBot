import { SelectMenuBuilder } from 'discord.js'
import models from '../models/index.js'
import { checkMessageHistory, getStockCountChannel } from '../services/stockCounter.js';

const { Setting } = models;

export default {
    data: new SelectMenuBuilder()
        .setCustomId('channelId')
        .setPlaceholder('Velg kanal'),
    async handle(interaction, client) {
        const [ channelSetting ] = await Setting.findOrCreate({ where: { key: 'counterChannelId' }})
        channelSetting.update({ value: interaction.values[0]})

        await interaction.update({ content: `<#${interaction.values[0]}> valgt`, components: [] });
        
        await getStockCountChannel(true) // Passing true will reset the local cache of which channel we're currently counting
        checkMessageHistory()
    }
}