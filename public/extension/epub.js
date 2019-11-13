const { ipcMain } = require("electron");
const fs = require("fs");
const rmdir = require("rmdir");

let references = {};

ipcMain.on("add reference", (event, bookname) => {
  references[bookname] = references[bookname] ? references[bookname] + 1 : 1;
});

ipcMain.on("store asset", (event, bookname, href, buffer) => {
  const filename = href.split("/").pop();
  if (!fs.existsSync(`./public/${bookname}`)) {
    fs.mkdirSync(`./public/${bookname}`);
  }
  fs.promises.writeFile(`./public/${bookname}/${filename}`, buffer);
});

ipcMain.on("remove reference", (event, bookname) => {
  references[bookname]--;
  if (references[bookname]) {
    return;
  }

  rmdir(`./public/${bookname}`, err => {
    if (err) {
      console.error(`failed to delete /public/${bookname}`);
      console.error(err);
    }
  });
});
