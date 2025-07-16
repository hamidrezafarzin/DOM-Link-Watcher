# DOM-Link-watcher

DOM-Link-watcher is a lightweight JavaScript tool designed to monitor and log URLs from various web activities, such as XHR requests, fetch calls, DOM changes, history navigation, and form submissions. It displays the captured URLs in a real-time, on-page panel for debugging and analysis.

## Features
- **Real-time URL Monitoring**: Tracks URLs from XHR, fetch, history.pushState/replaceState, script tags, inline scripts, DOM attributes, text nodes, anchor clicks, and form submissions.
- **Interactive Display**: Logs URLs in a fixed, scrollable panel at the bottom of the page with a dark background and lime text for visibility.
- **Duplicate Prevention**: Ensures each URL is logged only once using a Set.
- **Source Context**: Includes source information (e.g., file and line number) for debugging.
- **Non-intrusive**: Preserves original functionality of hooked methods (XHR, fetch, etc.).

## Usage
1. **Include the Script**:
   - Copy the contents of `src/urlHook.js` and paste it into your browser's console, then press Enter to run it.
   - Alternatively, include it in your HTML:
     ```html
     <script src="path/to/urlHook.js"></script>
     ```

2. **Run the Script**:
   - The script automatically initializes when executed, creating a panel at the bottom of the page.
   - No additional configuration is required.

3. **View Logs**:
   - Open the webpage in a browser.
   - The panel will display URLs as they are detected from various sources (e.g., `[XHR]`, `[Fetch]`, `[DOM]`).
   - Logs include the context (e.g., XHR, Fetch, DOM) and source information for debugging.
   - Check the browser console for additional `[URL Hook]` logs.

## Installation
1. Copy the contents of `src/urlHook.js` from the repository or download it:
   ```bash
   git clone https://github.com/hamidrezafarzin/DOM-Link-watcher.git
   ```
2. Open your browser's developer tools (usually F12), navigate to the Console tab, paste the script, and press Enter to run it.
3. Alternatively, include `src/urlHook.js` in your project and load it via a `<script>` tag.

## Requirements
- A modern web browser with JavaScript enabled.
- No external dependencies are required.

## Limitations
- The script may not capture URLs in certain edge cases (e.g., malformed URLs or CORS-restricted scripts).
- Fetching external script content for URL scanning depends on CORS permissions.
- Performance may vary on heavy DOM mutations or large pages.

## Contributing
Feel free to submit issues or pull requests to improve functionality or fix bugs.

## License
MIT License