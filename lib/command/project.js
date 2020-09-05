const jira = require("./../jira");

const commands = (yargs) => {
  return yargs.command(
    "p",
    "List available projects",
    (yargs) => {},
    () => {
      return jira
        .loadProjects()
        .then((projects) => {
          console.log(
            projects.reduce((str, project) => {
              return str + `${project.key}\t\t${project.name}\n\r`;
            }, "")
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
