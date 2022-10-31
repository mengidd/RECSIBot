import { Model, DataTypes } from 'sequelize'

export default (sequelize) => {
    class BannedUser extends Model {}

    BannedUser.init({
        userId: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'BannedUser'
    })

    return BannedUser;
}