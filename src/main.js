const { app, BrowserWindow } = require('electron')
const path = require('path')
const pm2 = require('pm2')


// Função para iniciar API local com PM2
function startLocalAPI() {

  return new Promise((resolve, reject) => {

    pm2.connect((err) => {
      if (err) {
        console.error('Erro ao conectar PM2:', err)
        return reject(err)
      }

      const serverPath = path.join(process.resourcesPath, 'backend', 'server.js')

      pm2.start({
        script: 'C:\\dev\\teste-app-exec\\src\\backend\\server.js',
        name: 'local-instagram-api',
        watch: false,
        env: {
          NODE_ENV: 'production'
        }
      }, (err) => {
        if (err) {
          console.error('Erro ao iniciar API:', err)
          pm2.disconnect()
          return reject(err)
        }

        console.log('API local iniciada')
        resolve();
      })
    })
  })
}

app.whenReady().then(async () => {
  try {
    // Inicia a API local antes de criar a janela
    await startLocalAPI()

    // Cria a janela após iniciar a API
    const win = new BrowserWindow({
      width: 500,
      height: 550,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true
      },
      icon: path.join(__dirname, 'assets/icon.png')
    });

    win.loadFile(path.join(__dirname, 'frontend/views/login.html'));

  } catch (error) {
    console.error('Erro na inicialização:', error)
    app.quit()
  }
})

// Garantir encerramento da API ao fechar o app
app.on('will-quit', async (event) => {

  event.preventDefault()
  
      const processPath = path.join(__dirname, 'backend/server.js');
  
      pm2.delete('local-instagram-api', async (err) => {
  
        if (err) {
          console.error('Erro ao encerrar API:', err)
        }
        pm2.disconnect()
        app.quit()
      })
      
})