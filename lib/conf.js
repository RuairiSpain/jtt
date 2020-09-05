const os = require("os");
const path = require("path");
const fs = require("fs-extra");

const confPath = path.join(os.homedir(), ".jtt");
const authFilePath = path.join(confPath, "auth.json");

if (!fs.existsSync(confPath)) {
  fs.mkdirSync(confPath);
}

let conf;
module.exports = conf = {
  getAuth: async () => {
    if (!fs.existsSync(authFilePath)) {
      return Promise.reject(
        "No authentication saved. Setup first with auth-set command."
      );
    }

    return fs.readFile(authFilePath).then((authStr) => {
      return JSON.parse(authStr);
    });
  },
  setAuth: async (domain, email, token) => {
    return fs.writeFile(
      authFilePath,
      JSON.stringify({
        domain,
        email,
        token,
      })
    );
  },
};
