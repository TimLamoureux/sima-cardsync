#!/usr/bin/env node

const program = require('commander');
const config = require('config');



let db = require('./db');


let masterlist = require('./masterlist');
let photos = require('./photos');

async function testPhoto() {
    let aaron = photos.findPhoto("aaron", "schenk", config.get('photos.folders')).then( sources => {
        photos.toBlob(sources[0]).then( blob => {
            let tmp2;
        });

    });
    let bob = await photos.findPhoto("bob", "schenk", config.get('photos.folders'));
}
//testPhoto();


function sync(source, ...args) {


    try {
        masterlist.init().then(
            (res) => {
                let dbResult = masterlist.passholders.map((passholder) => {
                    passholder.insertOrUpdateInDB(db);
                });
            },
            (err) => {
                console.log("Errrr...")
            }
        );
    } catch (err) {
        console.error(err);
    }
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

/*program
    .command('photo [import|export]',)
    .description('Import or Export season pass photos into Card DB')
    .action((action, options) => {
        photo(action, options);
    });*/

program.parse(process.argv);

if (program.sync) {
    sync();
}

if (program.photo) {
    photo();
}