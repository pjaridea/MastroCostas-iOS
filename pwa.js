'use strict';
(() => {
  const status = document.getElementById('app-status');
  const show = text => { status.textContent = text; status.hidden = !text; };
  let ready = false, waiting = false, failed = false;
  const update = () => {
    if (waiting) return show('Νέα έκδοση διαθέσιμη. Αποθηκεύστε την εργασία σας και κλείστε όλα τα παράθυρα της εφαρμογής πριν την ανοίξετε ξανά.');
    if (failed) return show('Δεν επιβεβαιώθηκε η εγκατάσταση offline. Ανοίξτε ξανά με internet πριν βασιστείτε σε αυτήν.');
    if (ready) return show(navigator.onLine ? 'Έτοιμη για χρήση χωρίς internet · Τα δεδομένα μένουν στη συσκευή.' : 'Χωρίς internet · Η εφαρμογή λειτουργεί τοπικά.');
    show('Προετοιμασία λειτουργίας χωρίς internet…');
  };
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol) || !window.isSecureContext) {
    show('Τοπική έκδοση browser · Για εγκατάσταση στο iPhone χρησιμοποιήστε τη διεύθυνση HTTPS.');
    return;
  }
  update();
  window.addEventListener('online', update); window.addEventListener('offline', update);
  navigator.serviceWorker.register('./sw.js', {scope:'./'}).then(reg => {
    const check = () => { waiting = Boolean(reg.waiting && navigator.serviceWorker.controller); update(); };
    reg.addEventListener('updatefound', () => { const worker = reg.installing; if (worker) worker.addEventListener('statechange', () => { if (worker.state === 'redundant' && !reg.active) { failed = true; update(); } check(); }); });
    check();
    navigator.serviceWorker.ready.then(() => { ready = true; failed = false; check(); });
    navigator.serviceWorker.addEventListener('controllerchange', () => { ready = Boolean(navigator.serviceWorker.controller); failed = false; check(); });
    setTimeout(() => { if (!ready) { failed = true; update(); } }, 20000);
  }).catch(() => { failed = true; update(); });
})();
