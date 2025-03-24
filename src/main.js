const { app, BrowserWindow } = require('electron');
const path = require('path');
var { exec } = require('child_process');
let win;

app.whenReady().then(() => {

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