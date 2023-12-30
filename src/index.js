const { createCanvas, loadImage } = require('canvas');
const path = require("path");
const crypto = require("crypto");

/**
 * @class CaptchaGenerator
 *
 * Captcha generator class
 * @property {number} width=300 The width of the captcha image
 * @property {number} height=100 The height of the captcha image
 * 
 * @property {boolean} backgroundImage=false Whether or not to use the supplied background image
 * @property {string} textColour="white" The colour of the captcha text
 * @property {string} fontSize="30px" The font size of the captcha text
 * @property {string[]} fonts=["Arial", "Roboto", "Times new Roman", "Courier", "Impact", "Comic Sans MS"] The fonts to use for the characters of the captcha text
 */
class CaptchaGenerator {
  width = 300;
  height = 100;

  backgroundImage = false;
  textColour = "white";

  fonts = ["Arial", "Roboto", "Times new Roman", "Courier", "Impact", "Comic Sans MS"];
  fontSize = "30px";
  constructor(height=100, width=300, fontSize="30px", fonts=[]) {
    this.width = width;
    this.height = height;

    this.fontSize = fontSize;
    if (fonts.length > 0) this.fonts = fonts;
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

  #loadImage(url) {
    return new Promise((res, rej) => {
      loadImage(url).then(image => res(image)).catch(err => rej(err));
    });
  }

  /**
   * @typedef {Object} CaptchaData
   * @property {string} image a base64 data url representing the captcha image
   * @property {string} string the string hidden in the captcha image
   */
  /**
   * @function generate
   * @description generates a captcha image
   *
   * @return {CaptchaData}  An object containing the image as a base64 data url and the string hidden inside
   */
  generate() {
    return new Promise(async res => {
      const string = this.#randomString(6);

      const canvas = createCanvas(this.width, this.height);
      const ctx = canvas.getContext("2d");

      const drawLetter = (string, currX, currY, ctx) => {
        ctx.font = this.fontSize + " " + this.#randomFont();
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

      if (this.backgroundImage) {
        const image = await this.#loadImage(path.join(__dirname, "./assets/strafechat.png"));
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
  }
}

/**
 * @typedef {function} MiddlewareFunction
 * @description Express middleware function that adds the verifyCaptcha() and generateCaptcha() functions to the request object
 * @param {Express.Request} req Express request object
 * @param {Express.Response} res Express response object
 * @param {Express.NextFunction} next Express next function
 * @return {void}
*/
/**
 * @function middleware
 * @description Express middleware initiator to add the verifyCaptcha() and generateCaptcha() functions to the request object
 * 
 * @param {CaptchaGenerator} generator The captcha generator object that should be used
 * 
 * @return {MiddlewareFunction} Express middleware
 */
const middleware = (generator) => {
  const mw = (req, _res, next) => {
    req.verifyCaptcha = function(string) {
      const valid = (this.session.captchaString == string);
      return valid;
    }
    req.generateCaptcha = async function() {
      const captcha = await generator.generate();
      req.session.captchaString = captcha.string;
      return captcha.image;
    }
    next();
  }
  return mw;
}

module.exports = { CaptchaGenerator, middleware }
