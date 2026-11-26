// /compiler/runners/r-runner/runner.js

const WEBR_MODULE_URL = "https://webr.r-wasm.org/latest/webr.mjs";
let webRInstancePromise = null;

async function getWebRInstance() {
  if (!webRInstancePromise) {
    webRInstancePromise = (async () => {
      const { WebR } = await import(WEBR_MODULE_URL);
      const webR = new WebR();
      await webR.init();
      return webR;
    })();
  }
  return webRInstancePromise;
}

export async function run(code, stdin = "") {
  if (!code || !code.trim()) {
    return "(Kode R kosong)";
  }

  const webR = await getWebRInstance();
  const shelter = await new webR.Shelter();

  try {
    const capture = await shelter.captureR(code, {
      withAutoprint: true,
      captureStreams: true,
      captureConditions: true
    });

    const lines = [];
    for (const item of capture.output || []) {
      if (item && (item.type === "stdout" || item.type === "stderr") && typeof item.data === "string") {
        lines.push(item.data);
      }
    }

    const textOutput = lines.join("\n").trimEnd();
    return textOutput || "(Program selesai tanpa output)";
  } finally {
    await shelter.purge();
  }
}
