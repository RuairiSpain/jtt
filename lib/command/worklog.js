const jira = require("./../jira");
const conf = require("./../conf");
const moment = require("moment");
require("moment-duration-format");

const command = (yargs) => {
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
      (argv) => {
        conf
          .getAuth()
          .then((auth) => {
            const workTimeSec = parseInt(
              moment.duration(argv.time, "minutes").asSeconds(),
              10
            );
            const date = new Date().setSeconds(-workTimeSec);
            return {
              timeSpentSeconds: workTimeSec,
              started: moment().format("YYYY-MM-DDThh:mm:ss.SSS+0000"),
              comment: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        text: argv.comment + "",
                        type: "text",
                      },
                    ],
                  },
                ],
              },
            };
          })
          .then((worklog) => {
            return jira.saveWorklog(worklog, argv.issue);
          })
          .then((res) => {
            console.log(
              `Added ${
                res.body.timeSpent
              } to https://ancientgaming.atlassian.net/secure/RapidBoard.jspa?rapidView=3&projectKey=${
                argv.issue.split("-")[0]
              }&modal=detail&selectedIssue=${argv.issue}&search=${argv.issue}`
            );
          })
          .catch((e) => {
            console.error(e.toString());
            process.exit(1);
          });
      }
    );
};

module.exports = command;
