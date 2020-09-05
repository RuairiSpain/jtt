## Installation

```
npm i -g jtt
```

## Usage

First setup authentication. jira cloud instance name and your credentials

`jtt auth <host> <email_address> <api_token>`
Note:
The host is the first part of you Jira Cloud domain name, for example: `ancientgaming` for this Jira Cloud domain: https://ancientgaming.atlassian.net/

You can create an API token here: https://id.atlassian.com/manage-profile/security/api-tokens
Only use your email and token for login through the command line, don't use your username or real password
The auth details are stored in ~/.jtt/auth.json and look something like:

```
{
  "host": "ancientgaming",
  "user": "lapido@gmail.com",
  "pass": "abcde12345678abcde1234"
}

```

CLI will let you: list your Jira projects, assigned issues in projects and start tracking your time

### Full list of commands

```
jtt --help [cmd]                      Show general help or command help
jtt auth <domain> <email> <token>     Set and save authentication
jtt status                            Print authentication details
jtt p                                 List projects
jtt i FE                              List open issues in FE project that are assigned to you
jtt ls                                List work logs saved in jira
jtt ls FE-123                         List work logs saved for issue FE-123
jtt log FE-123 15                     Log 15 minutes in jira to issue FE-123
jtt log BE-46 180 "Added cool stuff"  Log 90 minutes to issue FE-123 and attach a comment to jira
```

Example workflow:

```
Setup:
$ npm i -g jtt

$ jtt auth ancientgaming lapido@gmail.com abcde12345678abcde1234

$ jtt status
Authentication details:
Jira: ancientgaming
User: lapido@gmail.com

$ jtt p
FE              Frontend
BE              Backend
CSGR            CSGORoll
HD              HypeDrop
GAG             Global Ancient Gaming

$ jtt i BE
9 issue(s)
BE-142  Add indices for Item and ItemVariant. SELECT took 3 seconds, now 0.5 seconds
BE-46   Track Affiliate Stats
BE-136  HD - Improve Admin Boxes page performance and usability
BE-154  Dice - Internal server error
BE-143  Add monthly activity chart to affiliate resolver
BE-5    Extending TradeBot to SEND TradeOffers on Steam
BE-119  Dice Provably Fair RNG is not fairly distributed
BE-19   Automatic Box Price Adjustment
BE-77   Make TradeBots decline offers after random wait time

$ jtt log BE-119 25 "Making Jira time tracker for team :)"
Added worklog 25m: https://ancientgaming.atlassian.net/secure/RapidBoard.jspa?rapidView=3&projectKey=BE&modal=detail&selectedIssue=BE-119&search=BE-119

```

Derived from:
https://github.com/futjikato/futjitrack
{
"host": "ancientgaming",
"user": "lapido@gmail.com",
"pass": "tWLBxvvbjw0z1tnY0jKbD307"
}
