const config = require('config');

let photos = require('./photos');

class Pass_Holder {
    constructor(details, row, rowTitles) {

        if ( details instanceof Object ) {
            this.masterlist_id = details.masterlist_id;
            this.card_exchange_id = details.card_exchange_id;
            this.first_name = details.first_name;
            this.last_name = details.last_name;
            this.type = details.type;
            this.phone = details.phone;
            this.email = details.email;
            this.emergency_number = details.emergency_number;
            this.waiver = details.waiver;
            this.photo_upload = details.photo_upload;
            this.printed_pass = details.printed_pass;
            this.picked_up = details.picked_up;
            this.platform = details.platform;
            this.notes = details.notes;
        }

        if ( row != undefined && rowTitles != undefined ) {
            this.createFromRow(row, rowTitles);
        }

    }

    /**
     *
     * @param row Array containing all the data for this Pass_Holder in the same order as rowTitles
     * @param rowTitles Array containing the attribute names
     */
    createFromRow(row, rowTitles) {
        rowTitles.map((rowTitle, i) => {
            this[rowTitle] = row[i];
        });
    }

    toObject() {
        /*TODO: Investigate more. Passing the Pass_Holder object throws binding error.
            For now, we are converting the Pass_Holder to a new Object without methods (not a class)
         */
        return Object.keys(this).reduce( (acc, key, idx) => {
            acc[key] = this[key];
            return acc;
        }, {});
    }

    insertOrUpdateInDB(db) {
        try {
            let exists = db.statements.checkExists.get(this.masterlist_id);

            // Record not found
            if (undefined === exists) {
                console.log(`Inserting ${this.first_name} ${this.last_name} in database`);

                this.retrievePhoto(config.get('photos.folders')).then( photo => {
                    return db.statements.insertPassHolder.run(this.toObject());
                }, err => {
                    console.error(err);
                });


            }
            // Update record if it exists and hasn't been printed
            else if (exists.printed < 1) {
                console.log(`Record exists and not printed for ${this.first_name} ${this.last_name}. Updating it.`);
                // TODO: Fetch photo for who doesn't have one.
                if ( !exists.photo_length ) {
                    console.log(`${this.first_name} ${this.last_name} doesn't have a photo`)
                    this.retrievePhoto(config.get('photos.folders'), db.statements.updatePassholder.run, db.statements.updatePassholder)
                }
                //return db.statements.updatePassholder.run(this.toObject())
            }

        }
        catch (e) {
            console.error(`Error with [${this.masterlist_id}] ${this.first_name} ${this.last_name}: ${e}`);
            /*throw e;*/
        }
    }

    insertInDB() {

    }

    updateInDB() {

    }

    updateInSheet(auth) {

    }

    async retrievePhoto(locations, callback, context) {

        // TODO: Implement import restrictions
        let dontImport = config.get('photos.dont_import');

        // TODO: Implement check if photo exists. If so, return existing photo


        photos.findPhoto(this.first_name, this.last_name, locations).then( sources => {
            photos.toBlob(sources[0]).then( blob => {
                this.photo_blob = blob;

                if (typeof callback === "function") {
                    callback.call(context, this.toObject());
                }

            });

        });
    }

}

module.exports = Pass_Holder;