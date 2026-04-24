require('dotenv').config();
const CryptoJS = require('crypto-js');

const key = process.env.AES_SECRET;

function aesEncrypt(plainText) {
    const encrypted = CryptoJS.AES.encrypt(plainText, key).toString();
    return encrypted;
}

function aesDecrypt(cipherText) {
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = {aesEncrypt, aesDecrypt}