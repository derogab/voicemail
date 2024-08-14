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
        const whisperResponse = await env.AI.run("@cf/openai/whisper", {
          audio: [...audioFile],
        });
        // Get the transcription.
        const transcribedAudio = whisperResponse.text ? whisperResponse.text : '...';

        // Get the caller.
        const inputEmailData = emailSubject + '\n\n' + emailObj.text;
        const llamaResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
          messages: [
            { role: "system", content: "You are an assistant with only one task." },
            { role: "system", content: "The task: find the caller's phone number from a voicemail email." },
            { role: "system", content: "You will receive the voicemail as unique input." },
            { role: "system", content: "Be careful not to confuse the caller's phone number with the called one." },
            { role: "system", content: "You MUST reply with only the caller number." },
            { role: "user", content: inputEmailData },
          ],
        });
        const caller = llamaResponse.response;

        // Log the input.
        console.log('Input Email: ' + inputEmailData);

        // Generate message.
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
