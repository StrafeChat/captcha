const { createCanvas, loadImage } = require('canvas');
const path = require("path");
const TimeoutMap = require('./TimeoutMap');
const crypto = require("crypto");

class CaptchaGenerator {


  fonts = ["Arial", "Roboto", "Times new Roman", "Courier", "Impact", "Comic Sans MS"]
  constructor(height = 50000, width = 600) {
    this.width = width;
    this.height = height;
  }

  #randomString(length = 5) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(crypto.randomInt(0, charactersLength - 1));
      counter += 1;
    }
    return result;
  }
  #randomFont() {
    return this.fonts[crypto.randomInt(0, this.fonts.length - 1)];
  }

  generate() {
    return new Promise(res => {
      const string = this.#randomString(6);

      const canvas = createCanvas(this.width, this.height);
      const ctx = canvas.getContext("2d");

      const drawLetter = (string, currX, currY, ctx) => {
        ctx.font = "50px" + this.#randomFont();
        ctx.fillStyle = "#c6c6c6";

        const originalY = currY;
        currY += (crypto.randomBytes(4).readUInt32LE() / 0xffffffff) * 5;

        ctx.fillText(string[0], currX, currY);

        const metrics = ctx.measureText(string[0]);
        currX += 3 + metrics.width;
        const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;;

        if ((crypto.randomBytes(4).readUInt32LE() / 0xffffffff) > 0.5) {
          ctx.beginPath();
          ctx.strokeStyle = "white";
          ctx.moveTo(currX - (4 + metrics.width), currY - height / 2);
          ctx.lineTo(currX + 1, currY - height / 2);
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.closePath();
        }

        if (string.length > 1) return drawLetter(string.slice(1), currX, originalY, ctx);
        return { currX, currY };
      }

      loadImage(path.join(__dirname, "./assets/captcha-bg.png")).then(image => {
        const diff = this.width / image.width;
        ctx.drawImage(image, 0, 0, this.width, this.height * diff);

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.rect(0, 0, this.width, this.height);

        drawLetter(string, 10 + ((crypto.randomBytes(4).readUInt32LE() / 0xffffffff) * 10), 40 + ((crypto.randomBytes(4).readUInt32LE() / 0xffffffff) * 20), ctx);

        res({ image: canvas.toDataURL(), string: string });
      });
    });
  }
}

const middleware = (generator) => {
  const sessions = new TimeoutMap(300_000);
  const mw = (req, _res, next) => {
    req.sessions = sessions;
    req.verifyCaptcha = (string) => {
      const sessionID = req.headers["session-id"];
      const valid = (sessions.get(sessionID)?.value == string);
      if (valid) sessions.delete(sessionID);
      return valid;
    }
    req.generateCaptcha = async () => {
      const captcha = await generator.generate();
      req.sessions.set(req.sessionID, captcha.string);
      return captcha.image;
    }
    next();
  }
  return mw;
}

module.exports = { CaptchaGenerator, middleware }
