export type Request = any;
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
export class CaptchaGenerator {
    constructor(height?: number, width?: number, fontSize?: string, fonts?: any[]);
    width: number;
    height: number;
    backgroundImage: boolean;
    textColour: string;
    fonts: string[];
    fontSize: string;
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
    generate(): {
        /**
         * a base64 data url representing the captcha image
         */
        image: string;
        /**
         * the string hidden in the captcha image
         */
        string: string;
    };
    #private;
}
/**
 * @typedef {import("express").Request} Request
 * @property {function(string): boolean} verifyCaptcha Verifies a captcha string
 * @property {function(): Promise<string>} generateCaptcha Generates a captcha image and returns the base64 data url
*/
/**
 * @function middleware
 * @description Express middleware initiator to add the verifyCaptcha() and generateCaptcha() functions to the request object
 *
 * @param {CaptchaGenerator} generator The captcha generator object that should be used
 *
 * @return {function} Express middleware
 */
export function middleware(generator: CaptchaGenerator): Function;
//# sourceMappingURL=index.d.ts.map