const GITHUB_OWNER = 'figuringexistence';
const GITHUB_REPO = 'figuringexistence.github.io';
const GITHUB_BRANCH = 'main';
const WORKFLOW_FILE = 'compiler-bridge.yml';

const icons = {
  python: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-3.5 0-3.3 1.5-3.3 1.5v1.6h3.4v.5H7.3S5 5.3 5 8.8s2 3.4 2 3.4h1.2v-1.6s-.1-1.9 1.9-1.9h3.2s1.8 0 1.8-1.8V4.2S15.3 2 12 2zm-1.8 1.3a.6.6 0 1 1 0 1.2.6.6 0 0 1 0-1.2zM12 22c3.5 0 3.3-1.5 3.3-1.5v-1.6h-3.4v-.5h4.8s2.3.3 2.3-3.2-2-3.4-2-3.4h-1.2v1.6s.1 1.9-1.9 1.9h-3.2s-1.8 0-1.8 1.8v2.7S8.7 22 12 22zm1.8-1.3a.6.6 0 1 1 0-1.2.6.6 0 0 1 0 1.2z"/></svg>`,
  r: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="12" rx="9" ry="6"/><text x="12" y="15.5" text-anchor="middle" fill="currentColor" stroke="none" font-size="10" font-weight="bold">R</text></svg>`,
  sql: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/></svg>`,
  html: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 3l1.4 15.8L12 21l6.6-2.2L20 3H4zm12.6 5.5H9.3l.2 2.1h6.9l-.5 5.6-3.9 1.1-3.9-1.1-.3-3h2l.1 1.5 2 .5 2-.5.2-2.2H7.6L7.1 6.5h9.7l-.2 2z"/></svg>`,
  java: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 10h10v6a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4v-6z"/><path d="M16 11h2.5a2.5 2.5 0 0 1 0 5H16"/><path d="M9 4c0 1.5-1 2-1 3.5M12 3.5c0 1.5-1 2-1 3.5"/></svg>`,
  kotlin: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="4,4 20,4 12,12 20,20 4,20"/></svg>`,
  c: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M15 9.5a3.8 3.8 0 1 0 0 5"/></svg>`,
  cpp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M11.5 9.5a3.2 3.2 0 1 0 0 5"/><path d="M14.5 11v2M13.5 12h2M17.5 11v2M16.5 12h2"/></svg>`,
  csharp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M12.5 9.5a3.2 3.2 0 1 0 0 5"/><path d="M15.2 10l-.5 4M16.8 10l-.5 4M14.2 11.2h3M14 12.8h3"/></svg>`,
  js: `<span>JS</span>`,
  ts: `<span>TS</span>`,
  go: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="11" cy="13" rx="6" ry="4.5"/><circle cx="16.5" cy="10.5" r="2.2"/><circle cx="17.2" cy="10.2" r="0.6" fill="currentColor"/><path d="M5 12H2.5M6 16.5l-2 1.5"/></svg>`,
  rust: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="7" stroke-dasharray="3 2"/><circle cx="12" cy="12" r="3"/></svg>`
};

const languages = [
  { id: 'python', name: 'Python', file: 'main.py', mode: 'python', engine: 'actions', template: 'print("Halo dari Python!")\n' },
  { id: 'r', name: 'R', file: 'main.r', mode: 'r', engine: 'actions', template: 'print("Halo dari R!")\n' },
  { id: 'sql', name: 'SQLite', file: 'query.sql', mode: 'sql', engine: 'actions', template: 'SELECT "Halo dari SQL!" AS pesan;\n' },
  { id: 'html', name: 'HTML/JS', file: 'index.html', mode: 'htmlmixed', engine: 'browser', template: '<!DOCTYPE html>\n<html>\n<body>\n  <h2 style="color:blue;">Halo HTML!</h2>\n</body>\n</html>' },
  { id: 'java', name: 'Java', file: 'Main.java', mode: 'text/x-java', engine: 'actions', template: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Halo dari Java!");\n    }\n}' },
  { id: 'kotlin', name: 'Kotlin', file: 'Main.kt', mode: 'text/x-kotlin', engine: 'actions', template: 'fun main() {\n    println("Halo dari Kotlin!")\n}' },
  { id: 'c', name: 'C', file: 'main.c', mode: 'text/x-csrc', engine: 'actions', template: '#include <stdio.h>\n\nint main() {\n    printf("Halo dari C!\\n");\n    return 0;\n}' },
  { id: 'cpp', name: 'C++', file: 'main.cpp', mode: 'text/x-c++src', engine: 'actions', template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Try clicking the Run button." << endl;\n    return 0;\n}' },
  { id: 'csharp', name: 'C#', file: 'Program.cs', mode: 'text/x-csharp', engine: 'actions', template: 'using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Halo dari C#!");\n    }\n}' },
  { id: 'js', name: 'JavaScript', file: 'main.js', mode: 'javascript', engine: 'local-js', template: 'console.log("Halo dari JavaScript!");' },
  { id: 'ts', name: 'TypeScript', file: 'main.ts', mode: 'text/typescript', engine: 'actions', template: 'const pesan: string = "Halo dari TypeScript!";\nconsole.log(pesan);' },
  { id: 'go', name: 'Go', file: 'main.go', mode: 'go', engine: 'actions', template: 'package main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Halo dari Go!")\n}' },
  { id: 'rust', name: 'Rust', file: 'main.rs', mode: 'rust', engine: 'actions', template: 'fn main() {\n    println!("Halo dari Rust!");\n}' }
];

let currentLang = languages[0];
let editor = null;

function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(b64) {
  return decodeURIComponent(escape(atob(b64)));
}

function getStorageKey(langId) {
  return `compiler_code_${langId}`;
}

function loadInitialCode(lang) {
  const params = new URLSearchParams(window.location.search);
  if (params.get('lang') === lang.id && params.get('code')) {
    try {
      return fromBase64(params.get('code'));
    } catch (_) {
      return lang.template;
    }
  }
  return localStorage.getItem(getStorageKey(lang.id)) || lang.template;
}

// Render Sidebar
const sidebar = document.getElementById('sidebar');
languages.forEach((lang, index) => {
  const btn = document.createElement('button');
  btn.className = `lang-btn ${index === 0 ? 'active' : ''}`;
  btn.title = lang.name;
  btn.innerHTML = icons[lang.id] || lang.id.toUpperCase();
  btn.onclick = () => selectLanguage(lang, btn);
  sidebar.appendChild(btn);
});

// Inisialisasi CodeMirror
const textarea = document.getElementById('codeEditor');
const initialCode = loadInitialCode(currentLang);

if (typeof CodeMirror !== 'undefined') {
  editor = CodeMirror.fromTextArea(textarea, {
    lineNumbers: true,
    theme: 'dracula',
    mode: currentLang.mode,
    indentUnit: 4,
    tabSize: 4
  });
  editor.setValue(initialCode);
  editor.on('change', () => {
    localStorage.setItem(getStorageKey(currentLang.id), editor.getValue());
  });
} else {
  textarea.value = initialCode;
  textarea.addEventListener('input', () => {
    localStorage.setItem(getStorageKey(currentLang.id), textarea.value);
  });
}

function getCodeValue() {
  return editor ? editor.getValue() : textarea.value;
}

function setCodeValue(val) {
  if (editor) {
    editor.setValue(val);
  } else {
    textarea.value = val;
  }
  localStorage.setItem(getStorageKey(currentLang.id), val);
}

function selectLanguage(lang, btnElement) {
  currentLang = lang;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  btnElement.classList.add('active');
  document.getElementById('fileName').textContent = lang.file;
  if (editor) editor.setOption('mode', lang.mode);
  setCodeValue(loadInitialCode(lang));
  clearOutput();
}

function setGithubToken() {
  const current = localStorage.getItem('gh_compiler_token') || '';
  const token = prompt('Masukkan GitHub Personal Access Token (scope: repo & workflow):', current);
  if (token !== null) {
    localStorage.setItem('gh_compiler_token', token.trim());
    alert('Token tersimpan di browser!');
  }
}

function copyCode() {
  navigator.clipboard.writeText(getCodeValue()).then(() => {
    const btn = document.getElementById('copyCodeBtn');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 1500);
  });
}

function resetCode() {
  localStorage.removeItem(getStorageKey(currentLang.id));
  setCodeValue(currentLang.template);
  document.getElementById('stdinInput').value = '';
  clearOutput();
}

function copyOutput() {
  navigator.clipboard.writeText(document.getElementById('outputBox').textContent).then(() => {
    const btn = document.getElementById('copyOutBtn');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 1500);
  });
}

async function runCode() {
  const code = getCodeValue();
  const stdin = document.getElementById('stdinInput').value;
  const outputBox = document.getElementById('outputBox');
  const htmlPreview = document.getElementById('htmlPreview');
  const runBtn = document.getElementById('runBtn');

  if (currentLang.engine === 'browser') {
    outputBox.style.display = 'none';
    htmlPreview.style.display = 'block';
    htmlPreview.srcdoc = code;
    return;
  }

  if (currentLang.engine === 'local-js') {
    htmlPreview.style.display = 'none';
    outputBox.style.display = 'block';
    let logs = [];
    const customLog = (...args) => logs.push(args.join(' '));
    try {
      const fn = new Function('console', code);
      fn({ log: customLog, error: customLog, warn: customLog });
      outputBox.style.color = '#9ece6a';
      outputBox.textContent = logs.join('\n') || '(Selesai tanpa output)';
    } catch (e) {
      outputBox.style.color = '#f7768e';
      outputBox.textContent = e.toString();
    }
    return;
  }

  const token = localStorage.getItem('gh_compiler_token');
  if (!token) {
    alert('Klik tombol "🔑 Token" terlebih dahulu untuk memasukkan GitHub Personal Access Token.');
    return;
  }

  htmlPreview.style.display = 'none';
  outputBox.style.display = 'block';
  outputBox.style.color = '#a9b1d6';
  outputBox.textContent = 'Mengirim kode ke GitHub Actions...';
  runBtn.disabled = true;

  const jobId = 'job_' + Date.now();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json'
  };

  try {
    const dispatchRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ref: GITHUB_BRANCH,
        inputs: {
          language: currentLang.id,
          code_base64: toBase64(code),
          stdin_base64: toBase64(stdin),
          job_id: jobId
        }
      })
    });

    if (!dispatchRes.ok) {
      throw new Error(`Gagal memicu workflow (${dispatchRes.status}). Cek nama repo, branch, dan izin token.`);
    }

    outputBox.textContent = 'Menunggu GitHub Runner mengompilasi (sekitar 8-15 detik)...';

    let artifactUrl = null;
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const artRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/artifacts?name=result-${jobId}`, { headers });
      const artData = await artRes.json();
      if (artData.artifacts && artData.artifacts.length > 0) {
        artifactUrl = artData.artifacts[0].archive_download_url;
        break;
      }
    }

    if (!artifactUrl) throw new Error('Waktu tunggu habis. Periksa tab Actions di repositori GitHub kamu.');

    const zipRes = await fetch(artifactUrl, { headers });
    const zipBlob = await zipRes.blob();
    const zip = await JSZip.loadAsync(zipBlob);
    const resultText = await zip.file(`${jobId}.txt`).async('string');

    const lines = resultText.split('\n');
    const exitCode = lines[0].replace('EXIT_CODE:', '').trim();
    const programOutput = lines.slice(1).join('\n');

    outputBox.style.color = exitCode === '0' ? '#9ece6a' : '#f7768e';
    outputBox.textContent = programOutput || '(Program selesai tanpa output)';

  } catch (err) {
    outputBox.style.color = '#f7768e';
    outputBox.textContent = 'Error: ' + err.message;
  } finally {
    runBtn.disabled = false;
  }
}

function downloadCode() {
  const blob = new Blob([getCodeValue()], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = currentLang.file;
  a.click();
  URL.revokeObjectURL(url);
}

function clearOutput() {
  document.getElementById('htmlPreview').style.display = 'none';
  const outputBox = document.getElementById('outputBox');
  outputBox.style.display = 'block';
  outputBox.style.color = '#e2e8f0';
  outputBox.textContent = '';
}
