import { Model, DataTypes } from 'sequelize'

export default (sequelize) => {
    class Setting extends Model {}

    Setting.init({
        key: DataTypes.STRING,
        value: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Setting'
    })

    Setting.getSetting = async function (key, fallback = null) {
        const entry = await this.findOne({ where: { key }})

        if (!entry) return fallback

        return entry.value
    }

    Setting.setSetting = async function (key, value) {
        const [ entry ] = await this.findOrCreate({ where: {key} , value })

        entry.update({ value })
    }

    return Setting;
}