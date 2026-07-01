// Timestamp Converter
export function init(container, { copyToClipboard, showToast, ICONS }) {
  container.innerHTML = `
    <div class="editor-pair">
      <div class="editor-section">
        <label>Unix Timestamp (seconds)</label>
        <input type="number" class="editor-input" id="ts-input" value="${Math.floor(Date.now() / 1000)}" style="min-height:auto;height:44px;font-size:1rem" />
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-primary" id="ts-to-date">${ICONS.arrow} To Date</button>
        <button class="btn" id="ts-now">Now</button>
      </div>
      <div class="editor-section">
        <label>Date & Time</label>
        <div class="editor-output" id="ts-output" style="min-height:44px;display:flex;align-items:center"></div>
      </div>
      <div style="border-top:1px solid var(--border-primary);padding-top:16px;margin-top:8px">
        <div class="editor-section">
          <label>Date to Timestamp</label>
          <input type="datetime-local" class="editor-input" id="ts-date-input" style="min-height:auto;height:44px" />
        </div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn btn-primary" id="ts-to-ts">${ICONS.arrow} To Timestamp</button>
        </div>
        <div class="editor-section" style="margin-top:8px">
          <label>Unix Timestamp</label>
          <div class="editor-output" id="ts-ts-output" style="min-height:44px;display:flex;align-items:center"></div>
        </div>
      </div>
    </div>
  `;

  const input = container.querySelector('#ts-input');
  const output = container.querySelector('#ts-output');
  const dateInput = container.querySelector('#ts-date-input');
  const tsOutput = container.querySelector('#ts-ts-output');

  // Set default datetime-local to now
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  dateInput.value = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

  container.querySelector('#ts-to-date').addEventListener('click', () => {
    const ts = parseInt(input.value);
    if (isNaN(ts)) { output.textContent = 'Invalid timestamp'; return; }
    output.textContent = new Date(ts * 1000).toLocaleString();
  });

  container.querySelector('#ts-now').addEventListener('click', () => {
    input.value = Math.floor(Date.now() / 1000);
    output.textContent = new Date().toLocaleString();
  });

  container.querySelector('#ts-to-ts').addEventListener('click', () => {
    const d = new Date(dateInput.value);
    if (isNaN(d.getTime())) { tsOutput.textContent = 'Invalid date'; return; }
    tsOutput.textContent = Math.floor(d.getTime() / 1000).toString();
  });

  // Auto-convert initial value
  output.textContent = new Date(parseInt(input.value) * 1000).toLocaleString();
}
