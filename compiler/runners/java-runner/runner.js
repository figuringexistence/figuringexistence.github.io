// /compiler/runners/java-runner/runner.js

export const RUNNER_VERSION = "v1.2";

// Masukkan URL endpoint eksekusi Java milikmu jika sudah tersedia, contoh:
// const JAVA_RUNNER_ENDPOINT = "https://runner-kamu.example.com/run/java";
const JAVA_RUNNER_ENDPOINT = "";

export async function run(code, stdin = "") {
  if (!code || !code.trim()) {
    return "(Kode Java kosong)";
  }

  if (!JAVA_RUNNER_ENDPOINT) {
    throw new Error(
      "Java belum memiliki compiler/runtime di mode statis GitHub. " +
      "Isi JAVA_RUNNER_ENDPOINT di /compiler/runners/java-runner/runner.js jika sudah ada layanan runner eksternalnya."
    );
  }

  const response = await fetch(JAVA_RUNNER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      language: "java",
      fileName: "Main.java",
      code,
      stdin
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} saat menjalankan kode Java.`);
  }

  const data = await response.json();
  const out = data.output ?? data.stdout ?? data.result ?? "";
  return String(out).trimEnd() || "(Program selesai tanpa output)";
}
