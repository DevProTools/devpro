// Text Diff (Pro Feature)
export function init(container, { copyToClipboard, showToast, ICONS }) {
  container.innerHTML = `
    <div class="editor-pair">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="editor-section">
          <label>Original</label>
          <textarea class="editor-input" id="diff-a" placeholder="Original text..." spellcheck="false" style="min-height:200px">Hello, this is the original text.
It has multiple lines.
Some lines are the same.</textarea>
        </div>
        <div class="editor-section">
          <label>Modified</label>
          <textarea class="editor-input" id="diff-b" placeholder="Modified text..." spellcheck="false" style="min-height:200px">Hello, this is the modified text.
It has multiple lines.
Some lines are different.</textarea>
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
        <button class="btn btn-primary" id="diff-compare">${ICONS.code} Compare</button>
        <button class="btn btn-icon" id="diff-copy" aria-label="Copy diff">${ICONS.copy}</button>
      </div>
      <div class="editor-section">
        <label>Diff Output</label>
        <div class="editor-output" id="diff-output" style="min-height:200px;font-family:var(--font-mono);font-size:0.82rem;padding:0;overflow:hidden"></div>
      </div>
    </div>
  `;

  const a = container.querySelector('#diff-a');
  const b = container.querySelector('#diff-b');
  const output = container.querySelector('#diff-output');

  function compare() {
    const linesA = a.value.split('\n');
    const linesB = b.value.split('\n');

    // Simple LCS-based diff
    const dp = Array.from({length: linesA.length+1}, () => Array(linesB.length+1).fill(0));
    for (let i = 1; i <= linesA.length; i++) {
      for (let j = 1; j <= linesB.length; j++) {
        if (linesA[i-1] === linesB[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
        else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
      }
    }

    // Backtrack
    const result = [];
    let i = linesA.length, j = linesB.length;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && linesA[i-1] === linesB[j-1]) {
        result.unshift(`  ${linesA[i-1]}`);
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
        result.unshift(`+ ${linesB[j-1]}`);
        j--;
      } else {
        result.unshift(`- ${linesA[i-1]}`);
        i--;
      }
    }

    // Render with syntax highlighting
    output.innerHTML = result.map(line => {
      const cls = line.startsWith('+ ') ? 'diff-add' : line.startsWith('- ') ? 'diff-remove' : '';
      return `<div style="padding:2px 12px;${cls === 'diff-add' ? 'background:rgba(52,168,83,0.15);color:#34a853' : cls === 'diff-remove' ? 'background:rgba(234,67,53,0.15);color:#ea4335' : ''}">${line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`;
    }).join('');
  }

  container.querySelector('#diff-compare').addEventListener('click', compare);
  container.querySelector('#diff-copy').addEventListener('click', () => copyToClipboard(output.textContent));
  compare(); // Initial
}
