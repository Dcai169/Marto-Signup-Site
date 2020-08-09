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

let doc = null;
(async () => {
    doc = new GoogleSpreadsheet('1RXtdcuZ9MKMl9q6ceS7-Txz8OwZFfQmie8i1KmwT7O0');
    await doc.useServiceAccountAuth(require('./service-acc.json'));
    await doc.loadInfo();
    console.log('GSpread Ready')
})();

app.set('view engine', 'pug');
app.use(expressip().getIpInfoMiddleware);
app.use(express.static(__dirname + "/public"));
app.use('/', routes);
server.listen(httpPort, () => {
    console.log('Server running on port ' + httpPort);
    console.log('============');
})

// Move entries from one sheet to another to reduce clutter
// Change to force commit

function movePastEntries(){
    let appointmentList = [];
    let minDate = new Date();

    (async () => {
        let sheetRows = await doc.sheetsByIndex[0].getRows({ offset: 0 });
        appointmentList = sheetRows.map((row) => {
            return { appStart: new Date(`${row.AppDate} -0400`), appEnd: new Date(new Date(`${row.AppDate} -0400`).valueOf() + Number(row.AppDuration.substring(0, row.AppDuration.length - 3)) * 3.6e+6) };
        });
    })();

    appointmentList.forEach((app) => {

    });
}
