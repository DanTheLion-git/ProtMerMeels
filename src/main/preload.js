'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Minimal, safe bridge. The renderer can ask the main process to quit
// (used by the hidden staff exit gesture) and read the app version.
contextBridge.exposeInMainWorld('kiosk', {
  quit: () => ipcRenderer.send('app:quit'),
  version: process.env.npm_package_version || '0.1.0'
});
