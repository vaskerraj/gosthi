require("dotenv").config();

module.exports = {
    PORT : process.env.APP_PORT,
    SECRET : process.env.APP_SECRET,
    EMAIL_SMTP_ADD : process.env.EMAIL_SMTP_ADD,
    EMAIL_SMTP_PORT : process.env.EMAIL_SMTP_PORT,
    EMAIL_SMTP_USER : process.env.EMAIL_SMTP_USER,
    EMAIL_SMTP_PASS : process.env.EMAIL_SMTP_PASS,
}
