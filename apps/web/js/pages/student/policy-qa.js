/* ============================================================
   CAMPUSLINK — Placement Policy Q&A Page (Feature 10: RAG)
   Chat-like interface for asking placement policy questions.
   ============================================================ */
const StudentPolicyQA = (() => {
  let chatHistory = [];

  const SUGGESTED_QUESTIONS = [
    'What is the minimum CGPA required for placements?',
    'What is the Dream vs Super-Dream offer policy?',
    'Can I sit for more companies after getting an offer?',
    'What happens if I miss a placement drive?',
    'What are the rules for offer withdrawal?',
    'Which branches are eligible for IT roles?',
    'What is the backlog policy for campus placements?',
    'How does the placement drive process work?',
  ];

  async function render() {
    chatHistory = [];
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">AI-Powered Q&A</div><h1 class="page-title">Placement Policy Assistant</h1><p class="page-subtitle">Ask anything about placement policies, eligibility, rules, and process. Powered by RAG (Retrieval-Augmented Generation).</p></div></div>
      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up">
            <div class="card-header"><h2 class="card-title">Ask a Question</h2><span class="badge badge-accent">RAG + LLM</span></div>
            <div class="interview-chat" id="policy-chat" style="min-height:300px;max-height:500px">
              <div class="chat-bubble ai">
                👋 Hi! I'm your Placement Policy Assistant. Ask me anything about eligibility criteria, drive processes, offer rules, or withdrawal policies.<br><br>
                <em class="text-xs" style="opacity:0.7">I use Retrieval-Augmented Generation (RAG) to find answers from official policy documents.</em>
              </div>
            </div>
            <div class="flex gap-3 mt-4">
              ${Forms.input({ id: 'policy-question', placeholder: 'Type your question about placement policies...', style: 'flex:1' })}
              <button class="btn btn-primary" id="policy-ask-btn" onclick="StudentPolicyQA.askQuestion()">Ask</button>
            </div>
          </article>
        </div>
        <aside class="stack">
          <article class="card card-accent animate-fade-in-up" style="animation-delay:80ms">
            <h3 class="card-title mb-4">💡 Suggested Questions</h3>
            <div class="stack" style="gap:var(--space-2)">
              ${SUGGESTED_QUESTIONS.map(q => `
                <button class="btn btn-sm btn-ghost" style="text-align:left;white-space:normal;height:auto;padding:var(--space-2) var(--space-3)" onclick="StudentPolicyQA.askSuggested('${q.replace(/'/g, "\\'")}')">${q}</button>
              `).join('')}
            </div>
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:150ms">
            <div class="card-header"><h2 class="card-title">How It Works</h2></div>
            <div class="stack" style="gap:var(--space-3)">
              <div class="flex items-center gap-3"><div class="milestone-number">1</div><div><div class="text-sm font-bold">Document Retrieval</div><div class="text-xs text-muted">Your question is matched against policy documents using vector search</div></div></div>
              <div class="flex items-center gap-3"><div class="milestone-number">2</div><div><div class="text-sm font-bold">Context Assembly</div><div class="text-xs text-muted">Relevant policy sections are extracted and assembled</div></div></div>
              <div class="flex items-center gap-3"><div class="milestone-number">3</div><div><div class="text-sm font-bold">AI Answer</div><div class="text-xs text-muted">LLM generates a precise answer based on retrieved context</div></div></div>
            </div>
          </article>
        </aside>
      </div>
    `;
  }

  function askSuggested(question) {
    const input = document.getElementById('policy-question');
    if (input) input.value = question;
    askQuestion();
  }

  async function askQuestion() {
    const input = document.getElementById('policy-question');
    const question = input?.value?.trim();
    if (!question || question.length < 3) { Toast.warning('Please type a question'); return; }

    const btn = document.getElementById('policy-ask-btn');
    btn.textContent = 'Thinking...'; btn.disabled = true;
    input.value = '';

    // Add user bubble
    const chat = document.getElementById('policy-chat');
    chat.innerHTML += `<div class="chat-bubble user">${question.replace(/</g, '&lt;')}</div>`;
    chat.innerHTML += `<div class="chat-bubble ai" id="policy-loading" style="opacity:0.6"><em>Searching policy documents...</em></div>`;
    chat.scrollTop = chat.scrollHeight;

    const result = await API.post('/ai/policy-qa', { question });

    btn.textContent = 'Ask'; btn.disabled = false;

    // Remove loading bubble
    const loading = document.getElementById('policy-loading');
    if (loading) loading.remove();

    // Add AI answer bubble with progressive typewriter effect
    const answerText = result.answer || 'I could not find an answer. Please contact the Placement Office.';
    const answerBubble = document.createElement('div');
    answerBubble.className = 'chat-bubble ai';

    const contentEl = document.createElement('div');
    contentEl.className = 'ai-answer-content';
    answerBubble.appendChild(contentEl);

    let metaEl = null;
    if ((result.sources && result.sources.length > 0) || result.source) {
      metaEl = document.createElement('div');
      metaEl.className = 'ai-meta-fadein hidden';
      metaEl.style.marginTop = 'var(--space-3)';
      metaEl.style.borderTop = '1px solid var(--border-default)';
      metaEl.style.paddingTop = 'var(--space-2)';

      let innerMeta = '';
      if (result.sources && result.sources.length > 0) {
        innerMeta += `<div class="text-xs text-muted mb-1 font-bold">📄 Policy Sources:</div><div class="flex flex-wrap gap-1">${result.sources.map(s => `<span class="badge badge-ghost text-xs" style="margin:2px">${AIText.escapeHtml(s.document)}</span>`).join('')}</div>`;
      }
      if (result.source) {
        innerMeta += `<div class="text-xs text-muted mt-2" style="opacity:0.6">Engine: ${AIText.escapeHtml(result.source)}</div>`;
      }
      metaEl.innerHTML = innerMeta;
      answerBubble.appendChild(metaEl);
    }

    chat.appendChild(answerBubble);
    chat.scrollTop = chat.scrollHeight;

    AIText.typewriter({
      element: contentEl,
      text: answerText,
      speed: 20,
      onProgress: () => {
        chat.scrollTop = chat.scrollHeight;
      },
      onComplete: () => {
        if (metaEl) metaEl.classList.remove('hidden');
        chat.scrollTop = chat.scrollHeight;
      },
    });

    chatHistory.push({ question, answer: result.answer, sources: result.sources });
  }

  return { render, askQuestion, askSuggested };
})();
