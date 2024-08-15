// Dependencies.
import PostalMime from 'postal-mime';
import { Bot, InputFile } from 'grammy';
import moment from 'moment';

import { Env } from './env';
import { llm } from './llm';

// Main.
export default {

  /**
   * Main function: email.
   *
   * @param message the email message
   * @param env the environment
   * @param ctx the execution context
   */
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

        // Create the email data.
        const mailData = 'Subject: ' + emailSubject + ' - Text: ' + emailObj.text?.replaceAll('\n', ' ').trim();
        // Use LLM to extract the caller's phone number from the voicemail.
        const llmResponse = await llm([
          { role: "system", content: "You are an assistant with only one task: finding the caller's phone number from a voicemail email." },
          { role: "system", content: "You will receive the voicemail email as input." },
          { role: "system", content: "You have to be careful to not confuse the caller's phone number with the called one." },
          { role: "system", content: "Important: you have to reply with only the caller number." },
          { role: "user", content: 'Input: ' + mailData },
        ], env);
        // Extract the caller.
        const caller = llmResponse.content;

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
