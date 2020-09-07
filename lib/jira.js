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
    return conf
      .getAuth()
      .then((auth) => {
        return got(
          `https://${auth.domain}.atlassian.net/rest/api/3/issue/${issueId}/worklog`,
          {
            auth: `${auth.email}:${auth.token}`,
            json: true,
            query: {
              startedAfter: moment().subtract(days, "days").toISOString(),
            },
          }
        );
      })
      .then((response) => {
        return response.body;
      });
  },
  saveWorklog: async (worklog, issueId) => {
    return conf.getAuth().then((auth) => {
      return got.post(
        `https://${auth.domain}.atlassian.net/rest/api/3/issue/${issueId}/worklog?notifyUsers=false`,
        {
          auth: `${auth.email}:${auth.token}`,
          json: true,
          body: worklog,
        }
      );
    });
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

    const res = await conf.getAuth().then((auth) => {
      return got.post(
        `https://${auth.domain}.atlassian.net/rest/api/3/issue/${issue}/worklog?notifyUsers=false`,
        {
          auth: `${auth.email}:${auth.token}`,
          json: true,
          body: worklog,
        }
      );
    });

    console.log(
      `Added ${
        res.body.timeSpent
      } to https://ancientgaming.atlassian.net/secure/RapidBoard.jspa?rapidView=3&projectKey=${
        issue.split("-")[0]
      }&modal=detail&selectedIssue=${issue}&search=${issue}`
    );
  },
};
