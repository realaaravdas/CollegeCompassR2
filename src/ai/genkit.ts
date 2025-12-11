import {genkit} from 'genkit';
import openAICompatible from '@genkit-ai/compat-oai';

export const ai = genkit({
  plugins: [
    openAICompatible({
      name: 'deepseek',
      apiKey: process.env.OPENAI_API_KEY || 'sk-e3d2e629fe2d46b3952525e4c7a7a6e1',
      baseURL: 'https://api.deepseek.com',
    })
  ],
});
