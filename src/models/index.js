import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import { fileURLToPath } from 'url'
import dbConfig from '../../config/database.js'
import * as dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const basename = path.basename(__filename);
const db = {};

let sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false,
    storage: dbConfig.storage || null,
    port: dbConfig.port || null
})

const modelFiles = fs.readdirSync(__dirname).filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))

for await (const file of modelFiles) {
    const model = (await import(`./${file}`)).default(sequelize)
    db[model.name] = model
}

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db