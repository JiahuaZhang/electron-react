const { ipcMain } = require('electron');
const fs = require('fs');
const rmdir = require('rmdir');

let references = {};

ipcMain.on('add reference', (event, bookname) => {
  if (!(bookname in references)) {
    references[bookname] = { count: 1, files: [], events: {} };
    return;
  }

  references[bookname].count++;
});

ipcMain.on('store asset', async (event, bookname, filename, buffer) => {
  if (!fs.existsSync(`./public/assets/${bookname}`)) {
    fs.mkdirSync(`./public/assets/${bookname}`, { recursive: true });
  }

  await fs.promises.writeFile(`./public/assets/${bookname}/${filename}`, buffer);

  references[bookname].files.push(filename);
  if (references[bookname].events[filename] && references[bookname].events[filename].length) {
    references[bookname].events[filename].forEach(event =>
      event.reply(`${bookname}/${filename} loaded`, 'async')
    );
    references[bookname].events[filename] = [];
  }
});

ipcMain.on('remove reference', (event, bookname) => {
  references[bookname].count--;
  if (references[bookname].count) {
    return;
  }

  rmdir(`./public/assets/${bookname}`, err => {
    if (err) {
      console.error(`failed to delete ./public/assets/${bookname}`);
      console.error(err);
    }
  });

  references[bookname] = { count: 0, files: [], events: {} };
});

ipcMain.on('resource loaded?', (event, bookname, filename) => {
  if (references[bookname] && references[bookname].files.includes(filename)) {
    event.reply(`${bookname}/${filename} loaded`, 'sync');
  } else {
    if (references[bookname].events[filename]) {
      references[bookname].events[filename].push(event);
    } else {
      references[bookname].events[filename] = [event];
    }
  }
});

ipcMain.on('load epub config', event => {
  fs.promises
    .readFile('./public/data/epub.config.json')
    .then(config => {
      event.reply('load epub config', config);
    })
    .catch(reason => {
      event.reply('load epub config', null);
      console.error('fail to load epub config', reason);
    });
});
