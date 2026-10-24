const config = require('../config');

function getText(message) {
  const m = message.message || {};
  const content = m.ephemeralMessage?.message || m.viewOnceMessageV2?.message || m;
  return (
    content.conversation ||
    content.extendedTextMessage?.text ||
    content.imageMessage?.caption ||
    content.videoMessage?.caption ||
    content.documentMessage?.caption ||
    content.buttonsResponseMessage?.selectedButtonId ||
    content.listResponseMessage?.singleSelectReply?.selectedRowId ||
    ''
  ).trim();
}

function unwrapJid(jid = '') {
  return jid.replace(/:\d+@/, '@');
}

async function reply(sock, message, text) {
  const jid = message.key.remoteJid;
  if (!jid) return;
  await sock.sendMessage(jid, { text }, { quoted: message });
}

async function handleCommand(sock, message) {
  if (!message.message || message.key.fromMe) return;
  const chat = message.key.remoteJid || '';
  if (chat === 'status@broadcast') return;

  const text = getText(message);
  if (!text.startsWith(config.prefix)) return;

  const body = text.slice(config.prefix.length).trim();
  if (!body) return;
  const firstSpace = body.indexOf(' ');
  const command = (firstSpace < 0 ? body : body.slice(0, firstSpace)).toLowerCase();
  const args = firstSpace < 0 ? '' : body.slice(firstSpace + 1).trim();
  const sender = unwrapJid(message.key.participant || message.key.remoteJid || '');
  const senderNumber = sender.split('@')[0];

  switch (command) {
    case 'menu':
    case 'help':
      return reply(sock, message,
        `*${config.botName} — COMMAND MENU*\n\n` +
        `${config.prefix}menu — Show commands\n` +
        `${config.prefix}ping — Check response\n` +
        `${config.prefix}alive — Check bot status\n` +
        `${config.prefix}info — Bot information\n` +
        `${config.prefix}time — Current server time\n` +
        `${config.prefix}echo <text> — Repeat text\n` +
        `${config.prefix}owner — Show configured owner\n\n` +
        `Prefix: ${config.prefix}`
      );

    case 'ping':
      return reply(sock, message, 'Pong! Aditya Xmd Text is responding.');

    case 'alive':
      return reply(sock, message, `Yes, ${config.botName} is online.`);

    case 'info':
      return reply(sock, message,
        `*${config.botName}*\n` +
        `Runtime: Node.js ${process.version}\n` +
        `Commands prefix: ${config.prefix}\n` +
        `Platform: ${process.platform}\n` +
        `Mode: WhatsApp Multi-Device`
      );

    case 'time': {
      const now = new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'full',
        timeStyle: 'long',
        timeZone: config.timezone
      }).format(new Date());
      return reply(sock, message, `Server time: ${now}`);
    }

    case 'echo':
      if (!args) return reply(sock, message, `Usage: ${config.prefix}echo your text`);
      return reply(sock, message, args.slice(0, 1500));

    case 'owner':
      return reply(sock, message,
        config.ownerNumber
          ? `Configured owner: https://wa.me/${config.ownerNumber}`
          : 'Owner number is not configured. Set OWNER_NUMBER in environment variables.'
      );

    default:
      return reply(sock, message, `Unknown command. Send ${config.prefix}menu to see available commands.`);
  }
}

module.exports = { handleCommand };
