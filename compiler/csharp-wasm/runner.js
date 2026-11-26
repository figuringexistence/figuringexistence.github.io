// /compiler/csharp-wasm/runner.js

let wasmRuntimePromise = null;

/**
 * Muat runtime / compiler .NET WebAssembly sekali saja lalu simpan promise-nya.
 * Sesuaikan bagian ini dengan file hasil publish .NET WASM / compiler C# WASM
 * yang kamu taruh di folder /compiler/csharp-wasm/.
 */
async function initCSharpWasmRuntime() {
  if (!wasmRuntimePromise) {
    wasmRuntimePromise = (async () => {
      // Contoh jika kamu memiliki modul JS/WASM di folder /compiler/csharp-wasm/:
      // const mod = await import("/compiler/csharp-wasm/dotnet.js");
      // return await mod.createDotnetRuntime(...);
      return null;
    })();
  }
  return wasmRuntimePromise;
}

/**
 * Fungsi utama yang dipanggil oleh halaman compiler di /compiler/
 * @param {string} code - Kode sumber C# (Program.cs)
 * @param {string} stdin - Input opsional untuk program
 * @returns {Promise<string>} - Output hasil eksekusi
 */
export async function compileAndRunCSharp(code, stdin = "") {
  if (!code || !code.trim()) {
    return "(Kode C# kosong)";
  }

  const runtime = await initCSharpWasmRuntime();

  if (!runtime) {
    throw new Error(
      "Runtime / compiler .NET WASM belum terpasang di /compiler/csharp-wasm/. " +
      "Letakkan aset .NET WASM milikmu di folder tersebut lalu hubungkan di initCSharpWasmRuntime()."
    );
  }

  // Di sini kamu meneruskan `code` dan `stdin` ke compiler/runtime WASM milikmu
  // lalu mengembalikan hasil stdout/stderr sebagai string.
  throw new Error("Bagian eksekusi runtime WASM di runner.js belum dihubungkan ke API runtime kamu.");
}
