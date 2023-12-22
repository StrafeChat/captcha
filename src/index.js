const { createCanvas, loadImage } = require('canvas');
const path = require("path");

class CaptchaGenerator {
  width = 500;
  height = 100;

  backgroundImage = false;
  textColour = "white";

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
        ctx.fillStyle = this.textColour || "white";

        const originalY = currY;
        currY += Math.random() * 10;

        ctx.fillText(string[0], currX, currY);
        
        const metrics = ctx.measureText(string[0]);
        currX += 3 + metrics.width;
        const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;;

        if (Math.random() > 0.5) {
          ctx.beginPath();
          ctx.strokeStyle = this.textColour || "white";
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

        if (this.backgroundImage) {
          ctx.fillStyle = "#242424";
          ctx.fillRect(0, 0, this.width, this.height);

          const diff = this.height / image.height;
          ctx.drawImage(image, (this.width - image.width * diff) / 2, 0, image.width * diff, this.height);
        } else {
          const data = ctx.createImageData(this.width, this.height);
          const buffer32 = new Uint32Array(data.data.buffer);
          const len = buffer32.length;

          for (let i = 0; i < len; i++) {
            if (Math.random() < 0.5) continue;
            buffer32[i] = 0xff000000;
            
          }

          ctx.fillStyle = "#0000";
          ctx.fillRect(0, 0, this.width, this.height)

          ctx.putImageData(data, 0, 0);
        }

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, this.width, this.height);

        const { currX, currY } = drawLetter(string, 10 + (Math.random() * 30), 40 + (Math.random() * 25), ctx);

        const finalCanvas = createCanvas(this.width, this.height);
        const fctx = finalCanvas.getContext("2d");

        fctx.fillStyle = "white";
        fctx.fillRect(0, 0, this.width, this.height);

        fctx.drawImage(canvas, 0, 0, this.width, this.height);

        res({ image: finalCanvas.toDataURL(), string: string });
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
