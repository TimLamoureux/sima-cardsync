#!/usr/bin/env node

const program = require('commander');
const config = require('config');

let sqlite3 = require('better-sqlite3');

//const async = require('async');


let masterlist = require('./masterlist');


function sync(source, ...args) {
    let dbFile = config.get('card_db.file');
    let db = new sqlite3(dbFile);
    let tableName = config.get('card_db.passholder_table');
    process.on('exit', () => db.close());
    process.on('SIGINT', () => db.close());
    process.on('SIGHUP', () => db.close());
    process.on('SIGTERM', () => db.close());

    try {
        masterlist.init().then(
            (res) => {
                console.log("Ready to sync!");

                dbStatements = {
                    checkExists: db.prepare(
                        `SELECT id, masterlist_id FROM ${tableName}
                        WHERE masterlist_id = ?`
                    ),
                    insertPassHolder: db.prepare(
                        `INSERT INTO ${tableName} (
                            masterlist_id,
                            first_name,
                            last_name,
                            pass_type,
                            emergency_contact,
                            picked_up,
                            notes,
                            platform
                        )
                        VALUES (
                            @id,
                            @first_name,
                            @last_name,
                            @type,
                            @emergency_number,
                            @picked_up,
                            @notes,
                            @platform
                        )`
                    ),
                    updatePassholder: db.prepare(
                        `UPDATE ${tableName} SET 
                            first_name = @first_name, 
                            last_name = @last_name, 
                            pass_type = @type,
                            emergency_contact = @emergency_number,
                            picked_up = @picked_up,
                            notes = @notes,
                            platform = @platform
                        WHERE masterlist_id = @id`
                    )
                };

                let dbResult = masterlist.passholders.map((passholder) => {

                    let dontImport = config.get('photos.dont_import');
                    
                    passholder.photo;

                    try {
                        let exists = dbStatements.checkExists.get(passholder.id);

                        // Record not found
                        if (undefined === exists) {
                            console.log(`Inserting ${passholder.first_name} ${passholder.last_name} in database`);
                            return dbStatements.insertPassHolder.run(passholder);
                        }
                        // Update record
                        else {
                            console.log(`Record exists for ${passholder.first_name} ${passholder.last_name}. Updating it.`);
                            return dbStatements.updatePassholder.run(passholder)
                        }

                    }
                    catch (e) {
                        console.error(`Error with [${passholder.id}] ${passholder.first_name} ${passholder.last_name}: ${e}`);
                        return e;
                    }

                });


            },
            (err) => {
                console.log("Errrr...")
            }
        );
    } catch (err) {
        console.error(err);
    }


    /*  Fetch all rows of Spreadsheet
        Open SQLite Connection

        For each row, check if it exists in DB
            Yes: update
            No: insert

        Close DB Connection

     */
}

function photo(...args) {
    console.log('Photo');
}


// Program and commands initialization
program
    .version('0.1.0');

program
    .command('sync [cards|master]')
    //    .option('-d, --destination', 'Where do you want the sync to go to?')
    .description('Synchronize Masterlist->Card DB or Card DB->Masterlist')
    .action((source, options) => {
        sync(source, options);
    });

program
    .command('photo [import|export]',)
    .description('Import or Export season pass photos into Card DB')
    .action((action, options) => {
        photo(action, options);
    });

program.parse(process.argv);

if (program.sync) {
    sync();
}

if (program.photo) {
    photo();
}