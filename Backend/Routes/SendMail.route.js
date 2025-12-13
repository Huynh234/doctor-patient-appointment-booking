const express = require("express");
const SendMailRouter = express.Router();

const {sendEmailAndLog, sendMailController} = require("../Controllers/SendMail.controller");

SendMailRouter.post("/send", sendMailController);

module.exports = SendMailRouter;