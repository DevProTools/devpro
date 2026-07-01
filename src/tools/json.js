// JSON Formatter & Validator
export function init(container, { copyToClipboard, showToast, ICONS }) {
  container.innerHTML = `
    <div class="editor-pair">
      <div class="editor-section">
        <label>Input</label>
        <textarea class="editor-input" id="json-input" placeholder='{"key": "value", "nested": {"array": [1, 2, 3]}}' spellcheck="false">{"name":"DevPro","version":"1.0","features":["json","jwt","base64"]}</textarea>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-primary" id="json-format">${ICONS.code} Format</button>
        <button class="btn" id="json-minify">Minify</button>
        <button class="btn" id="json-validate">Validate</button>
        <button class="btn btn-icon" id="json-copy" aria-label="Copy output">${ICONS.copy}</button>
      </div>
      <div class="editor-section">
        <label>Output</label>
        <div class="editor-output" id="json-output"></div>
      </div>
    </div>
  `;

  const input = container.querySelector('#json-input');
  const output = container.querySelector('#json-output');

  function format(space) {
    try {
      const parsed = JSON.parse(input.value);
      output.textContent = JSON.stringify(parsed, null, space);
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
    }
  }

  container.querySelector('#json-format').addEventListener('click', () => format(2));
  container.querySelector('#json-minify').addEventListener('click', () => format(0));
  container.querySelector('#json-validate').addEventListener('click', () => {
    try {
      JSON.parse(input.value);
      output.textContent = '✓ Valid JSON';
    } catch (e) {
      output.textContent = `✗ ${e.message}`;
    }
  });
  container.querySelector('#json-copy').addEventListener('click', () => copyToClipboard(output.textContent));
}
