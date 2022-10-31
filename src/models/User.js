import { Model, DataTypes } from 'sequelize'

export default (sequelize) => {
    class User extends Model {}

    User.init({
        userId: DataTypes.STRING,
        username: DataTypes.STRING,
        stocks: DataTypes.INTEGER,
        channelId: DataTypes.STRING,
        countTimestamp: {
            type: DataTypes.DATE,
            set(value) {
                if (typeof value === 'number') {
                    this.setDataValue('countTimestamp', new Date(value))
                } else {
                    this.setDataValue('countTimestamp', value)
                }
            }
        },
    }, {
        sequelize,
        modelName: 'User'
    })



    return User;
}