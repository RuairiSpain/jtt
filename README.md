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
jtt ls FE-123                         List work logs saved for issue FE-123
jtt t FE-123                          Start/stop a timer for FE-123, first time timer is set to 15 minutes
jtt t FE-123 5                        Start/stop a timer for FE-123 and add 5 minutes to the tracker
jtt fix BE-46 180                     Reset time for issue BE-46, set the time to 3 hours
jtt up                                Upload all timers to Jira, if successful the local timers are cleared
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

$ jtt t BE-5
Trackers (3)
         BE-5    369 minutes    ON
         FE-188  8 minutes      OFF
         FE-249  421 minutes    OFF
Reminder to save: "jtt up"

$ jtt t BE-5
Trackers (3)
         BE-5    370 minutes    OFF
         FE-188  8 minutes      OFF
         FE-249  421 minutes    OFF

Reminder to save: "jtt up"

$ jtt up
Trackers (3)
         BE-5    370 minutes    OFF
         FE-188  8 minutes      OFF
         FE-249  421 minutes    OFF

Reminder to save: "jtt up"
Added 6h 10m to https://ancientgaming.atlassian.net/secure/RapidBoard.jspa?rapidView=3&projectKey=BE&modal=detail&selectedIssue=BE-5&search=BE-5
Added 8m to https://ancientgaming.atlassian.net/secure/RapidBoard.jspa?rapidView=3&projectKey=FE&modal=detail&selectedIssue=FE-188&search=FE-188
Added 7h 1m to https://ancientgaming.atlassian.net/secure/RapidBoard.jspa?rapidView=3&projectKey=FE&modal=detail&selectedIssue=FE-249&search=FE-249

Done.

$ jtt status
Authentication details:
Jira: ancientgaming
User: lapido@gmail.com
Trackers (0)

```

Derived from:
https://github.com/futjikato/futjitrack
