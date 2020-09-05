const conf = require("../conf");

const command = (yargs) => {
  return yargs
    .command(
      "auth <domain> <email> <token>",
      "Set and save authentication",
      (yargs) => {
        yargs
          .positional("jira", {
            describe: "Jira cloud instance name",
            type: "string",
          })
          .positional("email", {
            describe: "email address",
            type: "string",
          })
          .positional("token", {
            describe: "auth token not password (this is stored as plain text)",
            type: "string",
          })
          .demandOption(["domain", "email", "token"]);
      },
      (argv) => {
        conf
          .setAuth(argv.domain, argv.email, argv.token)
          .then(() => {
            console.log("Authentication saved.");
          })
          .catch((e) => {
            console.error(e.toString);
            process.exit(1);
          });
      }
    )
    .command(
      "status",
      "Print authentication details",
      (yargs) => {},
      () => {
        conf.getAuth().then((auth) => {
          console.log(
            `Authentication details:\n\rJira: ${auth.domain}\n\rUser: ${auth.email}`
          );
        });
      }
    );
};

module.exports = command;
