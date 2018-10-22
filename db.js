const sqlite3 = require('better-sqlite3');
const config = require('config');

let dbFile = config.get('card_db.file');

let db = new sqlite3(dbFile);
process.on('exit', () => db.close());
process.on('SIGINT', () => db.close());
process.on('SIGHUP', () => db.close());
process.on('SIGTERM', () => db.close());

let tableName = config.get('card_db.passholder_table');

module.exports.statements =  {
    checkExists: db.prepare(
        `SELECT id, masterlist_id, printed, length(photo) as photo_length FROM ${tableName}
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
                            platform,
                            printed
                        )
                        VALUES (
                            @masterlist_id,
                            @first_name,
                            @last_name,
                            @type,
                            @emergency_number,
                            @picked_up,
                            @notes,
                            @platform,
                            @printed_pass
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
                            platform = @platform,
                            photo = @photo_blob
                        WHERE masterlist_id = @masterlist_id`
    )
};
module.exports.db = db;
module.tableName = tableName;