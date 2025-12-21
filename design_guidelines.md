# Discord Translation Bot - Response Design Guidelines

## Project Context
This is a **Discord bot** that operates entirely within Discord's chat interface. There is no custom web UI to design - all interactions happen through Discord's native messaging system.

## Discord Message Formatting Guidelines

### Command Response Structure
**Translation Response Format:**
- Use Discord embeds for clean, organized translation results
- Embed color: `#5865F2` (Discord's brand color)
- Include clear source and target language labels
- Show original text and translated text in separate fields

**Embed Layout:**
```
Title: "Translation Result"
Fields:
- Original (Language): [source text]
- Translated (Language): [translated text]
Footer: "Powered by [Translation API]"
```

### Typography & Formatting
- **Command syntax**: Use inline code formatting: `!translate [lang] [text]`
- **Language codes**: Display in UPPERCASE (EN, ES, FR, etc.)
- **Translated text**: Use regular text, preserve original formatting when possible
- **Error messages**: Use warning emoji ⚠️ followed by clear explanation

### Response Patterns

**Success Response:**
- Embed with translation results
- Include detected source language if auto-detected
- Keep response concise and readable

**Error Handling:**
- Clear error messages without technical jargon
- Suggest correct usage: `Usage: !translate <language> <text>`
- List common language codes when invalid language provided

**Information Commands:**
- `!languages` command displays supported languages in a formatted list
- Group languages by region for better readability
- Use emoji flags where appropriate (🇬🇧 🇪🇸 🇫🇷)

### Best Practices
- Keep all responses within Discord's 2000 character limit
- Use embeds for structured data (translations, lists)
- Use plain messages for simple confirmations
- Implement typing indicator before responding to show bot is working
- Add reaction emojis to successful translations (✅)

### Command Design
- Prefix: `!` (customizable)
- Command name: `translate` or `tr` (short alias)
- Case-insensitive command parsing
- Support for multi-word text without quotes

**No custom web interface is needed** - all functionality lives within Discord's existing UI.