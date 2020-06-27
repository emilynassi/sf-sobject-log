const jsforce = require("jsforce")
const { exec } = require("child_process")
const program = require("commander")
const config = require("./sobject-config")
const excel = require("exceljs")
const moment = require("moment")
const utils = require("./lib/utils")

const execute = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      }
      else if (stdout) {
        resolve(stdout)
      }
      else if (stderr) {
        reject(stderr)
      }
      else {
        reject(`Unknown error while executing command "${cmd}"`)
      }
    })
  })
}


const getConnection = async (org) => {
  const orgResult = await execute(`sfdx force:org:display -u ${org} --json`)
  const asJson = JSON.parse(orgResult)

  const orgDetails = asJson.result

  return new jsforce.Connection({
    accessToken: orgDetails.accessToken,
    instanceUrl: orgDetails.instanceUrl,
  })
}

const zip = (arr1, arr2) => {
  return arr1.reduce((zipped, _, idx) => {
    zipped.push([arr1[idx], arr2[idx]])
    return zipped
  }, [])
}

const run = async (options) => {
  const connection = await getConnection(options["org"])

    const queries = config.map(config => {
    return connection.query(
      `SELECT Id, ${config.matchBy}, LastModifiedBy.Name, LastModifiedDate
      FROM ${config.sobject} 
      WHERE LastModifiedDate = TODAY`
    )
  })

  const results = await Promise.all(queries)
  const records = results.map(result => result.records)

  const combined = zip(config.map(c => c.sobject), records)

  const workbook = new excel.Workbook();
  let sheet = workbook.addWorksheet('configdata', {
    headerFooter: { firstHeader: "External Id", }
  });

  sheet.columns = [
    { header: 'External ID', key: 'Id' },
    { header: 'Object', key: 'object' },
    { header: 'Record', key: 'record' },
    { header: 'Initials', key: 'user' },
    { header: 'Date', key: 'date' },

  ];

  combined.forEach(([sobject, records]) => {

    records.forEach(rec => {
      sheet.addRow(
        {
          Id: rec.Id,
          object: rec.attributes.type,
          record: rec.Name,
          user: utils.turnNameToInitials(rec.LastModifiedBy.Name),
          date: moment(rec.LastModifiedDate).format("MM/DD/YYYY"),
        });
    });
  })

  const filename = `Changelog ${moment().format("MM-DD-YYYY")}.xlsx`

  await workbook.xlsx.writeFile(filename);

}

program
  .requiredOption('-o, --org <org>', 'sfdx source org')

program.parse(process.argv)

run(program)
