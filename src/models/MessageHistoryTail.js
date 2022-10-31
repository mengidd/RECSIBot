import { Model, DataTypes } from 'sequelize'

export default (sequelize) => {
    class MessageHistoryTail extends Model {}

    MessageHistoryTail.init({
        channel: DataTypes.STRING,
        firstMessageId: DataTypes.STRING,
        lastMessageId: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'MessageHistoryTail'
    })

    return MessageHistoryTail;
}