
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
let pairingRequested = false;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(
    config.authDir
  );

  let version;

  try {
    ({ version } = await fetchLatestBaileysVersion());
  } catch (error) {
    console.warn(
      'Could not fetch the latest WhatsApp version:',
      error.message
    );
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

  const pairingNumber = String(
    process.env.PAIRING_NUMBER || ''
  ).replace(/\D/g, '');

  // Pairing code for a new, unregistered session.
  if (pairingNumber && !state.creds.registered) {
    if (!pairingRequested) {
      pairingRequested = true;

      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(
            pairingNumber
          );

          console.log('\n================================');
          console.log('WHATSAPP PAIRING CODE:', code);
          console.log('Open WhatsApp > Linked devices');
          console.log('Choose Link with phone number');
          console.log('================================\n');
        } catch (error) {
          pairingRequested = false;
          console.error(
            'Pairing code request failed:',
            error.message
          );
        }
      }, 3000);
    }
  }

  sock.ev.on(
    'connection.update',
    ({ connection, lastDisconnect, qr }) => {
      // Display QR when no pairing number is configured.
      if (qr && !pairingNumber) {
        console.log(
          '\nScan QR: WhatsApp > Linked devices > Link a device\n'
        );
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'open') {
        reconnecting = false;
        pairingRequested = false;
        console.log(
          `${config.botName} connected successfully.`
        );
      }

      if (connection === 'close' && !reconnecting) {
        const statusCode =
          lastDisconnect?.error?.output?.statusCode;

        if (statusCode === DisconnectReason.loggedOut) {
          console.error(
            'WhatsApp session logged out. A fresh pairing is required.'
          );
          return;
        }

        reconnecting = true;
        console.warn('Connection closed; reconnecting...');

        setTimeout(() => {
          reconnecting = false;

          startBot().catch((error) => {
            console.error('Reconnect failed:', error);
          });
        }, 3000);
      }
    }
  );

  sock.ev.on(
    'messages.upsert',
    async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const message of messages) {
        try {
          await handleCommand(sock, message);
        } catch (error) {
          console.error('Message handler error:', error);
        }
      }
    }
  );

  return sock;
}

module.exports = { startBot };
