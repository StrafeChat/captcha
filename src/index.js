const { createCanvas, loadImage } = require('canvas');
const path = require("path");

class CaptchaGenerator {
  width = 500;
  height = 100;

  fonts = ["Arial", "Roboto", "Times new Roman", "Courier", "Impact", "Comic Sans MS"]
  constructor(height=100, width=300) {
    this.width = width;
    this.height = height;
  }

  #randomString(length=5) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
  #randomFont() {
    return this.fonts[Math.floor(Math.random() * this.fonts.length)];
  }

  generate() {
    return new Promise(res => {
      const string = this.#randomString(6);

      const canvas = createCanvas(this.width, this.height);
      const ctx = canvas.getContext("2d");

      const drawLetter = (string, currX, currY, ctx) => {
        ctx.font = "30px " + this.#randomFont();
        ctx.fillStyle = "white";

        const originalY = currY;
        currY += Math.random() * 10;

        ctx.fillText(string[0], currX, currY);
        
        const metrics = ctx.measureText(string[0]);
        currX += 3 + metrics.width;
        const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;;

        if (Math.random() > 0.5) {
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

      loadImage(path.join(__dirname, "./assets/strafechat.png")).then(image => {
        const diff = this.width / image.width;
        ctx.drawImage(image, 0, 0, this.width, this.height * diff);

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.rect(0, 0, this.width, this.height);

        const { currX, currY } = drawLetter(string, 10 + (Math.random() * 10), 40 + (Math.random() * 15), ctx);

        res({ image: canvas.toDataURL(), string: string });
      });
    });
  }
}

const middleware = (generator) => {
  const mw = (req, res, next) => {
    req.verifyCaptcha = (string) => {
      return req.session.captchaString === string;
    }
    req.generateCaptcha = async () => {
      const captcha = await generator.generate();
      req.session.captchaString = captcha.string;
      return captcha.image;
    }
    next();
  }
  return mw;
}

module.exports = { CaptchaGenerator, middleware }
