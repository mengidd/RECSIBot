import * as dotenv from 'dotenv'
import path from 'path';

dotenv.config()

export const environments = {
    "development": {
        "host": "",
        "database": "",
        "username": "",
        "password": "",
        "dialect": "sqlite",
        "storage": path.resolve('./') + '/sqlite/database.sqlite',
    },
    "production": {
        "host": process.env.DB_HOST,
        "database": process.env.DB_NAME,
        "user": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "port": process.env.DB_PORT || '3306',
        "dialect": "mysql"
    }
}

const config = environments[process.env.ENV]

export default config