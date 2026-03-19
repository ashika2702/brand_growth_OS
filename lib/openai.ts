import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateImage(prompt: string) {
  if (!process.env.OPENAI_API_KEY) {
    const seed = Math.floor(Math.random() * 1000000);
    // Simple, direct URL format for Pollinations
    return [{ url: `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nofeed=true&nologo=true` }];
  }

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return response.data;
  } catch (error: any) {
    console.error('OpenAI Error - Falling back to Free Mode:', error.message);
    const seed = Math.floor(Math.random() * 1000000);
    return [{ url: `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nofeed=true&nologo=true` }];
  }
}
