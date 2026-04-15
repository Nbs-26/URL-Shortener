const { createPostgresClient } = require("./postgres");

//Base62 Character Set
//10Digits, 26 lower case letters, 26 upper case letters
const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

async function shorten(req,res) {
    const url = req.body.url;
    if(!url){
        return res.status(400).json({"Error" : "URL is required"});
    }
    let pgClient;
    try {
        //Create a Postgres-Client to talk to Postgres Database
        pgClient = await createPostgresClient();
        let result = await pgClient.query('SELECT NOW()');
        console.log(result.rows);

        //Insert the URL in the Db and get the unique id

    } catch (error) {
        return res.status(500).json({"Error" : error.message});
    }
}