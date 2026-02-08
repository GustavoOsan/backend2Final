const nodemailer = require('nodemailer');
require('dotenv').config();

const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
    }
});

const sendMail = async ({ to, subject, html }) => {
    try {
        const result = await transport.sendMail({
            from: `Ecommerce Coder <${process.env.NODEMAILER_USER}>`,
            to: to,
            subject: subject,
            html: html
        });
        return result;
    } catch (error) {
        console.log("Error enviando email: ", error);
        throw error;
    }
}

module.exports = { sendMail };