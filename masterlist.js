const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const Pass_Holder = require('./pass_holder');

const config = require('config');

// If modifying these scopes, delete token.json.
const SCOPES = config.get('google_api.scopes');
const TOKEN_PATH = config.get('google_api.token_path');

let auth;

let passholders;

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials/*, callback*/) {
    const {client_secret, client_id, redirect_uris} = credentials;
    auth = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    return new Promise((resolve, reject) => {
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err)
                return getNewToken(auth, callback);

            auth.setCredentials(JSON.parse(token));

            resolve("API Connected");
            /*if (typeof callback === "function") {
                callback(auth);
            }*/

        });
    })


}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given cb with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} cb The cb for the authorized client.
 */
function getNewToken(oAuth2Client/*, cb*/) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'online',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            /*if (typeof cb === "function") {
                cb(oAuth2Client);
            }*/
        });
    });
}


function init() {
    return new Promise(async (resolve, reject) => {
        console.log("Initializing Master List");
        let authorization = await authorize(config.get('google_api.credentials'));
        await console.log("Authorized");
        self = this;
        passholders = getPassHolders().then((res) => {
            console.log("Fetched passholders");
            self.passholders = res;
            resolve(res);
        });
    })
}

/**
 * Prints the names of passholders in masterlist spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function getPassHolders() {
    return new Promise(async (resolve, reject) => {
        if (auth == undefined) {
            reject("You must authenticate before retrieving pass holders' information");
        }

        // TODO: Optimize me, is there really a need for double Promise?
        passholdersFromSheet().then(
            (ph) => {
                resolve(ph);
            },
            (err) => {
                throw ("nope");
            }
        );


    });
}

function passholdersFromSheet() {
    return new Promise((resolve, reject) => {
        const sheets = google.sheets({version: 'v4', auth});
        sheets.spreadsheets.values.get({
            spreadsheetId: config.get('masterlist.spreadsheet_id'),
            range: config.get('masterlist.sheet_id'),
        }, (err, res) => {
            if (err) throw err;

            let rows = res.data.values;

            if (rows.length) {
                let passholders = [];
                rows.reduce((acc, row, idx, rows) => {

                    // Only return what comes below the header row
                    if (idx <= config.get('masterlist.header_row') - 1) return acc;


                    // Removing 1 because row index starts at 1 in Google Sheets interface
                    let rowTitles = rows[config.get('masterlist.header_row') - 1];

                    let ph = new Pass_Holder(null, row, rowTitles);
                    acc[ph.masterlist_id] = ph;

                    return acc;
                }, passholders);

                //return passholders;
                resolve(passholders);
            } else {
                reject('No passholders found in Masterlist');
            }
        });
    });
}


module.exports.init = init;
module.exports.authorize = authorize;
module.exports.passholders = passholders;

