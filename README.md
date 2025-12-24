<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1vWz4IcLnq_VQ9C6dx9sYfDtWTXH7lhIq

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables:
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit .env.local and add your Gemini API key
   # Get your API key from: https://ai.google.dev/
   ```
   
3. Run the app:
   ```bash
   npm run dev
   ```

## Security Best Practices

⚠️ **IMPORTANT**: Never commit your `.env.local` file or any file containing API keys to version control.

- All `.env*` files (except `.env.example`) are automatically ignored by git
- Keep your API keys secure and never share them publicly
- If you accidentally commit an API key, revoke it immediately and generate a new one
- Use `.env.example` as a template for required environment variables
