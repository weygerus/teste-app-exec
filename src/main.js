const { app, ipcMain, BrowserWindow } = require('electron')
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

let sessionUserId = "";



let window;
const { startLocalAPI } = require('./api');

function loadHomepage() {

  window.loadFile(path.join(__dirname, 'views/main.html'));
}


app.whenReady().then(async () => {
  try {

    await startLocalAPI();

    window = new BrowserWindow({
      width: 500,
      height: 550,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true, // Usar o preload.js
        preload: path.join(__dirname, 'preload.js')

      },
      icon: path.join(__dirname, 'assets/icon.png')
    });

    window.loadFile(path.join(__dirname, 'views/login.html'));
    
    window.on('close', (e) => {
      
      e.preventDefault();

      window.webContents.send('render-card', {
        mensagem: 'RenderizeCard'
      });

    });
    
    
    ipcMain.once('execute-logout', () => {
      window.loadFile(path.join(__dirname, 'views/logout.html'));
    });
  

    ipcMain.once('logout-completo', () => {
      window.destroy();
    });
  } 
  catch (error) {

    console.error('Erro na inicialização:', error)
    app.quit()
  }
});