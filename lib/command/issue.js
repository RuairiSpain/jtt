const jira = require("./../jira");

const commands = (yargs) => {
  return yargs.command(
    "i <project>",
    "List open issues assigned to you.",
    (yargs) => {
      yargs
        .positional("project", {
          describe: "Project key",
          type: "string",
        })
        .option("others", {
          describe: "Set to show issues assigned to other people.",
          alias: "o",
          type: "boolean",
        })
        .demandOption(["project"]);
    },
    (argv) => {
      jira
        .loadIssues(argv.project, !argv.others)
        .then((issues) => {
          console.log(
            issues.issues.reduce((str, issue) => {
              return str + `${issue.key}\t${issue.fields.summary}\n\r`;
            }, `${issues.total} issue(s)\n\r`)
          );
        })
        .catch((e) => {
          console.error(e.toString());
          process.exit(1);
        });
    }
  );
};

module.exports = commands;
