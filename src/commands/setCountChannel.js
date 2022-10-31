import { ActionRowBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import models from '../models/index.js'
import setCountChannel from '../selectMenus/setCountChannel.js';

const { Setting } = models;

export default {
    data: new SlashCommandBuilder()
        .setName('set-count-channel')
        .setDescription('Lar deg velge hvilken kanal som skal overvåkes for antall aksjer')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const channelSetting = await Setting.getSetting('counterChannelId')

        const allChannels = interaction.guild.channels.cache
            .filter(channel => channel.type === 0) // Only get text channels
            .map(channel => ({
                label: '#' + channel.name,
                value: channel.id,
                default: channelSetting !== null && channel.id === channelSetting.id
            }))

        const select = new ActionRowBuilder()
            .addComponents(setCountChannel.data.setOptions(allChannels))

        await interaction.reply({
            content: `Velg en kanal`,
            components: [select],
            ephemeral: true,
        })
    }
}