import Aes from 'react-native-aes-crypto'

export const encrypt = (text, keyBase64) => { 
    const ivBase64 = "cefg3a7dc9cf86aa"; 
    return Aes.encrypt(text, hexEncode(keyBase64), hexEncode(ivBase64)).then(cipher => ({ cipher, iv: ivBase64 })) }
export const decrypt = (encryptedData, key) => Aes.decrypt(encryptedData.cipher, hexEncode(key), hexEncode('WsgoiUBluntSS7m3'))
export const generateKey = (password, salt) => Aes.pbkdf2(password, salt)

// --------------------------
async function asyncDecrypt(cipher, key, iv) {
    try {
        var text = await decrypt({ cipher, iv }, key);
        console.log(text);
        return text;
    } catch (e) {
        console.error(e);
    }
}
function hexEncode(str) {
    var hex = '';
    for (var i = 0; i < str.length; i++) {
        hex += '' + str.charCodeAt(i).toString(16);
    }
    return hex;
}


