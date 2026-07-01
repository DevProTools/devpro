// URL Encode / Decode
export function init(container, { copyToClipboard, showToast, ICONS }) {
  container.innerHTML = `
    <div class="editor-pair">
      <div class="editor-section">
        <label>Input</label>
        <textarea class="editor-input" id="url-input" placeholder="URL or text to encode/decode" spellcheck="false">https://devpro.com/tools?name=developer utilities&version=1.0</textarea>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-primary" id="url-encode">${ICONS.arrow} Encode</button>
        <button class="btn" id="url-decode">Decode</button>
        <button class="btn btn-icon" id="url-copy" aria-label="Copy output">${ICONS.copy}</button>
      </div>
      <div class="editor-section">
        <label>Output</label>
        <div class="editor-output" id="url-output"></div>
      </div>
    </div>
  `;

  const input = container.querySelector('#url-input');
  const output = container.querySelector('#url-output');

  container.querySelector('#url-encode').addEventListener('click', () => {
    try { output.textContent = encodeURIComponent(input.value); }
    catch (e) { output.textContent = `Error: ${e.message}`; }
  });

  container.querySelector('#url-decode').addEventListener('click', () => {
    try { output.textContent = decodeURIComponent(input.value); }
    catch (e) { output.textContent = `Error: ${e.message}`; }
  });

  container.querySelector('#url-copy').addEventListener('click', () => copyToClipboard(output.textContent));
}
