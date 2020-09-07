const os = require("os");
const path = require("path");
const fs = require("fs-extra");

const confPath = path.join(os.homedir(), ".jtt");
const authFilePath = path.join(confPath, "auth.json");
const logsFilePath = path.join(confPath, "logs.json");

if (!fs.existsSync(confPath)) {
  fs.mkdirSync(confPath);
}

if (!fs.existsSync(logsFilePath)) {
  fs.writeFileSync(logsFilePath, JSON.stringify([]));
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
  clearTracks: async () => {
    fs.writeFileSync(logsFilePath, JSON.stringify([]));
  },
  fixTrack: async (issue, minutes) => {
    const tracks = conf.read();
    tracks.set(issue, {
      minutes: minutes,
      commenced: new Date().getTime(),
      started: null,
      running: false,
    });
    fs.writeFileSync(
      logsFilePath,
      JSON.stringify(Array.from(tracks.entries()), null, 4)
    );
    conf.save(tracks);
    conf.print(tracks);
  },
  track: async (issue, minutes) => {
    const tracks = conf.read();
    if (tracks.has(issue) && tracks.get(issue).running) {
      const track = tracks.get(issue);
      track.minutes += Math.ceil(
        minutes + (new Date().getTime() - track.started) / (1000 * 60)
      );
      track.started = null;
      track.running = false;
      tracks.set(issue, track);
    } else if (tracks.has(issue) && !tracks.get(issue).running) {
      conf.stopAll(tracks);

      const track = tracks.get(issue);
      track.minutes += minutes;
      track.started = new Date().getTime();
      track.running = true;
      tracks.set(issue, track);
    } else {
      conf.stopAll(tracks);
      tracks.set(issue, {
        minutes: minutes || 15,
        commenced: new Date().getTime(),
        started: new Date().getTime(),
        running: true,
      });
    }
    conf.save(tracks);
    conf.print(tracks);
  },
  status: () => {
    const tracks = conf.read();
    conf.print(tracks);
  },
  read: () => {
    return new Map(require(logsFilePath));
  },
  print: (tracks) => {
    console.log(`Trackers (${tracks.size})`);
    tracks.forEach(function (t, issue) {
      console.log(
        `\t ${issue}\t ${Math.ceil(t.minutes)} minutes \t${
          t.running ? "ON" : "OFF"
        }`
      );
    });
    console.log(`${tracks.size > 0 ? '\nReminder to save: "jtt up"' : ""}`);
  },
  save: (tracks) => {
    fs.writeFileSync(
      logsFilePath,
      JSON.stringify(Array.from(tracks.entries()), null, 4)
    );
  },
  stopAll: (tracks) => {
    for (let [key, track] of tracks.entries()) {
      if (track.running) {
        track.minutes += Math.ceil(
          (new Date().getTime() - track.started) / (1000 * 60)
        );
        track.running = false;
        track.started = null;
        tracks.set(key, track);
      }
    }
  },
  upload: async () => {},
};
