// util para silenciar logs não críticos no console do navegador
// mantém console.error habilitado para captura de erros

let restored = false;
let original = null;

export function silenceNonErrorLogs() {
  if (restored || original) return; // já aplicado
  original = {
    log: console.log,
    info: console.info,
    debug: console.debug,
    warn: console.warn,
    error: console.error
  };
  // no-op para log/info/debug/warn
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.warn = () => {};
}

export function restoreConsole() {
  if (!original || restored) return;
  console.log = original.log;
  console.info = original.info;
  console.debug = original.debug;
  console.warn = original.warn;
  console.error = original.error;
  restored = true;
}

export function isSilenced() {
  return !!original && !restored;
}


