# AI Prompt Engineer Extension - Complete Project Plan

## Executive Summary

**Project Name:** AI Prompt Engineer Chrome Extension

**Goal:** Build a Chrome extension that transforms rough, unclear prompts into clear, well-engineered prompts using AI (via OpenRouter API).

**Target Users:** Anyone using ChatGPT or similar AI chat interfaces who wants better results from their prompts.

**Core Value Proposition:** Press Ctrl+Shift+F and watch your rough prompt become a perfectly structured, detailed prompt that gets better AI responses.

---

## Project Overview

### What It Does

1. User types rough prompt in ChatGPT: "write about dogs"
2. User presses **Ctrl+Shift+F**
3. Extension sends prompt to AI (via OpenRouter)
4. AI formats it: "Write a 500-word informative article about dog breeds suitable for first-time owners..."
5. Extension injects formatted prompt back into input field
6. User reviews and sends to ChatGPT

### Why It's Valuable

- **Saves time** - No manual prompt engineering
- **Better results** - Well-structured prompts = better AI responses
- **Learn by example** - See how experts structure prompts
- **Consistency** - Always get professional-quality prompts

---

## Technical Stack (Finalized)

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Vite** - Build tool

### Extension Architecture
- **Manifest V3** - Chrome extension format
- **Content Script** - Interacts with ChatGPT page
- **Background Service Worker** - Handles API calls
- **Popup UI** - Settings interface

### AI Integration
- **OpenRouter** - Primary AI provider
  - Unified API for GPT-4, Claude, Llama, etc.
  - Single API key for all models
  - Pay-as-you-go pricing
- **HuggingFace** - Future alternative

### Build Tools
- **@crxjs/vite-plugin** - Vite + Chrome extension integration
- **TypeScript Compiler** - Type checking
- **ESLint + Prettier** - Code quality

---

## Key Decisions Made

### 1. Technology Stack
**Decision:** React + Vite + TypeScript
**Reasoning:** 
- You're already comfortable with React/TS
- Vite is fastest build tool
- TypeScript prevents bugs
- Professional, scalable codebase

**Alternatives Considered:**
- ❌ Vanilla JS - Too basic, no type safety
- ❌ Plasmo Framework - Too opinionated for MVP
- ❌ Vue/Svelte - Less familiar to you

### 2. AI Provider
**Decision:** OpenRouter (with HuggingFace as future option)
**Reasoning:**
- Single API key for 100+ models
- OpenAI-compatible API (easy)
- Free models available (Llama 3 70B)
- Fallback support built-in
- You already have account

**Alternatives Considered:**
- ❌ Direct OpenAI - Requires separate API key, more expensive
- ❌ Direct Claude - Same issues
- ❌ Local models - Too slow, complex setup

### 3. User API Key Model
**Decision:** Users provide their own OpenRouter API key
**Reasoning:**
- No backend server needed
- Privacy-friendly (keys stored locally)
- No monthly costs for you
- Scales infinitely
- Transparent pricing for users

**Alternatives Considered:**
- ❌ Central API key - Costs money, rate limit issues
- ❌ Subscription model - Too complex for MVP

### 4. Supported Websites
**Decision:** Start with ChatGPT only, expand later
**Reasoning:**
- Focus on MVP
- ChatGPT is most popular
- Easy to test
- Can add more sites in Phase 2

**Phase 2 additions:**
- Claude.ai
- Google Bard/Gemini
- Perplexity.ai
- Universal mode (any textarea)

---

## Architecture Decisions

### Content Script vs Background Worker

**Problem:** Where should API calls happen?

**Decision:** Background service worker handles all API calls

**Why:**
- Content scripts have CORS restrictions (can't make external API calls)
- Background workers have full network access
- Separates concerns (UI vs Business Logic)
- Better security (API keys in background only)

### Message Passing Pattern

**Pattern Used:** Request-Response with chrome.runtime.sendMessage()

```typescript
// Content Script (sender)
const response = await chrome.runtime.sendMessage({
  type: 'FORMAT_PROMPT',
  text: originalText,
});

// Background Worker (receiver)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FORMAT_PROMPT') {
    formatWithAI(request.text).then(sendResponse);
    return true; // Keep channel open
  }
});
```

**Why:**
- Standard Chrome extension pattern
- Async-friendly
- Type-safe with TypeScript
- Easy to extend

### Storage Strategy

**Chrome Storage API:**
- `chrome.storage.sync` - User settings (API keys, preferences)
  - Syncs across devices
  - 100KB limit
  - Perfect for settings
  
- `chrome.storage.local` - History, cache (future)
  - Device-specific
  - 10MB limit
  - For larger data

**Why not localStorage:**
- localStorage is page-specific
- chrome.storage works across extension contexts
- Built-in sync capability

---

## System Prompt Strategy

### Prompt Engineering System Prompt

We use a detailed system prompt that teaches the AI to act as a prompt engineering expert:

```typescript
const PROMPT_ENGINEER_SYSTEM = `You are an expert prompt engineer...
1. Adding clarity
2. Adding context
3. Adding structure
4. Adding constraints
5. Adding examples
6. Removing ambiguity
...`;
```

**Inspired by:** https://generateprompt.ai

**Key Principles:**
- Preserve user's intent
- Add specificity
- Include examples
- Specify format, tone, length
- Remove ambiguity

**Future Enhancement:**
- Users can customize system prompt
- A/B test different prompts
- Community-shared prompts

---

## User Interface Design

### Popup UI (Settings)

**Layout:**
```
┌─────────────────────────────┐
│  Header (gradient)          │
│  "AI Prompt Engineer"       │
├─────────────────────────────┤
│  OpenRouter API Key         │
│  [input field with show/hide]│
│  "Get key at openrouter.ai" │
├─────────────────────────────┤
│  Model Selection            │
│  [dropdown: GPT-4, Claude...]│
├─────────────────────────────┤
│  [Save Settings Button]     │
├─────────────────────────────┤
│  How to Use:                │
│  1. Go to ChatGPT           │
│  2. Type prompt             │
│  3. Press Ctrl+Shift+F      │
│  4. Magic happens! ✨       │
└─────────────────────────────┘
```

**Design Principles:**
- Clean, modern UI
- TailwindCSS for styling
- Clear visual hierarchy
- Inline help text
- One-click links to OpenRouter

### Content Script UI (On-Page)

**Loading Overlay:**
```
┌─────────────────────────────┐
│                             │
│         ⟳ (spinner)         │
│  Enhancing your prompt...   │
│                             │
└─────────────────────────────┘
```

**Success Toast:**
```
┌─────────────────────────────┐
│ ✓ Prompt enhanced successfully!│
└─────────────────────────────┘
```

**Error Toast:**
```
┌─────────────────────────────┐
│ ✗ API key not found         │
└─────────────────────────────┘
```

**Design Principles:**
- Minimal intrusion
- Clear feedback
- Auto-dismiss after 3 seconds
- High z-index (always visible)

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USER FLOW                             │
└─────────────────────────────────────────────────────────────┘

1. User installs extension
   ↓
2. User clicks extension icon → Popup opens
   ↓
3. User enters OpenRouter API key → Saves to chrome.storage.sync
   ↓
4. User navigates to chat.openai.com
   ↓
5. Content script auto-injects
   ↓
6. User types: "write about dogs"
   ↓
7. User presses Ctrl+Shift+F
   ↓
8. Content script detects → Shows loading overlay
   ↓
9. Content script sends message to background worker
   ↓
10. Background worker retrieves API key from storage
   ↓
11. Background worker calls OpenRouter API
   ↓
12. OpenRouter routes to GPT-4
   ↓
13. GPT-4 formats prompt using system prompt
   ↓
14. OpenRouter returns formatted text
   ↓
15. Background worker sends response to content script
   ↓
16. Content script injects formatted text into textarea
   ↓
17. Content script hides loading, shows success toast
   ↓
18. User reviews formatted prompt → Sends to ChatGPT
```

---

## Error Handling Strategy

### Error Categories

1. **API Errors**
   - Invalid API key → "Please check your API key in settings"
   - Rate limiting → "Please wait a moment and try again"
   - Insufficient credits → "Please add funds to OpenRouter"
   - Service unavailable → "OpenRouter temporarily unavailable"

2. **Network Errors**
   - No internet → "Check your internet connection"
   - Timeout → "Request timed out, please try again"

3. **DOM Errors**
   - Input field not found → "Make sure you're on ChatGPT"
   - Can't inject text → Fallback to clipboard copy

4. **Storage Errors**
   - Can't read settings → Prompt user to reconfigure
   - Quota exceeded → Clear old data

### Error Recovery

```typescript
try {
  const response = await formatPrompt(text);
  injectFormattedText(response.text);
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    showRetryButton();
  } else if (error.code === 'API_KEY_INVALID') {
    showSettingsButton();
  } else {
    showGenericError();
  }
}
```

---

## Security Considerations

### API Key Security
- ✅ Stored in `chrome.storage.sync` (encrypted by Chrome)
- ✅ Never logged to console (in production)
- ✅ Never transmitted except to OpenRouter
- ✅ User can delete anytime
- ✅ Not accessible by web pages (isolated context)

### Content Security Policy
- ✅ No eval() or remote scripts
- ✅ All code bundled at build time
- ✅ No inline scripts in HTML
- ✅ Strict CSP in manifest

### Input Sanitization
- ✅ All text treated as plain text (no execution)
- ✅ No innerHTML (use textContent)
- ✅ No eval or Function constructor

### CORS Handling
- ✅ Background worker makes all external requests
- ✅ Content scripts can't bypass CORS
- ✅ OpenRouter uses HTTPS (encrypted)

---

## Performance Optimization

### Current Optimizations
1. **Vite Build**
   - Tree-shaking removes unused code
   - Code splitting for smaller bundles
   - Minification in production

2. **React Optimization**
   - Functional components (lighter)
   - Minimal re-renders
   - No unnecessary state

3. **Extension Optimization**
   - Content script only loads on ChatGPT
   - Background worker sleeps when idle
   - Minimal permission requests

### Future Optimizations
1. **Caching** (Phase 2)
   - Cache identical prompts for 5 minutes
   - Reduce API calls by 30-50%

2. **Request Deduplication**
   - Don't send duplicate requests simultaneously
   - Queue rapid requests

3. **Streaming** (Phase 3)
   - Show formatted text as it's generated
   - Perceived performance improvement

---

## Cost Analysis

### User Costs (OpenRouter)

**Per Format Estimate:**
- Input: ~150 tokens (system prompt + user prompt)
- Output: ~300 tokens (formatted prompt)
- Total: ~450 tokens per format

**Model Costs:**

| Model | Cost per Format | 100 Formats | Notes |
|-------|----------------|-------------|-------|
| GPT-4 Turbo | $0.02 | $2.00 | Best quality |
| GPT-3.5 Turbo | $0.002 | $0.20 | Good balance |
| Claude 3 Haiku | $0.005 | $0.50 | Fast & cheap |
| Llama 3 70B | $0 | $0 | **FREE** |

**Recommendation:** Start with Llama 3 70B (free) for testing, upgrade to GPT-4 for best quality.

### Development Costs

**MVP (Phase 1):**
- Time: 2 weeks
- Cost: Your time (free)
- Infrastructure: None (users bring API keys)

**Future Costs:**
- Chrome Web Store: $5 one-time fee
- Domain (optional): $12/year
- Backend (Phase 4): $20-50/month

---

## Testing Strategy

### MVP Testing

**Manual Testing:**
1. Install extension in Chrome
2. Configure API key
3. Navigate to ChatGPT
4. Test formatting with various prompts
5. Test error cases (invalid key, network error, etc.)

**Test Cases:**
- ✅ Short prompt (1 word)
- ✅ Long prompt (paragraph)
- ✅ Code-related prompt
- ✅ Creative writing prompt
- ✅ Technical documentation prompt
- ✅ Invalid API key
- ✅ Network disconnected
- ✅ Rate limiting

### Future Testing (Phase 2+)

**Unit Tests (Jest):**
```typescript
describe('formatWithOpenRouter', () => {
  it('should format simple prompts', async () => {
    const result = await formatWithOpenRouter('write about dogs', apiKey);
    expect(result.formattedText).toContain('dog');
    expect(result.formattedText.length).toBeGreaterThan(50);
  });
});
```

**Integration Tests (Playwright):**
```typescript
test('should format prompt on ChatGPT', async ({ page }) => {
  await page.goto('https://chat.openai.com');
  await page.fill('textarea', 'write about dogs');
  await page.keyboard.press('Control+Shift+F');
  await expect(page.locator('textarea')).toContainText('500-word');
});
```

---

## Deployment Plan

### Phase 1: Development

1. ✅ Set up project structure
2. ✅ Implement background worker
3. ✅ Implement content script
4. ✅ Implement popup UI
5. ✅ Test locally
6. ✅ Fix bugs
7. ✅ Polish UI

### Phase 2: Beta Testing

1. Share with friends/colleagues
2. Gather feedback
3. Fix reported issues
4. Iterate on UX

### Phase 3: Chrome Web Store

1. Create Chrome Web Store account ($5 fee)
2. Prepare assets:
   - Icons (16, 48, 128px)
   - Screenshots (1280x800)
   - Promotional images
   - Description (short & long)
3. Submit for review
4. Address review feedback
5. Publish!

### Phase 4: Marketing

1. Product Hunt launch
2. Reddit posts (r/ChatGPT, r/chrome)
3. Twitter/X announcement
4. Blog post tutorial
5. YouTube demo video

---

## Success Metrics

### MVP Success Criteria
- ✅ Successfully formats prompts on ChatGPT
- ✅ < 3 second response time (average)
- ✅ Clear error messages for common issues
- ✅ Works on Chrome 88+
- ✅ No crashes or major bugs

### Growth Metrics (Post-Launch)
- **Week 1:** 10 users
- **Month 1:** 100 users
- **Month 3:** 1,000 users
- **Month 6:** 10,000 users

### Quality Metrics
- Error rate < 1%
- Average rating 4.5+ stars
- User retention > 50% (D30)

---

## Risk Analysis

### Technical Risks

**Risk:** ChatGPT changes their DOM structure
- **Impact:** High (extension breaks)
- **Likelihood:** Medium
- **Mitigation:** Use multiple selectors, monitor for changes

**Risk:** OpenRouter API changes
- **Impact:** High (extension breaks)
- **Likelihood:** Low
- **Mitigation:** Follow API changelog, test regularly

**Risk:** Chrome updates break extension
- **Impact:** High
- **Likelihood:** Low
- **Mitigation:** Follow Chrome extension updates, test on Canary

### Business Risks

**Risk:** Users don't want to pay for OpenRouter
- **Impact:** Medium (reduces user base)
- **Likelihood:** Medium
- **Mitigation:** Free models available (Llama 3), educate on value

**Risk:** Competitors launch similar extension
- **Impact:** Medium
- **Likelihood:** High
- **Mitigation:** Launch fast, build community, add unique features

---

## Next Steps

### Immediate (This Week)
1. ✅ Read all documentation
2. ⏳ Set up development environment (SETUP.md)
3. ⏳ Create project structure
4. ⏳ Implement background worker (COMPONENTS.md)
5. ⏳ Implement content script (COMPONENTS.md)
6. ⏳ Implement popup UI (COMPONENTS.md)

### Short Term (Next 2 Weeks)
1. Test extension locally
2. Fix bugs and polish UI
3. Get OpenRouter API key
4. Test with real API calls
5. Create demo video
6. Share with beta testers

### Medium Term (Month 2-3)
1. Implement Phase 2 features (templates, history)
2. Add more website support
3. Submit to Chrome Web Store
4. Launch marketing campaign
5. Gather user feedback

---

## Documentation Structure

All documentation is in the `docs/` folder:

- **README.md** - Project overview, quick start
- **ARCHITECTURE.md** - System design, data flow
- **SETUP.md** - Step-by-step development setup
- **API_INTEGRATION.md** - OpenRouter & HuggingFace integration
- **COMPONENTS.md** - Complete implementation code
- **MANIFEST.md** - Extension manifest explained
- **ROADMAP.md** - Feature roadmap (Phase 1-5)
- **PROJECT_PLAN.md** - This file (overview of everything)

---

## Resources & Links

### Essential
- [OpenRouter Dashboard](https://openrouter.ai/keys) - Get API key
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

### Inspiration
- [generateprompt.ai](https://generateprompt.ai) - Prompt engineering
- [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin/) - Build tool

### Community
- r/ChatGPT - Reddit community
- r/chrome - Chrome extension discussions
- Chrome Web Store - Extension marketplace

---

## Questions & Answers

**Q: Why not use Plasmo framework?**
A: Too opinionated for MVP. We want full control and learning experience.

**Q: Why OpenRouter instead of direct OpenAI?**
A: Single API key for 100+ models, better pricing, free options available.

**Q: Why React instead of vanilla JS?**
A: You're already familiar, better for complex UI, easier to maintain.

**Q: Can users use their own system prompts?**
A: Not in MVP, but planned for Phase 3.

**Q: Will it work on mobile?**
A: Chrome extensions don't work on mobile Chrome. Could build separate mobile app later.

**Q: How do I monetize?**
A: Not focused on monetization for MVP. Potential future: premium features, templates marketplace.

---

## Contact & Support

For questions during development:
- Review documentation in `docs/` folder
- Check Chrome extension docs
- OpenRouter API docs
- Ask in Chrome extension communities

---

**Project Status:** Documentation Complete ✅  
**Next Step:** Follow SETUP.md to begin development  
**Estimated MVP Completion:** 2 weeks from start

**Good luck building! 🚀**
