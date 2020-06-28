# SF sObject Log
---

Output a changelog of all modified Salesforce sObject records for the day through the command line.

## Dependencies
* <a href="https://github.com/forcedotcom/cli">Salesforce DX</a>
  * Setup org aliases using Salesforce CLI to be used in application.

## Installation

### Clone

- Clone this repo to your local machine using `git@github.com:emilynassi/sf-sobject-log.git`

### Setup

- Run the following command

```bash
npm i -g
```

### Usage

```bash
Usage: sf-sobject-log [options]

Options:
  -o, --source <source>    'SFDX source org. Use alias created in SFDX CLI'
```
