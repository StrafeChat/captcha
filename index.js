module.exports = require("./src/index.js");

/*
// For testing
const { CaptchaGenerator, middleware } = require("./src/index.js");

const generator = new CaptchaGenerator();

const express = require('express')
const path = require("path");
const app = express()
const port = 3000

var session = require('express-session');
app.use(session({
  secret: "captcha",
  saveUninitialized: true
}));
app.use(middleware(generator));
var bodyParser = require('body-parser')
app.use(bodyParser.json())

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./src/assets/index.html"));
});
app.get("/captcha", async (req, res) => {
  res.send({ image: await req.generateCaptcha() });
});
app.post("/captcha", async (req, res) => {
  res.send({ success: req.verifyCaptcha(req.body.captcha) });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
*/
