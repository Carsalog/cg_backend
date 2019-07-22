const config = require("config");
const fs = require('fs');
const path = require("path");
const mongoose = require("mongoose");
const md5 = require("md5");


const isImage = function (img) {
  const MN = {
    jpg: 'ffd8ffe0',
    jpg1: 'ffd8ffe1',
    png: '89504e47',
    gif: '47494638'
  };

  return !(img !== MN.jpg || img !== MN.jpg1 || img !== MN.png || img !== MN.gif);
};


function createPath(path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, function (err) {
      if (err) {
        if (err.code === 'EEXIST') resolve(path); // ignore the error if the folder already exists
        else reject(err); // something else went wrong
      } else resolve(path); // successfully created folder
    });
  });
}

function getPath(imageName) {
  return new Promise((resolve, reject) => {

    const fOne = imageName.substring(0, 2);
    const fTwo = imageName.substring(2, 4);

    createPath(`${config.get("static")}/${config.get("images.multer.dest")}/${fOne}`)
      .then(
        p => createPath(`${p}/${fTwo}`)
          .then(newPath => resolve(newPath))
          .catch(err => reject(err)))
      .catch((err) => reject(err));
  });
}

function getDbPath(imageName) {

  const fOne = imageName.substring(0, 2);
  const fTwo = imageName.substring(2, 4);

  return `/${config.get("images.multer.dest")}/${fOne}/${fTwo}`;
}

function getUniqueString() {
  return md5(String(mongoose.Types.ObjectId()));
}

function getName(imageName, originalName) {
  return imageName.substring(4) + path.extname(originalName)
}

function unionImages(images, author, post) {
  /**
   * Generates array of objects and filter it.
   * @return Array:
   */
  return images.map(url => url ? ({url, author, post}) : null).filter(obj => obj);
}

function removeImages(urls) {
  urls.forEach(url => {
    const imgPath = `./${config.get("static")}${url}`;
    fs.unlink(imgPath, (err) => {
      if (err) throw err;
      else console.log(`Successfully removed image: ${url}`);
    });
  });
}

exports.isFloat = n => Number(n) === n && n % 1 !== 0;
exports.isInt = nmb => Number.isInteger(Number(nmb));
exports.getCurrentYear = () => Number((new Date()).getFullYear()) + 1;
exports.getPath = getPath;
exports.createPath = createPath;
exports.isImage = isImage;
exports.getName = getName;
exports.getUniqueString = getUniqueString;
exports.getDbPath = getDbPath;
exports.unionImages = unionImages;
exports.removeImages = removeImages;