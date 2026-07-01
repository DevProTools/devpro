// UUID Generator
export function init(container, { copyToClipboard, showToast, ICONS }) {
  function genUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  container.innerHTML = `
    <div class="editor-pair">
      <div class="editor-section">
        <label>Generated UUIDs</label>
        <div class="editor-output" id="uuid-output" style="min-height:200px;font-size:0.8rem;line-height:2"></div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-primary" id="uuid-generate">${ICONS.refresh} Generate 1</button>
        <button class="btn" id="uuid-generate-5">Generate 5</button>
        <button class="btn" id="uuid-generate-50">Generate 50</button>
        <button class="btn btn-icon" id="uuid-copy" aria-label="Copy all">${ICONS.copy}</button>
        <button class="btn" id="uuid-clear">Clear</button>
      </div>
    </div>
  `;

  const output = container.querySelector('#uuid-output');

  function addUUIDs(n) {
    const items = [];
    for (let i = 0; i < n; i++) items.push(genUUID());
    const existing = output.textContent ? output.textContent.split('\n').filter(Boolean) : [];
    output.textContent = [...existing, ...items].join('\n');
  }

  // Generate initial set
  addUUIDs(3);

  container.querySelector('#uuid-generate').addEventListener('click', () => addUUIDs(1));
  container.querySelector('#uuid-generate-5').addEventListener('click', () => addUUIDs(5));
  container.querySelector('#uuid-generate-50').addEventListener('click', () => addUUIDs(50));
  container.querySelector('#uuid-copy').addEventListener('click', () => copyToClipboard(output.textContent));
  container.querySelector('#uuid-clear').addEventListener('click', () => { output.textContent = ''; });
}
