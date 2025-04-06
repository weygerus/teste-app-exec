const multer = require('multer');
const fs = require('fs');
const path = require('path');


console.log("MULTERMIDIA")
// Configuração de armazenamento do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'c://uploads/');  // Diretório onde os arquivos serão armazenados
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)  // Nome único para o arquivo
  }
});

const textFileFilter = (req, file, cb) => {
  const fileTypes = /txt/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado! Apenas arquivos .txt são permitidos.'));
  }
};

//"C:\Program Files\7-Zip\7z.exe" aC:\Users\gabri\Downloads\instaApp.zip C:\dev\teste-app-exec\instaExecApp-win32-x64


// Filtro para verificar o tipo do arquivo
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|mp4|mov|avi|txt|pdf|doc|docx/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado!'));
  }
};

const uploadTxt = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },  // Limite de 100MB
  textFileFilter: textFileFilter
}).single('file');

const upload = multer({

  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },  // Limite de 100MB
  fileFilter: fileFilter
}).single('media');

module.exports = {
  upload,
  uploadTxt
};
