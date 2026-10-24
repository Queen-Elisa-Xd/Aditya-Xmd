const pino = require('pino');
const qrcode = require('qrcode-terminal');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const config = require('../config');
const { handleCommand } = require('./commands');

let reconnecting = false;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(config.authDir);
  let version;
  try {
    ({ version } = await fetchLatestBaileysVersion());
  } catch (error) {
    console.warn('Could not fetch the latest WhatsApp Web version; using library default.', error.message);
  }

  const sock = makeWASocket({
    ...(version ? { version } : {}),
    auth: state,
    logger: pino({ level: config.logLevel }),
    printQRInTerminal: false,
    browser: [config.botName, 'Chrome', '1.0.0'],
    markOnlineOnConnect: false,
    syncFullHistory: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('\\nScan this QR from WhatsApp > Linked devices > Link a device:\\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      reconnecting = false;
      console.log(`${config.botName} connected successfully.`);
    }

    if (connection === 'close' && !reconnecting) {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;
      if (loggedOut) {
        console.error('WhatsApp session logged out. Remove the saved auth folder and restart to pair again.');
        return;
      }
      reconnecting = true;
      console.warn('Connection closed; reconnecting...');
      setTimeout(() => {
        reconnecting = false;
        startBot().catch((error) => console.error('Reconnect failed:', error));
      }, 3000);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const message of messages) {
      try {
        await handleCommand(sock, message);
      } catch (error) {
        console.error('Message handler error:', error);
      }
    }
  });

  return sock;
}

module.exports = { startBot };
