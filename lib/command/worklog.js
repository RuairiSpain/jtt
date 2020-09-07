const jira = require("./../jira");
const conf = require("./../conf");
const moment = require("moment");
const { isNumber } = require("util");
require("moment-duration-format");

const commands = async (yargs) => {
  yargs
    .command(
      "ls <issue>",
      "List work logs saved in jira",
      (yargs) => {
        yargs
          .positional("issue", {
            describe: "Issue key",
            type: "string",
          })
          .option("days", {
            alias: "d",
            default: 7,
            describe: "Days in the past",
          });
      },
      (argv) => {
        jira
          .loadWorklogs(argv.days, argv.issue)
          .then((logs) => {
            console.log(
              logs.reduce((str, log) => {
                return (
                  str +
                  `${log.issue.key}\t${moment
                    .duration(log.timeSpentSeconds, "seconds")
                    .format("hh:mm", { trim: false })}\t${log.comment}\n\r`
                );
              }, `Total logs: ${logs.length}\n\r`)
            );
          })
          .catch((e) => {
            console.error(e.toString());
            process.exit(1);
          });
      }
    )
    .command(
      "log <issue> <time>",
      'Log time in jira. Examples: log FE-100 15 or log BE-99 30 "Cool things were done"',
      (yargs) => {
        yargs
          .positional("issue", {
            describe: "Issue key",
            type: "string",
          })
          .positional("time", {
            describe: "Minutes you want to log",
            default: 15,
            type: "number",
          })
          .positional("comment", {
            describe: "Description in double quotes...",
            default: "",
            type: "string",
          });
      },
      async (argv) => {
        if (!argv.issue || isNumber(parseInt(argv.issue))) {
          if (isNumber(parseInt(argv.issue))) {
            argv.time = parseInt(argv.issue);
          }
          argv.issue = await jira.getBranch();
        }
        await jira.assigned(argv.issue);
        conf
          .getAuth()
          .then((auth) => {
            jira.save(argv.issue, argv.time);
          })
          .catch((e) => {
            console.error(e.toString());
            process.exit(1);
          });
      }
    )
    .command(
      "t [issue] [time]",
      "start/stop timer for an issue in jira. Examples: t FE-100. Defaults 15 minutes if not time set",
      (yargs) => {
        yargs
          .positional("issue", {
            describe: "Issue key",
            type: "string",
          })
          .positional("time", {
            describe: "Minutes you want to log",
            default: 0,
            type: "number",
          });
      },
      async (argv) => {
        if (!argv.issue || isNumber(parseInt(argv.issue))) {
          if (isNumber(parseInt(argv.issue))) {
            argv.time = parseInt(argv.issue);
          }
          argv.issue = await jira.getBranch();
        }
        await jira.assigned(argv.issue);
        conf.track(argv.issue, argv.time);
      }
    )
    .command(
      "fix <issue> [time]",
      "set a sixed time for an issue in jira. Examples: fix FE-100 15",
      (yargs) => {
        yargs
          .positional("issue", {
            describe: "Issue key",
            type: "string",
          })
          .positional("time", {
            describe: "Minutes you want to log",
            default: 0,
            type: "number",
          });
      },
      async (argv) => {
        if (!argv.issue || isNumber(parseInt(argv.issue))) {
          if (isNumber(parseInt(argv.issue))) {
            argv.time = parseInt(argv.issue);
          }
          argv.issue = await jira.getBranch();
        }
        await jira.assigned(argv.issue);
        conf.fixTrack(argv.issue, argv.time);
      }
    )
    .command("clear", "Delete all timers for jira. Examples: clear", (argv) => {
      conf.clearTracks();
    })
    .command(
      "up",
      "Upload timers to jira and clear. Examples: up",
      (yargs) => {},
      async (argv) => {
        const tracks = conf.read();
        conf.print(tracks);
        for (let [issue, track] of tracks.entries()) {
          const track = tracks.get(issue);
          if (track.running) {
            conf.track(issue);
          }
          await jira.save(
            issue,
            track.minutes,
            track.commenced,
            "JTT time tracker"
          );
        }
        await conf.clearTracks();
        console.log("\nDone.");
      }
    );
};

module.exports = commands;
