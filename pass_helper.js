#!/usr/bin/env node

const program = require('commander');
const config = require('config');
const {google} = require('googleapis');


let gapi = config.get('google-api');
console.log(`GAPI: ${gapi}`);




// Program and commands initialization
program
    .version('0.1.0');

program
    .command('sync [cards|master]')
//    .option('-d, --destination', 'Where do you want the sync to go to?')
    .description('Synchronize Masterlist->Card DB or Card DB->Masterlist')
    .action((source,options) => {
        sync(source, options);
    });

program
    .command('photo [import|export]', )
    .description('Import or Export season pass photos into Card DB')
    .action((action,options) => {
        photo(action,options);
    });

program.parse(process.argv);

if (program.sync) {
    sync();
}

if (program.photo) {
    photo();
}

function sync(source, ...args) {
    console.log('Syncing');
}

function photo(...args) {
    console.log('Photo');
}