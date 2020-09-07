const jira = require("./../jira");

const commands = (yargs) => {
  return yargs
    .command(
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
    )
    .command(
      "users",
      "Lists all Jira users",
      (yargs) => {},
      async () => {
        console.dir(await jira.users());
      }
    )
    .command(
      "columns [issue]",
      "list the project columns",
      (yargs) => {
        yargs.positional("issue", {
          describe: "Issue key",
          type: "string",
        });
      },
      async (argv) => {
        console.dir(
          await (
            await jira.getColumns(argv.issue)
          ).body.transitions.map((t) => ({ id: t.id, name: t.name }))
        );
      }
    )
    .command(
      "m <issue> <column>",
      "Move a issue to a different columns",
      (yargs) => {
        yargs
          .positional("issue", {
            describe: "Issue key",
            type: "string",
          })
          .positional("column", {
            describe: "column key",
            type: "string",
          });
      },
      async (argv) => {
        console.dir(await jira.moveTicket(argv.issue, argv.column));
      }
    )
    .command(
      "a <issue> <user>",
      "Assign a issue to a user",
      (yargs) => {
        yargs
          .positional("issue", {
            describe: "Issue key",
            type: "string",
          })
          .positional("user", {
            describe: "user key",
            type: "string",
          });
      },
      async (argv) => {
        console.dir(await jira.assignTicket(argv.issue, argv.user));
      }
    );
};

module.exports = commands;
