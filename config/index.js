require("dotenv").config();

module.exports = {
    PORT : process.env.APP_PORT,
    SECRET : process.env.APP_SECRET,
    APP_URL : process.env.APP_BASE_URL,

    MYSQL_HOST : process.env.MYSQL_HOST,
    MYSQL_USER : process.env.MYSQL_USER,
    MYSQL_PASS : process.env.MYSQL_PASS,
    MYSQL_DATABASE : process.env.MYSQL_DATABASE,

    EMAIL_SMTP_ADD : process.env.EMAIL_SMTP_ADD,
    EMAIL_SMTP_PORT : process.env.EMAIL_SMTP_PORT,
    EMAIL_SMTP_USER : process.env.EMAIL_SMTP_USER,
    EMAIL_SMTP_PASS : process.env.EMAIL_SMTP_PASS,
}
