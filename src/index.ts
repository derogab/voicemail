import PostalMime from 'postal-mime';
import { Bot, InputFile } from 'grammy';
import moment from 'moment';

export interface Env {
  AI: Ai;
  TELEGRAM_BOT_API_KEY: string;
  TELEGRAM_CHAT_ID: string;
  TZ: string;
}

export default {
  async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext) {
    // Extract the email data.
    const emailSubject = message.headers.get('subject');
    const emailObj = await PostalMime.parse(message.raw);
    // Extract voicemail(s) from attachments.
    for (let i = 0; i < emailObj.attachments.length; i++) {
      const attachment = emailObj.attachments[i];

      // Check if the attachment is a WAV file.
      if (attachment.mimeType === 'audio/wav' || attachment.mimeType === 'audio/x-wav') {
        // Get audio file.
        const audioFile = new Uint8Array(attachment.content);
        // Convert audio in text with AI.
        const response = await env.AI.run("@cf/openai/whisper", {
          audio: [...audioFile],
        });

        // Generate message.
        const caller = emailSubject?.split(':')[2]?.trim() || 'Unknown';
        const transcribedAudio = response.text ? response.text : '...';
        const msg = '☎️ ' + caller + '\n'
                  + '📅 ' + moment().format('YYYY-MM-DD, hh:mm') + '\n'
                  + '💬 `' + transcribedAudio + '`';

        // Send the summary to the user.
        const bot = new Bot(env.TELEGRAM_BOT_API_KEY);
        await bot.api.sendMessage(env.TELEGRAM_CHAT_ID, '📞');
        await bot.api.sendAudio(env.TELEGRAM_CHAT_ID, new InputFile(audioFile, 'voicemail.mp3'), { caption: msg, parse_mode: 'Markdown' });
      }
    }
  }
}
