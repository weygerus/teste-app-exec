const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
var { exec } = require('child_process');

let win;

async function verifyPm2Process() {
    
     exec('pm2 list > C:\\dev\\teste-app-exec\\src\\frontend\\pm2Logs\\process-verificationDEV.txt', { encoding: 'utf8' }, (err, stdout, stderr) => {
        if (err) {
            console.error('Erro ao executar o comando:', err);
            return "ERRO NO PROCESSO";
        }
    });

            let message = ""
                const logPath = "C:\\dev\\teste-app-exec\\src\\frontend\\pm2Logs\\process-verificationDEV.txt";
                const processName = "gerenc-insta-local-API-DEV";
        
                fs.readFile(logPath, async (err, data) => {
                    if (err) {
                        console.error('Erro ao ler o arquivo:', err);
                        return "ERRO";
                    }
        
                    if (data.includes(processName)) {
        
                        message = "Processo ativo!"
                        return true;

                    } else {

                        console.log(`Processo não encontrado!`);
                        console.log("Criando proesso...")        

                        exec('cd C:\\dev\\teste-app-exec\\src\\backend && nodemon server.js', { encoding: 'utf8' }, (err, stdout, stderr) => {
                            if (err) {
                                console.error('Erro ao criar o processo: ', err);
                                return `Erro ao criar o processo: ${err}`;
                            }
                            console.log("Proesso criado com sucesso!")
                            return "Proesso criado com sucesso!";
                        });
                    }   
                });

}

app.whenReady().then(async () => {

    
    //await verifyPm2Process();

    win = new BrowserWindow({
        width: 500,
        height: 550,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true
        },
        icon: path.join(__dirname, 'assets/icon.png')
    });

    win.loadFile(path.join(__dirname, 'frontend/views/login.html'));
});