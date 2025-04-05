const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(...args))
});

//"C:\Program Files\7-Zip\7z.exe" a C:\Users\gabri\Downloads C:\dev\teste-app-exec\instaExecApp-win32-x64
// "C:\Program Files\7-Zip\7z.exe" x instaExecApp.zip -oC:\C:\Users\gabri\Downloads

//"C:\Program Files\7-Zip\7z.exe"  
