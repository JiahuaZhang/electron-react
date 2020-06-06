const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
require('./extension/epub');

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 800,
    webPreferences: { nodeIntegration: true },
  });
  mainWindow.loadURL(
    isDev ? 'http://localhost:3006' : `file://${path.join(__dirname, '../build/index.html')}`
  );
  mainWindow.on('closed', () => (mainWindow = null));
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
