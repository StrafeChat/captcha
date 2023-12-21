# Captcha Provider

## Requirements

This captcha middleware requires the express session middleware to be initialized before it is used. It can be installed using `npm install express-session`. For configuration, please refer to the [express-session documentation](https://www.npmjs.com/package/express-session).

## Initialisation

```javascript
const { CaptchaGenerator, middleware } = require("@strafechat/captcha");

const express = require("express");
const app = express();

// initialise express-session middleware here

// the generator can be used separately from the middleware
const generator = new CaptchaGenerator();
app.use(middleware(generator));
```

## Usage

After the middleware has been added, you can access the `generateCaptcha` and `verifyCaptcha` functions on the request object.

```javascript
app.get("/captcha", async (req, res) => {
  res.send({ image: await req.generateCaptcha() });
});
app.post("/captcha", async (req, res) => { // this would require the body-parser middleware
  res.send({ success: req.verifyCaptcha(req.body.captcha) });
});
```
