'use strict';

const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');

// Kiosk mode is on automatically in a packaged build, or when --kiosk is passed.
// Dev (`npm start`) runs windowed so it's easy to work with.
const KIOSK = app.isPackaged || process.argv.includes('--kiosk');

let mainWindow = null;

// Only allow a single running copy — important on a museum kiosk that may be
// (re)launched by a watchdog or startup shortcut.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  app.whenReady().then(createWindow);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#1d2440',
    autoHideMenuBar: true,
    fullscreen: KIOSK,
    kiosk: KIOSK,
    frame: !KIOSK,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (!KIOSK) {
    mainWindow.maximize();
  }

  mainWindow.removeMenu();
  const indexPath = path.join(__dirname, '..', 'renderer', 'index.html');
  const startHash = process.env.PMM_HASH || '';
  mainWindow.loadFile(indexPath, startHash ? { hash: startHash } : undefined);

  const wc = mainWindow.webContents;


  // Forward renderer console + load failures to stdout so a kiosk leaves a log trail
  // (and so problems are visible when launched from a terminal).
  wc.on('console-message', (_e, level, message, line, source) => {
    if (level >= 2) console.error(`[renderer] ${message} (${source}:${line})`);
  });
  wc.on('did-fail-load', (_e, code, desc) => {
    console.error(`[renderer] did-fail-load ${code} ${desc}`);
  });

  // Auto-recover if the renderer ever crashes — the table should never sit dead.
  wc.on('render-process-gone', (_e, details) => {
    console.error('[renderer] gone:', details.reason);
    if (mainWindow) mainWindow.reload();
  });

  // Dev/QA utilities, gated by env vars (never set in production):
  //   PMM_DEV_SCORES=1  → seed a demo leaderboard so the high-score UI can be shown
  //   PMM_DEV_CLEAR=1   → wipe all stored leaderboards
  if (process.env.PMM_DEV_SCORES) {
    wc.once('did-finish-load', () => {
      wc.executeJavaScript(
        "if(!sessionStorage.getItem('pmmSeeded')){sessionStorage.setItem('pmmSeeded','1');" +
        "localStorage.setItem('pmm.scores.mouillering', JSON.stringify([" +
        "{name:'JAN',score:960},{name:'MIE',score:910},{name:'PIET',score:850}," +
        "{name:'ANS',score:780},{name:'WIM',score:720}]));location.reload();}"
      );
    });
  }
  if (process.env.PMM_DEV_CLEAR) {
    wc.once('did-finish-load', () => wc.executeJavaScript('localStorage.clear();location.reload();'));
  }

  // Hidden staff exit: the renderer detects the long-press-corner gesture and
  // asks us to quit. Esc also quits, but only outside of kiosk to avoid visitors
  // closing it; in kiosk the corner gesture is the supported way out.
  ipcMain.on('app:quit', () => app.quit());

  // F11 toggles fullscreen for convenience during development.
  if (!KIOSK) {
    globalShortcut.register('F11', () => {
      if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
    });
  }
}

app.on('window-all-closed', () => {
  app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
