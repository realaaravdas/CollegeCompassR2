# Migration from Gemini to DeepSeek v3

This document describes the migration from Google's Gemini API to DeepSeek v3 API.

## Changes Made

### 1. Package Updates

**Upgraded Genkit packages:**
- `genkit`: 1.13.0 → 1.25.0
- `@genkit-ai/googleai`: 1.13.0 → 1.25.0
- `@genkit-ai/next`: 1.13.0 → 1.25.0
- `genkit-cli`: 1.13.0 → 1.25.0

**Added new package:**
- `@genkit-ai/compat-oai`: 1.25.0 (OpenAI-compatible API plugin)

**Removed dependency:**
- No longer dependent on `@genkit-ai/googleai` for model inference

### 2. Configuration Changes

**File: `src/ai/genkit.ts`**
- Replaced `googleAI()` plugin with `openAICompatible()` plugin
- Configured DeepSeek API endpoint: `https://api.deepseek.com/v1`
- Changed API key environment variable to `OPENAI_API_KEY`

### 3. Model Updates

All AI flows now use the DeepSeek model:

**Model reference changed from:**
- `googleai/gemini-2.5-flash-lite`

**To:**
- `deepseek/deepseek-chat`

**Files updated:**
- `src/ai/flows/estimate-acceptance-rate.ts`
- `src/ai/flows/list-majors.ts`
- `src/ai/flows/generate-student-profile.ts`
- `src/ai/flows/populate-college-info.ts`

### 4. Environment Variables

**Old:** `GEMINI_API_KEY`
**New:** `OPENAI_API_KEY`

Create a `.env.local` file with:
```
OPENAI_API_KEY=your-deepseek-api-key
```

### 5. Removed Code

- Removed all `GEMINI_API_KEY` environment variable checks from flow files
- The API key is now configured centrally in `genkit.ts`

## Why DeepSeek?

DeepSeek v3 provides:
- Higher rate limits (compared to the 20 RPD limit on Gemini)
- OpenAI-compatible API for easy integration
- Good performance for the application's use cases
- Cost-effective pricing

## Features Preserved

All functionality has been preserved:
- ✅ College information lookup (with real-time/up-to-date data)
- ✅ Acceptance rate estimation
- ✅ Major listing
- ✅ Student profile generation
- ✅ Retry logic with exponential backoff

## Testing

To test the integration:

1. Set up the environment variable:
   ```bash
   echo "OPENAI_API_KEY=your-api-key" > .env.local
   ```

2. Start the Genkit development server:
   ```bash
   npm run genkit:dev
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Test the flows through the application UI at `http://localhost:9002`

## Notes

- DeepSeek's API is OpenAI-compatible, so the integration uses the `@genkit-ai/compat-oai` plugin
- The model name format is `{plugin-name}/{model-name}` where plugin-name is "deepseek" and model-name is "deepseek-chat"
- DeepSeek v3 supports JSON mode and structured outputs, maintaining compatibility with existing prompts
