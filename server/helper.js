const crypto = require('crypto');

// ENCRYPTION

function encrypt (algorithm, key, data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return  iv.toString('hex') + ':' + encrypted;
}

function decrypt (algorithm, key, data) {
    const parts = data.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedData = parts.join(':');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

module.exports = {
    encrypt,
    decrypt
}