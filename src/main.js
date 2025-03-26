const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
var { exec } = require('child_process');

let win;

async function verifyPm2Process() {
    
    await exec('pm2 list > C:\\dev\\teste-app-exec\\src\\frontend\\pm2Logs\\process-verification.txt', { encoding: 'utf8' }, (err, stdout, stderr) => {
        if (err) {
            console.error('Erro ao executar o comando:', err);
            return "ERRO NO PROCESSO";
        }
    });


    setTimeout(() => {

        const logPath = "C:\\dev\\teste-app-exec\\src\\frontend\\pm2Logs\\process-verification.txt";
        const processName = "gerenc-insta-local-API";

        fs.readFile(logPath, async (err, data) => {
            if (err) {
                console.error('Erro ao ler o arquivo:', err);
                return "ERRO";
            }

            if (data.includes(processName)) {

                const message = "Processo ativo!"
                console.log(message);
                return message;
            } else {

                console.log(`Criar processo!`);
                const createProcessResponse = await createPm2Process();
                return createProcessResponse;
            }
        });
    }, 3000);
}

async function createPm2Process() {

    console.log("Criando proesso...")
    exec('cd C:\\dev\\teste-app-exec\\src\\backend && pm2 start server.js --name gerenc-insta-local-API && pm2 save', { encoding: 'utf8' }, (err, stdout, stderr) => {
        if (err) {
            console.error('Erro ao criar o processo: ', err);
            return `Erro ao criar o processo: ${err}`;
        }
    });
    console.log("Proesso criado com sucesso!")
    return "Proesso criado com sucesso!";
}

app.whenReady().then(async () => {


    await verifyPm2Process();

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