// /compiler/runners/java-runner/runner.js

export const RUNNER_VERSION = "v1.1";

// Isi dengan URL endpoint eksekusi Java milikmu jika sudah tersedia, misal:
// const JAVA_EXEC_ENDPOINT = "https://your-runner-endpoint.example.com/run/java";
const JAVA_EXEC_ENDPOINT = "";

export async function run(code, stdin = "") {
  if (!code || !code.trim()) {
    return "(Kode Java kosong)";
  }

  if (!JAVA_EXEC_ENDPOINT) {
    throw new Error(
      "Java belum memiliki compiler/runtime di browser statis GitHub. " +
      "Atur JAVA_EXEC_ENDPOINT di /compiler/runners/java-runner/runner.js untuk menghubungkannya ke runner eksternal."
    );
  }

  const response = await fetch(JAVA_EXEC_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  return data.output || data.stdout || "(Program selesai tanpa output)";
}
