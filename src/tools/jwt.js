// JWT Decoder
export function init(container, { copyToClipboard, showToast, ICONS }) {
  container.innerHTML = `
    <div class="editor-pair">
      <div class="editor-section">
        <label>JWT Token</label>
        <textarea class="editor-input" id="jwt-input" placeholder="Paste your JWT here..." spellcheck="false">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRldlBybyIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c</textarea>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-primary" id="jwt-decode">${ICONS.code} Decode</button>
        <button class="btn" id="jwt-clear">Clear</button>
      </div>
      <div class="editor-section">
        <label>Header</label>
        <div class="editor-output" id="jwt-header" style="min-height:80px"></div>
      </div>
      <div class="editor-section">
        <label>Payload</label>
        <div class="editor-output" id="jwt-payload" style="min-height:120px"></div>
      </div>
    </div>
  `;

  const input = container.querySelector('#jwt-input');
  const outHeader = container.querySelector('#jwt-header');
  const outPayload = container.querySelector('#jwt-payload');

  function decode() {
    const parts = input.value.trim().split('.');
    if (parts.length !== 3) {
      outHeader.textContent = 'Error: Invalid JWT format (expected 3 parts)';
      outPayload.textContent = '';
      return;
    }
    try {
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      outHeader.textContent = JSON.stringify(header, null, 2);
      outPayload.textContent = JSON.stringify(payload, null, 2);
    } catch (e) {
      outHeader.textContent = `Error: ${e.message}`;
      outPayload.textContent = '';
    }
  }

  container.querySelector('#jwt-decode').addEventListener('click', decode);
  container.querySelector('#jwt-clear').addEventListener('click', () => {
    input.value = '';
    outHeader.textContent = '';
    outPayload.textContent = '';
  });
}
