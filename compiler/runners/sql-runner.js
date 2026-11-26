// /compiler/runners/sql-runner.js

const SQLJS_BASE_URL = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3";
let sqlJsPromise = null;

async function loadSqlJsScriptIfNeeded() {
  if (typeof window.initSqlJs === "function") {
    return;
  }

  await new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-sqljs-loader="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Gagal memuat script sql.js.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `${SQLJS_BASE_URL}/sql-wasm.js`;
    script.async = true;
    script.dataset.sqljsLoader = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal mengunduh sql.js dari CDN."));
    document.head.appendChild(script);
  });
}

async function getSqlJsRuntime() {
  if (!sqlJsPromise) {
    sqlJsPromise = (async () => {
      await loadSqlJsScriptIfNeeded();
      if (typeof window.initSqlJs !== "function") {
        throw new Error("Fungsi initSqlJs tidak tersedia.");
      }
      return await window.initSqlJs({
        locateFile: (file) => `${SQLJS_BASE_URL}/${file}`
      });
    })();
  }
  return sqlJsPromise;
}

export async function run(code, stdin = "") {
  if (!code || !code.trim()) {
    return "(Query SQL kosong)";
  }

  const SQL = await getSqlJsRuntime();
  const db = new SQL.Database();

  try {
    const results = db.exec(code);
    if (!results || results.length === 0) {
      return "(Query selesai tanpa baris hasil)";
    }
    return JSON.stringify(results, null, 2);
  } finally {
    db.close();
  }
}
