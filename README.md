## LUCIUS Proxy Agent

Script that a user can run on their own server to proxy relevant metadata from satellite imagery providers to the LUCIUS platform.

The script has been bundled with Node.js directly in the releases to allow single command execution without the need to setup a proper development environment.

### Running

Set the relevant environment variables permanently for your system or they may be passed inline with the command. Setting these environment variables is _required_ for the script to run:

```
LUCIUS_API_URL   : The API URL for LUCIUS. If none provided, defaults to the LUCIUS cloud platform.
LUCIUS_API_KEY   : Required. The API key for LUCIUS.
```

Additionally, environment variables need to be set to access each provider as well. For example, to run the proxy between UP42 and LUCIUS, set these environment variables:

```
UP42_USERNAME   : Email for UP42 account
UP42_PASSWORD   : Password for UP42 account
```

Of note, the username and password to access the provider can be a newly created account for this proxy script (e.g. `lucius-proxy@company.com`) on the provider's system if preferable.

To run the script, after downloading it from the [releases](https://github.com/lucius-space/proxy-agent/releases) page, simply execute the script relevant to your operating system in a terminal prompt:

```
./lucius-proxy-<os>
```

Here is an example of running the script with the environment variables inline with a starting date set, debug statements being printed out, and the dry run option being set on a linux machine:

```
LUCIUS_API_KEY=TP5tygQ2mN0Ad4xF1z90qKxP1Tb76Ebi UP42_USERNAME=info@lucius.space UP42_PASSWORD=xUFkTSQeLTP5ty ./lucius-proxy-linux --startDate 2024-01-01 --debug --dryRun
```

### Options

These are the options provided by the script during run:

```
--startDate : Start date for the data fetch in YYYY-MM-DD format. If no value provided, defaults to today's date
--endDate : End date for the data fetch in YYYY-MM-DD format. If no value provided, will continue to fetch indefinitely.
--interval : How often to fetch updates in minutes. Defaults to 15 minutes
--debug : Enables debug mode for additional logging.
--dryRun : Saves what files would be sent to the LUCIUS platform in the './send/' folder without actually sending anything.
--help : Displays this help message.
```

### Additional Information

There are no issues with running this script multiple times -- the LUCIUS platform does deduplication of records to ensure that no duplicates are created.
