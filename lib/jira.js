const got = require("got");
const conf = require("./conf");
const moment = require("moment");

module.exports = {
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
};
