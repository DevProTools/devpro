// Color Converter (Hex ↔ RGB ↔ HSL)
export function init(container, { copyToClipboard, showToast, ICONS }) {
  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) } : null;
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h=0, s, l = (max+min)/2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g-b)/d + (g<b?6:0)) / 6;
      else if (max === g) h = ((b-r)/d + 2) / 6;
      else h = ((r-g)/d + 4) / 6;
    }
    return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
  }

  function renderColorPreview(r, g, b) {
    return `<div style="width:100%;height:48px;border-radius:var(--radius-md);background:rgb(${r},${g},${b});border:1px solid var(--border-primary)"></div>`;
  }

  container.innerHTML = `
    <div class="editor-pair">
      <div class="editor-section">
        <label>Color Value</label>
        <input type="text" class="editor-input" id="color-input" value="#0288d1" placeholder="#FF0000 or rgb(255,0,0)" style="min-height:auto;height:44px;font-family:var(--font-mono)" />
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-primary" id="color-convert">${ICONS.arrow} Convert</button>
        <button class="btn btn-icon" id="color-copy" aria-label="Copy output">${ICONS.copy}</button>
      </div>
      <div class="editor-section">
        <label>Output</label>
        <div class="editor-output" id="color-output" style="min-height:100px"></div>
      </div>
    </div>
  `;

  const input = container.querySelector('#color-input');
  const output = container.querySelector('#color-output');

  function convert() {
    let val = input.value.trim();
    let r, g, b;

    // Try hex
    const hexMatch = /^#?([a-f\d]{3}|[a-f\d]{6})$/i.exec(val);
    if (hexMatch) {
      let hex = hexMatch[1];
      if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
      const rgb = hexToRgb('#' + hex);
      if (rgb) { r = rgb.r; g = rgb.g; b = rgb.b; }
    }

    // Try rgb()
    if (r === undefined) {
      const m = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/.exec(val);
      if (m) { r = +m[1]; g = +m[2]; b = +m[3]; }
    }

    if (r === undefined) {
      output.innerHTML = 'Unrecognized color format. Try hex (#FF0000) or rgb(r,g,b)';
      return;
    }

    const hsl = rgbToHsl(r, g, b);
    const hex = '#' + [r,g,b].map(c => c.toString(16).padStart(2,'0')).join('');
    output.innerHTML = `
      ${renderColorPreview(r,g,b)}
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px;font-family:var(--font-mono);font-size:0.85rem">
        <div><strong>HEX</strong><br/>${hex}</div>
        <div><strong>RGB</strong><br/>rgb(${r}, ${g}, ${b})</div>
        <div><strong>HSL</strong><br/>hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)</div>
      </div>
    `;
  }

  container.querySelector('#color-convert').addEventListener('click', convert);
  container.querySelector('#color-copy').addEventListener('click', () => copyToClipboard(output.textContent.replace(/<[^>]*>/g, '')));
  convert(); // Initial
}
