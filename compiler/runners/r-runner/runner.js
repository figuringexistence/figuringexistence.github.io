// /compiler/runners/r-runner/runner.js

let rRuntimePromise = null;

async function initRRuntime() {
  if (!rRuntimePromise) {
    rRuntimePromise = (async () => {
      // Hubungkan ke WebR / WASM / endpoint R milikmu di sini jika sudah tersedia.
      // Contoh jika ada modul lokal di folder ini:
      // const mod = await import("./webr-loader.js");
      // return await mod.init();
      return null;
    })();
  }
  return rRuntimePromise;
}

export async function run(code, stdin = "") {
  if (!code || !code.trim()) {
    return "(Kode R kosong)";
  }

  const runtime = await initRRuntime();

  if (!runtime) {
    throw new Error(
      "Runtime R belum dihubungkan di /compiler/runners/r-runner/runner.js. " +
      "Mode situs statis GitHub belum memiliki runtime R bawaan."
    );
  }

  throw new Error("Bagian eksekusi kode R di r-runner/runner.js belum disambungkan.");
}
