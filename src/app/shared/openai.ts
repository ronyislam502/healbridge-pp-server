import OpenAI from "openai";
import config from "../config";


export const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: config.openai_api_key,
});

// async function main() {
//   const completion = await openai.chat.completions.create({
//     model: 'openai/gpt-5.2',
//     messages: [
//       {
//         role: 'user',
//         content: 'What is the meaning of life?',
//       },
//     ],
//   });

//   console.log(completion.choices[0].message);
// }

// main();
