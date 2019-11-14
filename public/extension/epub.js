const { ipcMain } = require("electron");
const fs = require("fs");
const rmdir = require("rmdir");

let references = {};

// todo:
// there are bug currently, react render component faster than writing files to local
// fix it next push

ipcMain.on("add reference", (event, bookname) => {
  references[bookname] = references[bookname] ? references[bookname] + 1 : 1;
});

ipcMain.on("store asset", (event, bookname, href, buffer) => {
  const filename = href.split("/").pop();
  if (!fs.existsSync(`./public/assets/${bookname}`)) {
    fs.mkdirSync(`./public/assets/${bookname}`);
  }
  fs.promises.writeFile(`./public/assets/${bookname}/${filename}`, buffer);
});

ipcMain.on("remove reference", (event, bookname) => {
  references[bookname]--;
  if (references[bookname]) {
    return;
  }

  rmdir(`./public/assets/${bookname}`, err => {
    if (err) {
      console.error(`failed to delete /public/assets/${bookname}`);
      console.error(err);
    }
  });
});
