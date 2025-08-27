let counter = 0;
const listeners = new Set();
let watchdogId = null;

function notify() {
  listeners.forEach((cb) => {
    try { cb(counter); } catch (_) {}
  });
}

export function incrementLoading() {
  counter += 1;
  notify();
  // Reinicia watchdog para evitar travas eternas
  if (watchdogId) clearTimeout(watchdogId);
  watchdogId = setTimeout(() => {
    counter = 0;
    notify();
  }, 20000);
}

export function decrementLoading() {
  counter = Math.max(0, counter - 1);
  notify();
  if (counter === 0 && watchdogId) {
    clearTimeout(watchdogId);
    watchdogId = null;
  }
}

export function subscribeLoading(cb) {
  listeners.add(cb);
  cb(counter);
  return () => listeners.delete(cb);
}

export function isLoading() {
  return counter > 0;
}


