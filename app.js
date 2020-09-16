const fs = require('fs');
// Express imports
const express = require('express');
const expressip = require('express-ip');
// const flash = require('connect-flash');
const routes = require('./routes.js');
const app = express();
const httpPort = process.env.PORT || 8770;
const server = require("http").createServer(app);
require('dotenv').config({ path: './config.env' });
const { GoogleSpreadsheet } = require('google-spreadsheet');
const serviceAccountCredentials = JSON.parse(fs.readFileSync('./service_acc.json', 'utf-8'));

let activeSheet = null;
let archiveSheet = null;
let entryMover = undefined;

(async () => {
    activeSheet = new GoogleSpreadsheet('1RXtdcuZ9MKMl9q6ceS7-Txz8OwZFfQmie8i1KmwT7O0');
    await activeSheet.useServiceAccountAuth(serviceAccountCredentials);
    await activeSheet.loadInfo();
    archiveSheet = new GoogleSpreadsheet('1ASCercVat7wWsFMgNc70F-2je3MtaAh-SpF_3e5_4Xc');
    await archiveSheet.useServiceAccountAuth(serviceAccountCredentials);
    await archiveSheet.loadInfo();
    console.log('GSpread Ready')
})().then(() => {
    entryMover = setInterval(movePastEntries, 1000 * 60 * 60 * 24);
    movePastEntries();
});

app.set('view engine', 'pug');
app.use(expressip().getIpInfoMiddleware);
app.use(express.static(__dirname + "/public"));
app.use('/', routes);
server.listen(httpPort, () => {
    console.log('Server running on port ' + httpPort);
    console.log('============');
});

function movePastEntries(){
    let minDate = new Date(new Date().valueOf() + 3.6e+6 * 4); // In UTC cause why not

    (async () => {
        let activeSheetRows = await activeSheet.sheetsByIndex[0].getRows({ offset: 0 });
        let archiveSheetRows = await archiveSheet.sheetsByIndex[0];
        activeSheetRows.forEach((row) => {
            if(minDate > new Date(new Date(row.AppDate).valueOf() + 3.6e+6 * 24)) {
                archiveSheetRows.addRow(row._rawData);
                archiveSheetRows.saveUpdatedCells();
                row.delete();
            } else if (minDate > new Date(row.ExpirationTime)) {
                row.delete();
            }
        });
    })();

    console.log('Old appointments removed');
}
