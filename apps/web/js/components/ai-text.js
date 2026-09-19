/* ============================================================
   CAMPUSLINK — AI Text & Markdown Formatter + Typewriter
   Handles semantic Markdown formatting and progressive
   word-by-word typing animations for AI responses.
   ============================================================ */

const AIText = (() => {

  /**
   * Escape HTML entities to prevent XSS.
   */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Format inline markdown: bold, italic, code.
   */
  function formatInline(str) {
    if (!str) return '';
    let s = escapeHtml(str);

    // Bold: **text** or __text__
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Inline code: `code`
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Italic: *text* or _text_ (excluding inside tags)
    s = s.replace(/(^|[^\*])\*([^\*]+)\*([^\*]|$)/g, '$1<em>$2</em>$3');
    s = s.replace(/(^|[^_])_([^_]+)_([^_]|$)/g, '$1<em>$2</em>$3');

    return s;
  }

  /**
   * Balance unclosed markdown tags during progressive streaming
   * so unfinished formatting doesn't flicker or show raw markers.
   */
  function balanceStreamTags(raw) {
    let s = raw;
    // Balance bold **
    const boldMatches = s.match(/\*\*/g);
    if (boldMatches && boldMatches.length % 2 === 1) {
      s += '**';
    }
    // Balance code `
    const codeMatches = s.match(/`/g);
    if (codeMatches && codeMatches.length % 2 === 1) {
      s += '`';
    }
    // Balance single asterisk italic (not part of **)
    const singleAsterisks = s.replace(/\*\*/g, '').match(/\*/g);
    if (singleAsterisks && singleAsterisks.length % 2 === 1) {
      s += '*';
    }
    return s;
  }

  /**
   * Format full Markdown into structured, styled HTML.
   * Handles headings, standalone bold titles, lists, callout boxes, and paragraphs.
   */
  function format(text, { streamMode = false } = {}) {
    if (!text) return '';

    let content = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    if (streamMode) {
      content = balanceStreamTags(content);
    }

    const lines = content.split('\n');
    const out = [];
    let inList = false;
    let listType = 'ul'; // 'ul' or 'ol'
    let currentParagraph = [];

    function flushParagraph() {
      if (currentParagraph.length > 0) {
        const pText = currentParagraph.join(' ').trim();
        if (pText) {
          out.push(`<p class="ai-p">${formatInline(pText)}</p>`);
        }
        currentParagraph = [];
      }
    }

    function flushList() {
      if (inList) {
        out.push(listType === 'ol' ? '</ol>' : '</ul>');
        inList = false;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Blank line: flush current paragraph / list
      if (!trimmed) {
        flushParagraph();
        flushList();
        continue;
      }

      // 1. Markdown Headers: #, ##, ###, ####
      const headerMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (headerMatch) {
        flushParagraph();
        flushList();
        const level = headerMatch[1].length;
        const tag = level <= 2 ? 'h3' : 'h4';
        out.push(`<${tag} class="ai-heading">${formatInline(headerMatch[2])}</${tag}>`);
        continue;
      }

      // 2. Standalone bold title line: **Title text**
      const boldTitleMatch = trimmed.match(/^\*\*([^*]+)\*\*:?$/);
      if (boldTitleMatch) {
        flushParagraph();
        flushList();
        out.push(`<h4 class="ai-heading">${formatInline(boldTitleMatch[1])}</h4>`);
        continue;
      }

      // 3. Callout Notes: **Note**:, **Important**:, **Warning**:
      const noteMatch = trimmed.match(/^\*\*(Note|Important|Warning|Caution|Tip|Notice)\*\*:\s*(.*)$/i);
      if (noteMatch) {
        flushParagraph();
        flushList();
        const noteType = noteMatch[1];
        const noteBody = noteMatch[2];
        const icon = /warning|caution/i.test(noteType) ? '⚠️' : /tip/i.test(noteType) ? '💡' : '📌';
        out.push(`
          <div class="ai-note-box">
            <strong class="ai-note-label">${icon} ${escapeHtml(noteType)}:</strong> ${formatInline(noteBody)}
          </div>
        `);
        continue;
      }

      // 4. Unordered List Items: - item, * item, • item
      const uListMatch = trimmed.match(/^[-*•](\s+(.*))?$/);
      if (uListMatch) {
        flushParagraph();
        if (!inList || listType !== 'ul') {
          flushList();
          out.push('<ul class="ai-list">');
          inList = true;
          listType = 'ul';
        }
        const itemContent = uListMatch[2] ? formatInline(uListMatch[2]) : '';
        out.push(`<li>${itemContent}</li>`);
        continue;
      }

      // 5. Ordered List Items: 1. item
      const oListMatch = trimmed.match(/^(\d+)\.(\s+(.*))?$/);
      if (oListMatch) {
        flushParagraph();
        if (!inList || listType !== 'ol') {
          flushList();
          out.push('<ol class="ai-list">');
          inList = true;
          listType = 'ol';
        }
        const itemContent = oListMatch[3] ? formatInline(oListMatch[3]) : '';
        out.push(`<li>${itemContent}</li>`);
        continue;
      }

      // 6. Regular text line: collect in paragraph
      flushList();
      currentParagraph.push(trimmed);
    }

    flushParagraph();
    flushList();

    return `<div class="ai-markdown">${out.join('')}</div>`;
  }

  /**
   * Word-by-word typing animation.
   * Progressively renders tokens with live Markdown formatting and typing cursor.
   *
   * @param {Object} options
   * @param {HTMLElement} options.element - Container element to type into
   * @param {string} options.text - Full text to type
   * @param {number} [options.speed=22] - Delay in milliseconds per token
   * @param {Function} [options.onProgress] - Callback on each word typed
   * @param {Function} [options.onComplete] - Callback when typing completes
   * @returns {Object} Controller with finish() and stop() methods
   */
  function typewriter({
    element,
    text = '',
    speed = 22,
    onProgress = null,
    onComplete = null,
  }) {
    if (!element) return { finish: () => {}, stop: () => {} };

    // Cancel any previous typing on this element
    if (element._aiTypewriterTimer) {
      clearInterval(element._aiTypewriterTimer);
      element._aiTypewriterTimer = null;
    }
    if (element._aiTypewriterClickHandler) {
      element.removeEventListener('click', element._aiTypewriterClickHandler);
      element._aiTypewriterClickHandler = null;
    }

    // Split text into word + whitespace tokens
    const tokens = text.match(/\S+\s*|\n+/g) || [text];
    let currentIndex = 0;
    let completed = false;

    function renderFrame(index, isFinal = false) {
      const currentRaw = tokens.slice(0, index + 1).join('');
      const formattedHtml = format(currentRaw, { streamMode: !isFinal });
      if (isFinal) {
        element.innerHTML = formattedHtml;
      } else {
        // Insert cursor right before closing </div> of .ai-markdown
        const cursorHtml = '<span class="ai-cursor" aria-hidden="true"></span>';
        if (formattedHtml.endsWith('</div>')) {
          element.innerHTML = formattedHtml.slice(0, -6) + cursorHtml + '</div>';
        } else {
          element.innerHTML = formattedHtml + cursorHtml;
        }
      }
      if (onProgress) {
        try { onProgress(); } catch (_) {}
      }
    }

    function finish() {
      if (completed) return;
      completed = true;
      if (element._aiTypewriterTimer) {
        clearInterval(element._aiTypewriterTimer);
        element._aiTypewriterTimer = null;
      }
      if (element._aiTypewriterClickHandler) {
        element.removeEventListener('click', element._aiTypewriterClickHandler);
        element._aiTypewriterClickHandler = null;
        element.style.cursor = '';
      }
      renderFrame(tokens.length - 1, true);
      if (onComplete) {
        try { onComplete(); } catch (err) { console.error(err); }
      }
    }

    function stop() {
      completed = true;
      if (element._aiTypewriterTimer) {
        clearInterval(element._aiTypewriterTimer);
        element._aiTypewriterTimer = null;
      }
      if (element._aiTypewriterClickHandler) {
        element.removeEventListener('click', element._aiTypewriterClickHandler);
        element._aiTypewriterClickHandler = null;
      }
    }

    // Click on element immediately reveals full text
    element.style.cursor = 'pointer';
    element.title = 'Click to skip animation';
    const clickHandler = () => finish();
    element._aiTypewriterClickHandler = clickHandler;
    element.addEventListener('click', clickHandler);

    // Initial first word
    renderFrame(0, false);

    // Start interval
    element._aiTypewriterTimer = setInterval(() => {
      currentIndex++;
      if (currentIndex >= tokens.length) {
        finish();
      } else {
        renderFrame(currentIndex, false);
      }
    }, Math.max(10, speed));

    return { finish, stop };
  }

  return {
    escapeHtml,
    formatInline,
    format,
    typewriter,
  };
})();

if (typeof window !== 'undefined') window.AIText = AIText;
if (typeof module !== 'undefined' && module.exports) module.exports = AIText;
