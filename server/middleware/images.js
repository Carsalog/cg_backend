const sharp = require("sharp");
const config = require("config");
const {getPath, getName, getUniqueString, getDbPath} = require("../lib/tools");


module.exports = (req, res, next) => {

  function exec(file) {
    return new Promise((resolve) => {

      const fileName = getUniqueString();
      const imageName = getName(fileName, file.originalname);
      const imgDbName = `${getDbPath(fileName)}/${imageName}`;

      getPath(fileName)
        .then(url => {
          const fullPath = `${url}/${imageName}`;
          sharp(file.buffer)
            .resize(config.get("images.size.width"), config.get("images.size.height"))
            .toFile(fullPath, (err, info) => {
              if (!err && info) return resolve(imgDbName);
              else return resolve(null);
            });
          return url;
      })
        .catch(e => console.log(e));
    });
  }

  Promise.all(req.files.map(file => {
    return exec(file);
  }))
    .then((promises) => {
      req.images = promises;
      next();
    })
    .catch(err => {
      console.log(err);
      next();
    });

};