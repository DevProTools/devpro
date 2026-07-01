// Base64 Encode / Decode
export function init(container, { copyToClipboard, showToast, ICONS }) {
  container.innerHTML = `
    <div class="editor-pair">
      <div class="editor-section">
        <label>Input</label>
        <textarea class="editor-input" id="b64-input" placeholder="Text or Base64 string" spellcheck="false">DevPro is awesome!</textarea>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-primary" id="b64-encode">${ICONS.arrow} Encode</button>
        <button class="btn" id="b64-decode">${ICONS.code} Decode</button>
        <button class="btn btn-icon" id="b64-copy" aria-label="Copy output">${ICONS.copy}</button>
      </div>
      <div class="editor-section">
        <label>Output</label>
        <div class="editor-output" id="b64-output"></div>
      </div>
    </div>
  `;

  const input = container.querySelector('#b64-input');
  const output = container.querySelector('#b64-output');

  container.querySelector('#b64-encode').addEventListener('click', () => {
    try {
      output.textContent = btoa(input.value);
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
    }
  });

  container.querySelector('#b64-decode').addEventListener('click', () => {
    try {
      output.textContent = atob(input.value);
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
    }
  });

  container.querySelector('#b64-copy').addEventListener('click', () => copyToClipboard(output.textContent));
}
