module.exports = {
  botName: process.env.BOT_NAME || 'Aditya Xmd Text',
  prefix: process.env.PREFIX || '!',
  ownerNumber: (process.env.OWNER_NUMBER || '').replace(/\D/g, ''),
  pairingNumber: (process.env.PAIRING_NUMBER || '').replace(/\D/g, ''),
  timezone: process.env.TZ || 'Asia/Kolkata',
  authDir: process.env.AUTH_DIR || './auth_info',
  logLevel: process.env.LOG_LEVEL || 'silent'
};
