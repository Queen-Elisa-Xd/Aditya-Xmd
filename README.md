# Aditya Xmd Text

An original, minimal WhatsApp Multi-Device bot framework built with Node.js and Baileys. It is not a byte-for-byte copy of Jarvis; it provides a clean base with working starter commands.

## Included commands

- `!menu` / `!help`
- `!ping`
- `!alive`
- `!info`
- `!time`
- `!echo <text>`
- `!owner`

## Requirements

- Node.js 20+
- A WhatsApp account that can link a companion device
- Persistent storage for `AUTH_DIR` on hosted deployments

## Run locally

1. Install Node.js 20 or newer.
2. Extract this project and open a terminal in the project folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and edit values if needed.
5. Run `npm start`.
6. By default, scan the terminal QR using WhatsApp > Linked devices > Link a device. For linking-code mode, set `PAIRING_NUMBER` in `.env` to your WhatsApp number with country code and digits only (example: `919876543210`), restart, then on your phone open WhatsApp > Linked devices > Link a device > Link with phone number instead and enter the code printed in the terminal.
7. Send `!menu` to the linked account from another chat.

The pairing session is saved in `auth_info/`. Do not share this folder or publish it.

## Environment variables

| Variable | Meaning | Default |
|---|---|---|
| `BOT_NAME` | Display name | `Aditya Xmd Text` |
| `PREFIX` | Command prefix | `!` |
| `OWNER_NUMBER` | Owner number with country code, digits only | empty |
| `PAIRING_NUMBER` | Optional number for linking-code mode; country code + number, digits only. Leave empty for QR mode. | empty (QR mode) |
| `TZ` | Timezone for `!time` | `Asia/Kolkata` |
| `AUTH_DIR` | Session directory | `./auth_info` |
| `LOG_LEVEL` | Pino log level | `silent` |

## Deploy with Docker

Build and run:

```sh
docker build -t aditya-xmd-text .
docker run -it --name aditya-xmd-text -v "$(pwd)/auth_info:/app/auth_info" --env BOT_NAME="Aditya Xmd Text" aditya-xmd-text
```

The first run prints a QR code in the logs. Keep the session directory on persistent storage.

## Railway

1. Push this folder to a GitHub repository you control.
2. Create a new Railway project from that repository.
3. Ensure the service builds using the included `Dockerfile`.
4. Add a persistent volume and mount it at `/app/auth_info`, then set `AUTH_DIR=/app/auth_info`.
5. Add `BOT_NAME=Aditya Xmd Text`, `PREFIX=!`, and optionally `OWNER_NUMBER`.
6. For QR mode, open deployment logs and scan the QR code. For linking-code mode, add `PAIRING_NUMBER` as a service variable (country code + number, digits only), redeploy, and enter the code shown in logs via WhatsApp > Linked devices > Link a device > Link with phone number instead.
7. Confirm the volume remains mounted after redeploys.

## Render

The included `render.yaml` configures a Docker worker and persistent disk. Create a Render Blueprint from your repository and deploy it. For QR mode, scan the QR in worker logs. For linking-code mode, add `PAIRING_NUMBER` in the service environment variables, then use the code in logs through WhatsApp > Linked devices > Link a device > Link with phone number instead. Keep the disk mounted at `/var/data` and `AUTH_DIR=/var/data/auth_info`.

## Koyeb

1. Create an app from the GitHub repository and select Dockerfile build.
2. Set the environment variables listed above.
3. Configure persistent storage for `/app/auth_info` if persistent volumes are available on your plan/region.
4. Deploy and inspect logs for the QR code.
5. For linking-code mode, set `PAIRING_NUMBER` (country code + number, digits only) and enter the code from logs in WhatsApp > Linked devices > Link a device > Link with phone number instead. If your Koyeb setup cannot mount persistent storage, do not rely on local session files surviving a restart; use a persistent session-storage design before production use.

## Panel / Pterodactyl

1. Create a Node.js 20 server (or a Docker server using this project's Dockerfile).
2. Upload the project files or connect the repository.
3. Set startup command to `npm start`.
4. Set install command to `npm install`.
5. Set `AUTH_DIR` to a persistent path inside the server, e.g. `./auth_info`.
6. Start the server and either scan the QR from console logs or set `PAIRING_NUMBER` and use the linking code shown in logs. On WhatsApp choose Linked devices > Link a device > Link with phone number instead.

## Important deployment notes

- QR and linking-code pairing are both supported. Keep the logs open during first setup. To switch back to QR mode, remove/blank `PAIRING_NUMBER` and restart.
- The WhatsApp session contains account access credentials. Never upload it to GitHub or send it to anyone.
- Hosting providers change their plans, volume support, and runtime rules; verify the current settings in each provider dashboard.
- Commands listed above are implemented in this project. Jarvis has a much larger command/plugin ecosystem; this starter does not claim to reproduce every Jarvis feature.
- This bot does not mass-report, ban, or interfere with other WhatsApp accounts. Only WhatsApp can decide account enforcement.
