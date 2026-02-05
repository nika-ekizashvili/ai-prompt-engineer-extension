# Quick Debug Check

The logs show:
✅ Background worker loaded
✅ Popup working
✅ API key saved
❌ **Content script NOT loading on ChatGPT**

## Check This:

1. Go to `chat.openai.com`
2. Press **F12** (opens DevTools)
3. Go to **Console** tab
4. Look for this message: `✓ AI Prompt Engineer content script loaded`

**If you DON'T see it**, the content script isn't injecting.

Tell me: Do you see that message?
