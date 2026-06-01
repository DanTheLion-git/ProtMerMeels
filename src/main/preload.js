'use strict';

const { contextBridge } = require('electron');

// Minimal bridge: exposes the app version to the renderer.
contextBridge.exposeInMainWorld('kiosk', {
  version: process.env.npm_package_version || '0.1.0'
});
