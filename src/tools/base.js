// Number Base Converter
export function init(container, { copyToClipboard, showToast, ICONS }) {
  const BASES = [
    { value: 2,  label: 'Binary (2)' },
    { value: 8,  label: 'Octal (8)' },
    { value: 10, label: 'Decimal (10)' },
    { value: 16, label: 'Hex (16)' },
    { value: 32, label: 'Base32' },
    { value: 36, label: 'Base36' },
  ];

  container.innerHTML = `
    <div class="editor-pair">
      <div class="editor-section">
        <label>Value</label>
        <input type="text" class="editor-input" id="base-input" value="255" placeholder="Enter a number" style="min-height:auto;height:44px;font-family:var(--font-mono)" />
      </div>
      <div class="editor-section">
        <label>From Base</label>
        <select class="editor-input" id="base-from" style="min-height:auto;height:44px">${BASES.map(b => `<option value="${b.value}">${b.label}</option>`).join('')}</select>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-primary" id="base-convert">${ICONS.arrow} Convert All</button>
        <button class="btn btn-icon" id="base-copy" aria-label="Copy output">${ICONS.copy}</button>
      </div>
      <div class="editor-section">
        <label>Results</label>
        <div class="editor-output" id="base-output" style="min-height:200px;font-family:var(--font-mono);font-size:0.82rem"></div>
      </div>
    </div>
  `;

  const input = container.querySelector('#base-input');
  const fromSelect = container.querySelector('#base-from');
  const output = container.querySelector('#base-output');

  function convert() {
    const fromBase = parseInt(fromSelect.value);
    const val = input.value.trim();

    let num;
    try {
      num = parseInt(val, fromBase);
      if (isNaN(num)) throw new Error('Invalid number');
    } catch (e) {
      output.textContent = `Error: Invalid number for base ${fromBase}`;
      return;
    }

    const lines = BASES.map(b => {
      const converted = num.toString(b.value).toUpperCase();
      return `${b.label.padEnd(16)} ${converted}`;
    });
    output.textContent = lines.join('\n');
  }

  container.querySelector('#base-convert').addEventListener('click', convert);
  container.querySelector('#base-copy').addEventListener('click', () => copyToClipboard(output.textContent));
  convert(); // Initial
}
