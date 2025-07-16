(() => {
  if (window.__urlHookInjected) return;
  window.__urlHookInjected = true;

  const urlRegex = /https?:\/\/[^\s"%27<>]+/gi;
  const urlSet = new Set();

  // Function to get a simplified stack trace for debugging
  const getSourceInfo = () => {
    try {
      const stack = new Error().stack.split('\n');
      const callerLine = stack[3] || stack[2] || '';
      const match = callerLine.match(/(https?:\/\/[^/]+[^:]*|[^:]+):(\d+)/);
      return match ? `${match[1]}:${match[2]}` : 'unknown source';
    } catch (e) {
      return 'unknown source';
    }
  };

  // Log URL with source context
  const logUrl = (url, context) => {
    if (!urlSet.has(url)) {
      urlSet.add(url);
      const sourceInfo = getSourceInfo();
      const logEntry = `[${context}] ${url} (Source: ${sourceInfo})`;
      const logDiv = document.createElement('div');
      logDiv.textContent = logEntry;
      panel.appendChild(logDiv);
      panel.scrollTop = panel.scrollHeight;
      console.log(`[URL Hook] ${logEntry}`);
    }
  };

  // Create the display panel
  const panel = document.createElement('div');
  panel.style.position = 'fixed';
  panel.style.bottom = '0';
  panel.style.left = '0';
  panel.style.width = '100%';
  panel.style.maxHeight = '250px';
  panel.style.overflowY = 'auto';
  panel.style.backgroundColor = 'rgba(0,0,0,0.85)';
  panel.style.color = 'lime';
  panel.style.fontFamily = 'monospace';
  panel.style.fontSize = '12px';
  panel.style.zIndex = '9999999999';
  panel.style.padding = '5px 10px';
  panel.style.borderTop = '3px solid lime';
  panel.innerHTML = '<strong>URL Hook Panel</strong><br>';
  document.body.appendChild(panel);

  // Hook XMLHttpRequest
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    logUrl(`[XHR] ${method}: ${url}`, 'XHR');
    return originalXhrOpen.apply(this, arguments);
  };

  // Hook fetch
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    const url = typeof input === 'string' ? input : input?.url;
    if (url) logUrl(`[Fetch] URL: ${url}`, 'Fetch');
    return originalFetch.apply(this, arguments);
  };

  // Hook history.pushState
  const originalPushState = history.pushState;
  history.pushState = function(state, title, url) {
    if (url) logUrl(`[History] pushState: ${url}`, 'History.pushState');
    return originalPushState.apply(this, arguments);
  };

  // Hook history.replaceState
  const originalReplaceState = history.replaceState;
  history.replaceState = function(state, title, url) {
    if (url) logUrl(`[History] replaceState: ${url}`, 'History.replaceState');
    return originalReplaceState.apply(this, arguments);
  };

  // Hook createElement for specific tags
  const originalCreateElement = document.createElement;
  document.createElement = function(tag, options) {
    const element = originalCreateElement.call(document, tag, options);
    if (['script', 'iframe', 'img', 'link', 'audio', 'video', 'source'].includes(tag.toLowerCase())) {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (['src', 'href'].includes(name) && value && urlRegex.test(value)) {
          logUrl(`[Element Hook] <${tag}> ${name}: ${value}`, `Element.${tag}`);
        }
        return originalSetAttribute.apply(this, arguments);
      };
    }
    return element;
  };

  // Scan scripts (external and inline)
  async function scanScripts() {
    try {
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].src;
        if (src) {
          try {
            const response = await fetch(src);
            if (!response.ok) continue;
            const text = await response.text();
            let match;
            while ((match = urlRegex.exec(text)) !== null) {
              logUrl(`[Script Source] ${match[0]}`, `ScriptSource.${src}`);
            }
          } catch (e) {
            console.warn('Error fetching script:', e);
          }
        }
      }
      [...document.scripts].filter(s => !s.src).forEach(script => {
        const matches = script.textContent.match(urlRegex);
        if (matches) {
          matches.forEach(url => logUrl(`[Inline Script] ${url}`, 'InlineScript'));
        }
      });
    } catch (e) {
      console.warn('Error scanning scripts:', e);
    }
  }

  // MutationObserver for DOM changes
  new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent && urlRegex.test(node.textContent)) {
          logUrl(`[DOM] Text Node URL: ${node.textContent.trim()}`, 'DOM.TextNode');
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          Array.from(node.attributes || []).filter(attr => attr.value && urlRegex.test(attr.value)).forEach(attr => {
            logUrl(`[DOM] Attribute URL: ${attr.name}=${attr.value}`, 'DOM.Attribute');
          });
        }
      });
    });
  }).observe(document.body, { childList: true, subtree: true, attributes: true });

  // Hook click events for <a> tags
  document.addEventListener('click', e => {
    const anchor = e.target.closest('a');
    if (anchor && anchor.href && urlRegex.test(anchor.href)) {
      logUrl(`[Click] <a> href: ${anchor.href}`, 'Click.Anchor');
    }
  });

  // Hook form submissions
  document.addEventListener('submit', e => {
    const form = e.target;
    if (form.action && urlRegex.test(form.action)) {
      logUrl(`[Form Submit] action: ${form.action}`, 'FormSubmit');
    }
  });

  // Run script scan on page load
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    scanScripts();
  } else {
    window.addEventListener('DOMContentLoaded', scanScripts);
  }

  console.log('%c🌐 Enhanced URL Hook Initialized! Panel at bottom.', 'color: lime; font-weight: bold;');
})();