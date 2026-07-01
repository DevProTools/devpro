// Regex Tester
export function init(container, { copyToClipboard, showToast, ICONS }) {
  container.innerHTML = `
    <div class="editor-pair">
      <div class="editor-section">
        <label>Regular Expression</label>
        <input type="text" class="editor-input" id="regex-pattern" value="(\\w+)@" placeholder="/pattern/flags" style="min-height:auto;height:44px;font-family:var(--font-mono)" />
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
        <label style="display:flex;align-items:center;gap:4px;font-size:0.85rem;cursor:pointer">
          <input type="checkbox" id="regex-global" checked /> g
        </label>
        <label style="display:flex;align-items:center;gap:4px;font-size:0.85rem;cursor:pointer">
          <input type="checkbox" id="regex-insensitive" /> i
        </label>
        <label style="display:flex;align-items:center;gap:4px;font-size:0.85rem;cursor:pointer">
          <input type="checkbox" id="regex-multiline" /> m
        </label>
      </div>
      <div class="editor-section">
        <label>Test String</label>
        <textarea class="editor-input" id="regex-input" placeholder="Enter text to test against" spellcheck="false">Contact us at hello@devpro.com or support@example.com</textarea>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-primary" id="regex-test">${ICONS.code} Test</button>
        <button class="btn btn-icon" id="regex-copy" aria-label="Copy results">${ICONS.copy}</button>
      </div>
      <div class="editor-section">
        <label>Matches</label>
        <div class="editor-output" id="regex-output" style="min-height:100px"></div>
      </div>
    </div>
  `;

  const pattern = container.querySelector('#regex-pattern');
  const input = container.querySelector('#regex-input');
  const output = container.querySelector('#regex-output');
  const cbGlobal = container.querySelector('#regex-global');
  const cbInsensitive = container.querySelector('#regex-insensitive');
  const cbMultiline = container.querySelector('#regex-multiline');

  function test() {
    try {
      let flags = '';
      if (cbGlobal.checked) flags += 'g';
      if (cbInsensitive.checked) flags += 'i';
      if (cbMultiline.checked) flags += 'm';
      const re = new RegExp(pattern.value, flags);
      const matches = [...input.value.matchAll(re)];
      if (matches.length === 0) {
        output.textContent = 'No matches found';
        return;
      }
      const lines = matches.map((m, i) => {
        const groups = m.slice(1).filter(g => g !== undefined).join(', ');
        return `[${i}] "${m[0]}"${groups ? ' → groups: ' + groups : ''}`;
      });
      output.textContent = `Found ${matches.length} match${matches.length > 1 ? 'es' : ''}:\n` + lines.join('\n');
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
    }
  }

  container.querySelector('#regex-test').addEventListener('click', test);
  container.querySelector('#regex-copy').addEventListener('click', () => copyToClipboard(output.textContent));
  test(); // Initial run
}
