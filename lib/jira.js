const got = require("got");
const conf = require("./conf");
const moment = require("moment");

module.exports = jira = {
  projects: new Map(),
  loadProjects: async () => {
    return conf.getAuth().then((auth) => {
      return got(`https://${auth.domain}.atlassian.net/rest/api/2/project`, {
        auth: `${auth.email}:${auth.token}`,
        json: true,
      }).then((response) => {
        return response.body;
      });
    });
  },
  load: async (tickets) => {
    const data = await conf.getAuth().then((auth) => {
      let assigneeJql = " AND assignee = currentUser()";
      const jql = `resolution = Unresolved${assigneeJql} ORDER BY updated DESC`;
      return got(
        `https://${auth.domain}.atlassian.net/rest/api/2/search?jql=${jql}&fields=key,summary`,
        {
          auth: `${auth.email}:${auth.token}`,
          json: true,
        }
      ).then((response) => {
        return response.body;
      });
    });
    data.issues.forEach((issue) => {
      tickets.set(issue.key, issue);
    });
    return tickets;
  },
  assigned: async (issue) => {
    const tickets = await jira.load(new Map());
    if (!tickets.has(issue)) {
      console.log("You are not assigned to this ticket");
      process.exit(1);
    }
  },
  loadIssues: async (projectKey, assignedToSelf = true) => {
    return conf.getAuth().then((auth) => {
      let assigneeJql = "";
      if (assignedToSelf) {
        assigneeJql = " AND assignee = currentUser()";
      }
      const jql = `project = ${projectKey} AND resolution = Unresolved${assigneeJql} ORDER BY updated DESC`;

      return got(
        `https://${auth.domain}.atlassian.net/rest/api/2/search?jql=${jql}&fields=key,summary`,
        {
          auth: `${auth.email}:${auth.token}`,
          json: true,
        }
      ).then((response) => {
        return response.body;
      });
    });
  },
  loadWorklogs: async (days = 7, issueId) => {
    const auth = await conf.getAuth();
    const res = await got(
      `https://${auth.domain}.atlassian.net/rest/api/3/issue/${issueId}/worklog`,
      {
        auth: `${auth.email}:${auth.token}`,
        json: true,
        query: {
          startedAfter: moment().subtract(days, "days").toISOString(),
        },
      }
    );
    return res.body;
  },
  saveWorklog: async (worklog, issueId) => {
    const auth = await conf.getAuth();
    return got.post(
      `https://${auth.domain}.atlassian.net/rest/api/3/issue/${issueId}/worklog?notifyUsers=false`,
      {
        auth: `${auth.email}:${auth.token}`,
        json: true,
        body: worklog,
      }
    );
  },
  save: async (issue, minutes, startDate, comment = "") => {
    const workTimeSec = parseInt(
      moment.duration(minutes, "minutes").asSeconds(),
      10
    );
    const date = startDate ? startDate : new Date().setSeconds(-workTimeSec);
    const worklog = {
      timeSpentSeconds: workTimeSec,
      started: moment(date).format("YYYY-MM-DDThh:mm:ss.SSS+0000"),
      comment: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                text: comment,
                type: "text",
              },
            ],
          },
        ],
      },
    };

    const auth = await conf.getAuth();
    const res = await got.post(
      `https://${auth.domain}.atlassian.net/rest/api/3/issue/${issue}/worklog?notifyUsers=false`,
      {
        auth: `${auth.email}:${auth.token}`,
        json: true,
        body: worklog,
      }
    );

    console.log(
      `Added ${
        res.body.timeSpent
      } to https://ancientgaming.atlassian.net/secure/RapidBoard.jspa?rapidView=3&projectKey=${
        issue.split("-")[0]
      }&modal=detail&selectedIssue=${issue}&search=${issue}`
    );
  },
  users: async () => {
    const auth = await conf.getAuth();
    return got.get(
      `https://${auth.domain}.atlassian.net/rest/api/3/user/bulk/migration`,
      {
        auth: `${auth.email}:${auth.token}`,
        json: true,
      }
    );
  },
  assignTicket: async (issue, user) => {
    const users = await jira.users();
    const list = users.filter((u) =>
      u.username.toLowercase().startsWith(user.toLowercase())
    );
    if (list.length === 0) {
      console.log(
        `couldn't find user starting with ${user}.  User list: ${users
          .map((u) => u.username)
          .join(" ")}`
      );
      process.exit(1);
    }

    const bodyData = `{ "accountId": ${list[0].accountId} }`;
    const auth = await conf.getAuth();
    return got.post(
      `https://${auth.domain}.atlassian.net/rest/api/3/issue/${issue}/assignee`,
      {
        auth: `${auth.email}:${auth.token}`,
        json: true,
        body: bodyData,
      }
    );
  },
  moveTicket: async (issue, status) => {
    const columns = await jira.getColumns(issue);
    const found = columns.filter((c) =>
      c.name.toLowercase().startsWith(status.toLowercase())
    );

    if (found.length === 0) {
      console.log(
        `Couldn't find Jira status starting with ${status}.  Possible Status values: ${columns
          .map((c) => u.name)
          .join(" ")}`
      );
      process.exit(1);
    }
    const bodyData = `{ "value": "${found[0].id}" }`;
    const auth = await conf.getAuth();
    const data = await got.post(
      `https://your-domain.atlassian.com/rest/api/3/workflow/transitions/{transitionId}/properties?key={key}&workflowName={workflowName}`,
      {
        auth: `${auth.email}:${auth.token}`,
        json: true,
        body: bodyData,
      }
    );
  },
  getColumns: async (issue) => {
    const auth = await conf.getAuth();
    const data = awaitgot.get(
      `https://${auth.domain}.atlassian.net/rest/api/3/issue/${issue}/transitions`,
      {
        auth: `${auth.email}:${auth.token}`,
        json: true,
      }
    );
    return data.body.transitions.map((t) => ({ id: t.id, name: t.name }));
  },
  getDiff: async () => {
    const util = require("util");
    const exec = util.promisify(require("child_process").exec);
    const { stdout, stderr } = await exec("git diff --shortstat");
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    return `Number of files ${stdout
      .replace("files changed", ":")
      .replace("insertions", "")
      .replace("deletions", "")
      .replace(" ", "")
      .replace(",", "")}`;
  },
  getBranch: async () => {
    const util = require("util");
    const exec = util.promisify(require("child_process").exec);
    const { stdout, stderr } = await exec(`git rev-parse --abbrev-ref HEAD`);
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    var res = stdout.match(/(WIP-)?(\S+\-\d+)/m);
    return res[2];
  },
};
