const { format } = require("util");
const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const Twilio = require("twilio");
const Telegraf = require("telegraf");

const checkConfig = (obj) => {
  if (obj instanceof Object) {
    for (const [key, value] of Object.entries(obj)) {
      if (value instanceof Object) {
        checkConfig(value);
      } else if (value === undefined) {
        console.error(`${key} is not set!`);
        process.exit(1);
      }
    }
  }
};

const escapeHTML = (str) =>
  str.replace(/[\u00A0-\u9999<>&](?!#)/gim, function (i) {
    return "&#" + i.charCodeAt(0) + ";";
  });

const SMS_TEMPLATE = `📨 <b>%s</b> ➡ <b>%s</b>
<code>%s</code>`;

dotenv.config();

const config = {
  twilio: {
    accountSid: process.env.ACCOUNT_SID,
    authToken: process.env.AUTH_TOKEN,
    shouldValidate: process.env.NODE_ENV === "production" || false,
  },
  telegram: {
    botToken: process.env.BOT_TOKEN,
    chatId: process.env.CHAT_ID,
  },
};

checkConfig(config);

const twilio = Twilio(config.twilio.accountSid, config.twilio.authToken);
const validate = Twilio.webhook(config.twilio.authToken, {
  validate: config.twilio.shouldValidate,
});

const tg = new Telegraf.Telegram(config.telegram.botToken);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/sms", validate, async (req, res, next) => {
  const { From, To, Body } = req.body;
  console.log(req.body);

  try {
    await tg.sendMessage(
      config.telegram.chatId,
      format(SMS_TEMPLATE, escapeHTML(From), escapeHTML(To), escapeHTML(Body)),
      {
        parse_mode: "HTML",
      }
    );
  } catch (err) {
    return next(err);
  }

  const response = new Twilio.twiml.MessagingResponse();

  return res.status(200).send(response.toString());
});

app.get("/numbers", async (req, res, next) => {
  try {
    const numbers = await twilio.incomingPhoneNumbers.list();
    console.log(numbers);
    return res.status(200).json(numbers.map((phone) => phone.phoneNumber));
  } catch (err) {
    next(err);
  }
});

app.listen(3000, () => console.log("ready at :3000"));
