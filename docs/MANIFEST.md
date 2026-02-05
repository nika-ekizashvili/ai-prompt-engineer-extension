# Manifest Configuration Guide

Detailed explanation of the Chrome Extension Manifest V3 configuration.

## Complete Manifest

```json
{
  "manifest_version": 3,
  "name": "AI Prompt Engineer",
  "version": "1.0.0",
  "description": "Transform rough prompts into perfect, well-engineered prompts using AI",
  "author": "Your Name",
  
  "permissions": [
    "storage",
    "activeTab"
  ],
  
  "host_permissions": [
    "https://chat.openai.com/*",
    "https://chatgpt.com/*"
  ],
  
  "background": {
    "service_worker": "src/background/background.ts",
    "type": "module"
  },
  
  "content_scripts": [
    {
      "matches": [
        "https://chat.openai.com/*",
        "https://chatgpt.com/*"
      ],
      "js": ["src/content/content.ts"],
      "run_at": "document_end"
    }
  ],
  
  "action": {
    "default_popup": "src/popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

---

## Field Explanations

### Basic Information

#### `manifest_version`
```json
"manifest_version": 3
```
- **Required:** Yes
- **Value:** 3 (Manifest V3 is required for new Chrome extensions)
- **Purpose:** Specifies the manifest format version

#### `name`
```json
"name": "AI Prompt Engineer"
```
- **Required:** Yes
- **Max Length:** 45 characters
- **Purpose:** Display name in Chrome Web Store and extension management
- **Best Practices:**
  - Clear and descriptive
  - Include keywords for discoverability
  - Avoid excessive punctuation

#### `version`
```json
"version": "1.0.0"
```
- **Required:** Yes
- **Format:** Major.Minor.Patch (Semantic Versioning)
- **Purpose:** Track extension updates
- **Example Updates:**
  - 1.0.0 → 1.0.1 (bug fix)
  - 1.0.0 → 1.1.0 (new feature)
  - 1.0.0 → 2.0.0 (breaking changes)

#### `description`
```json
"description": "Transform rough prompts into perfect, well-engineered prompts using AI"
```
- **Required:** Yes
- **Max Length:** 132 characters
- **Purpose:** Shows in Chrome Web Store and extension list
- **Best Practices:**
  - Explain what it does
  - Mention key benefits
  - Include relevant keywords

#### `author`
```json
"author": "Your Name"
```
- **Required:** No
- **Purpose:** Attribution
- **Can be:** Individual name, company name, or email

---

### Permissions

#### `permissions`
```json
"permissions": [
  "storage",
  "activeTab"
]
```

**storage:**
- Access to `chrome.storage` API
- Store user settings (API keys, preferences)
- Both `sync` (cross-device) and `local` (device-specific)
- **Why needed:** Save API keys, model selection, settings

**activeTab:**
- Access to currently active tab
- Only when user invokes the extension
- More privacy-friendly than broad `tabs` permission
- **Why needed:** Interact with ChatGPT page

**Other common permissions you might add:**
- `tabs` - Access tab information
- `clipboardWrite` - Copy to clipboard
- `notifications` - Show system notifications
- `contextMenus` - Add right-click menu items

#### `host_permissions`
```json
"host_permissions": [
  "https://chat.openai.com/*",
  "https://chatgpt.com/*"
]
```
- **Purpose:** Specify which websites the extension can access
- **Format:** URL patterns with wildcards
- **Why needed:** Content script injection on ChatGPT

**Pattern Syntax:**
- `*://example.com/*` - Any protocol
- `https://example.com/*` - HTTPS only
- `*://*.example.com/*` - All subdomains
- `<all_urls>` - All websites (use cautiously!)

**For Phase 2-3, add:**
```json
"host_permissions": [
  "https://chat.openai.com/*",
  "https://chatgpt.com/*",
  "https://claude.ai/*",
  "https://bard.google.com/*",
  "https://www.perplexity.ai/*"
]
```

---

### Background Service Worker

```json
"background": {
  "service_worker": "src/background/background.ts",
  "type": "module"
}
```

**service_worker:**
- Path to background script
- Runs in background (not tied to any page)
- Wakes up when needed, sleeps when idle (Manifest V3)

**type: "module":**
- Enables ES6 modules (`import`/`export`)
- Required if using TypeScript/modern JavaScript
- Allows code organization

**Key Responsibilities:**
- Handle API calls (OpenRouter)
- Manage state and storage
- Listen for messages from content scripts
- Handle extension lifecycle events

**Lifecycle (Manifest V3):**
```
Install → Active → Idle (30s) → Suspended → Wakes on event → Active
```

---

### Content Scripts

```json
"content_scripts": [
  {
    "matches": [
      "https://chat.openai.com/*",
      "https://chatgpt.com/*"
    ],
    "js": ["src/content/content.ts"],
    "run_at": "document_end"
  }
]
```

**matches:**
- URL patterns where script should inject
- Array of patterns (OR logic)
- Must also be in `host_permissions`

**js:**
- Array of JavaScript files to inject
- Injected in order specified
- Runs in isolated world (separate from page JS)

**run_at:**
- `document_start` - Before DOM construction
- `document_end` - After DOM construction (recommended)
- `document_idle` - After window.onload

**Other options:**
```json
{
  "matches": ["https://chat.openai.com/*"],
  "js": ["content.js"],
  "css": ["content.css"],           // Inject CSS
  "run_at": "document_end",
  "all_frames": false,               // Main frame only
  "match_about_blank": false,        // Don't match about:blank
  "world": "ISOLATED"                // Isolated or MAIN
}
```

---

### Extension Action (Popup)

```json
"action": {
  "default_popup": "src/popup/popup.html",
  "default_icon": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "default_title": "AI Prompt Engineer"
}
```

**default_popup:**
- HTML file that opens when clicking extension icon
- Can be omitted if you don't need a popup
- Alternative: use `chrome.action.onClicked` event

**default_icon:**
- Icons shown in Chrome toolbar
- Multiple sizes for different pixel densities
- Required sizes: 16x16, 48x48, 128x128

**default_title:**
- Tooltip text when hovering over icon
- Optional (defaults to extension name)

**Popup Specifications:**
- Width: 300-800px (recommended 400px)
- Height: Auto (max ~600px before scrolling)
- Opens relative to icon position
- Closes when clicking outside

---

### Icons

```json
"icons": {
  "16": "icons/icon16.png",
  "48": "icons/icon48.png",
  "128": "icons/icon128.png"
}
```

**Purpose:** Used in various Chrome UI locations
- 16x16: Favicon (extension pages)
- 48x48: Extension management page
- 128x128: Chrome Web Store, installation dialog

**Best Practices:**
- Use PNG format (with transparency)
- Keep design simple and recognizable
- Works in light and dark themes
- High contrast for visibility

**Creation Tools:**
- Figma/Sketch (design)
- ImageMagick (batch resize)
- Online generators (favicon-generator.org)

---

### Content Security Policy

```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'"
}
```

**Purpose:** Security restrictions for extension pages (popup, options, etc.)

**Manifest V3 Defaults:**
- No `eval()` allowed
- No inline scripts (`<script>code</script>`)
- No remote scripts (must be bundled)

**Fields:**
- `extension_pages` - Applies to popup, options, etc.
- `sandbox` - For sandboxed pages

**Why Strict:**
- Prevent XSS attacks
- Ensure code integrity
- Required for Chrome Web Store review

**Common Violations:**
```javascript
// ❌ NOT ALLOWED
eval('code');
new Function('return code')();
innerHTML = '<script>code</script>';

// ✅ ALLOWED
const fn = () => { /* code */ };
textContent = 'content';
```

---

## Optional Fields

### Commands (Keyboard Shortcuts)

```json
"commands": {
  "format-prompt": {
    "suggested_key": {
      "default": "Ctrl+Shift+F",
      "mac": "Command+Shift+F"
    },
    "description": "Format current prompt with AI"
  }
}
```

**Note:** For MVP, we handle shortcuts in content script. This is for global shortcuts that work even when not on webpage.

---

### Options Page

```json
"options_page": "options.html",
"options_ui": {
  "page": "options.html",
  "open_in_tab": true
}
```

**Purpose:** Full-page settings interface (alternative to popup)

**When to use:**
- Many settings options
- Need more space than popup
- Complex UI (forms, tables)

---

### Web Accessible Resources

```json
"web_accessible_resources": [
  {
    "resources": ["images/*", "styles/*"],
    "matches": ["https://chat.openai.com/*"]
  }
]
```

**Purpose:** Allow web pages to access extension files

**When needed:**
- Inject images into page
- Load fonts or CSS
- Fetch JSON data

**For our extension:** Not needed for MVP (we inject inline styles)

---

## Manifest Validation

### Required Fields Checklist
- ✅ `manifest_version`: 3
- ✅ `name`: "AI Prompt Engineer"
- ✅ `version`: "1.0.0"
- ✅ `description`: "Transform rough prompts..."

### Common Errors

**Error: "background.scripts" is not allowed**
```json
// ❌ Manifest V2 syntax
"background": {
  "scripts": ["background.js"]
}

// ✅ Manifest V3 syntax
"background": {
  "service_worker": "background.js"
}
```

**Error: "Permissions must be specified"**
- Make sure `permissions` array exists
- Check for typos in permission names

**Error: "Invalid host permission"**
- Check URL pattern syntax
- Ensure protocol is specified (https://)

---

## Testing Manifest Changes

```bash
# 1. Edit manifest.json
# 2. Rebuild extension
npm run build

# 3. Reload extension in Chrome
# Go to chrome://extensions/ and click refresh icon

# 4. Check for errors in console
# Right-click extension icon → Inspect → Console
```

---

## Chrome Web Store Requirements

For publication to Chrome Web Store:

### Mandatory
- ✅ Clear name and description
- ✅ All icons provided (16, 48, 128)
- ✅ No remote code execution
- ✅ Minimal permissions requested
- ✅ Privacy policy (if collecting data)

### Recommended
- Screenshots (1280x800 or 640x400)
- Promotional images (440x280)
- Detailed description (up to 132 chars)
- Support email or website
- Categories and tags

---

## Version Migration

### Updating from V2 to V3

**Key Changes:**
```json
// V2
"background": { "scripts": ["bg.js"], "persistent": false }
// V3
"background": { "service_worker": "bg.js" }

// V2
"browser_action": { ... }
// V3
"action": { ... }

// V2
"permissions": ["https://example.com/*"]
// V3
"host_permissions": ["https://example.com/*"]
```

---

## References

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/manifest/)
- [Permissions](https://developer.chrome.com/docs/extensions/mv3/declare_permissions/)
- [Content Scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
- [Service Workers](https://developer.chrome.com/docs/extensions/mv3/service_workers/)

---

**Last Updated:** February 2026
