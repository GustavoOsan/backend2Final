const mongoose = require('mongoose');
require('dotenv').config();

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Conectado a la Base de Datos exitosamente");
    } catch (error) {
        console.error("⛔ Error al conectar a la Base de Datos:", error);
        process.exit(1);
    }
};

module.exports = { dbConnection };