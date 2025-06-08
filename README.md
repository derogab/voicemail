<p align="center">
  <img src="./.github/assets/logo.png" width="140px">
</p>
<h1 align="center">Voicemail</h1>
<p align="center">A powerful voicemail managed with Cloudflare Workers & AI</p>
<p align="center">
  <a href="https://github.com/derogab/voicemail/actions/workflows/deploy.yml">
    <img src="https://github.com/derogab/voicemail/actions/workflows/deploy.yml/badge.svg">
  </a>
</p>

### Info
Use the [ability to receive an email to a Cloudflare Worker](https://developers.cloudflare.com/email-routing/email-workers/) to analyze whether that email contains a voicemail attachment.
If it does, listen to it with [Whisper AI](https://developers.cloudflare.com/workers-ai/models/whisper/) and send a summary to Telegram.

Note: your phone operator must give you the possibility to forward voicemail messages via email.

### Connect Cloudflare
###### Automatic deploy
Setup automatic deploy [using CI/CD w/ GitHub Actions](https://developers.cloudflare.com/workers/wrangler/ci-cd/#2-set-up-ci) on your repo.

1. Go to _GitHub Repo > Settings > Secrets > Actions > Add Repository Secrets_  
    - `CLOUDFLARE_ACCOUNT_ID`: set the Cloudflare account ID for the account on which you want to deploy your Worker.
    - `CLOUDFLARE_API_TOKEN`: set the Cloudflare API token you generated (w/ ability to "Edit Workers").

###### Manual deploy
Inside this repo, run the command `npm run deploy` and follow the steps to connect your Cloudflare account.

### Connect Telegram
You need to create a personal telegram bot and connect it to your worker.
1. First of all you need to create a bot with [BotFather](https://t.me/BotFather).
2. Go to _Cloudflare > Workers & Pages > Your Worker > Settings > Variables > Add Encrypted Environment Variables_
   - `AI_GATEWAY`: (optional) set the Cloudflare AI gateway ID.
   - `OPENAI_API_KEY`: (optional) set the OpenAI API KEY. If available GPT will be used, otherwise Llama4.
   - `OPENAI_BASE_URL`: (optional) set a custom OpenAI compatible BASE URL. If available it will be used, otherwise the openai default one.
   - `TELEGRAM_BOT_API_KEY`: (mandatory) set the API KEY of the telegram bot.
   - `TELEGRAM_CHAT_ID`: (mandatory) set your Chat ID (You can find out easily with [My ID Bot](https://t.me/my_id_bot)).
   - `TZ`: (optional) set the correct time zone (e.g. Europe/Rome, Europe/London, ...)

### Activate Voicemail
1. Connect your website to Cloudflare.
2. Add _Email Routing_ to your Cloudflare website.
3. Create a routing rule on _Cloudflare > Email > Routing rules_.
   - Custom address: `voicemail@example.com`
   - Action: `Send to a Worker`
   - Destination: `voicemail`
4. Setup your phone operator to submit voicemail messages to `voicemail@example.com`.


### Tip
If you like this project or directly benefit from it, please consider buying me a coffee:  
🔗 `bc1qd0qatgz8h62uvnr74utwncc6j5ckfz2v2g4lef`  
⚡️ `derogab@sats.mobi`  
💶 [Sponsor on GitHub](https://github.com/sponsors/derogab)

### Credits
_Voicemail_ is made with ♥  by [derogab](https://github.com/derogab) and it's released under the [MIT license](./LICENSE).
