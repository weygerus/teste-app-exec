const { app, ipcMain, BrowserWindow } = require('electron')
const fetch = require('node-fetch'); 
const path = require('path')
const pm2 = require('pm2')

const { startLocalAPI } = require('./api');



  function loadHomepage() {
  
    const mainWin = new BrowserWindow({
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
      },
      icon: path.join(__dirname, 'assets/icon.png'),
    });
  
    mainWin.loadFile(path.join(__dirname, 'frontend/views/main.html'));
  }

app.whenReady().then(async () => {
  try {

    await startLocalAPI();

    const win = new BrowserWindow({
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

    ipcMain.on('login', async (event, { username, password }) => {

      try {

        const response = await fetch('http://localhost:7890/api/auth/login', {
          method: "POST",
          headers: {

            "Content-Type": "application/json"
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        console.log(data);

        event.reply('login-response', {
          message: data.success ? 'Login bem-sucedido!' : 'Falha no login!',
        });

        await loadHomepage();
      }
      catch (error) {

        console.error('Erro ao realizar login:', error);
        event.reply('login-response', { message: 'Erro interno no servidor.' });
      }
    });


    win.loadFile(path.join(__dirname, 'views/login.html'));

  } catch (error) {
    console.error('Erro na inicialização:', error)
    app.quit()
  }
});