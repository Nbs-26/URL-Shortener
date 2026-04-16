const { createPostgresClient } = require("./postgres");
const {createRedisClient} = require('./redisClient');
async function shorten(req,res) {
    const {url} = req.body;
    if(!url){
        return res.status(400).json({"Error" : "URL is required"});
    }

    //Base62 Character Set
    //10 Digits, 26 lower case letters, 26 upper case letters
    const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let pgClient;
    try {
        //Create a Postgres-Client to talk to Postgres Database
        pgClient = await createPostgresClient();

        //Insert the URL in the Db and get the unique id
        const insertQuery = "INSERT INTO url_shortener.urls (long_url) VALUES ($1) RETURNING id";
        var result = await pgClient.query(insertQuery,[url]);
        const id = result.rows[0].id;

        //Encode the unique id in Base62 to get the shortened URL
        var short_code = "";
        var unique_num = id;
        while(unique_num>0){
            var remainder = unique_num % 62;
            short_code = BASE62.charAt(remainder) + short_code;
            unique_num=Math.floor(unique_num/62);
        }
        // console.log(short_code)
        //Update the row in the DB corr. to id by inserting the short_code over there
        const updateQuery = "UPDATE url_shortener.urls set short_code = $1 where id =$2 returning short_code";
        result = await pgClient.query(updateQuery,
            [short_code,id]
        ); 
        return res.status(200).json({"shortened_url": `http://localhost:8000/api/${result.rows[0].short_code}`});
    } catch (error) {
        return res.status(500).json({"Error" : error.message});
    } finally {
        if (pgClient) {
            await pgClient.end();
        }
    }
}

async function redirect(req,res) {
    const { short_code } = req.params;
    if(!short_code){
        return res.status(400).json({"Error" : "Short-Code not exist"});
    }
    try {
        var longURL = await findLongURL(short_code);
        if(!longURL){
            return res.status(404).json({"Error" : "Invalid short-code provided"});
        }
        return res.redirect(longURL);
    } catch (error) {
        return res.status(500).json({"Error" : error.message});
    }
}

async function findLongURL(short_code) {
    if(!short_code){
        return null;
    }
    let pgClient;
    let redisClient;
    try {
        //Check in Cache
        //Create a Redis-Client
        redisClient = await createRedisClient();
        const cachedLongURL = await redisClient.get(short_code);
        // console.log(cachedValue)
        if(cachedLongURL){
            console.log("Cache Hit")
            return cachedLongURL;
        }
        console.log("Cache Miss")
        
        //Create a Postgres Client
        pgClient = await createPostgresClient();
        //Select query from DB
        let selectQuery = 'select long_url from url_shortener.urls where short_code = $1';
        let result = await pgClient.query(selectQuery, [short_code]);
        if(result.rows.length == 0){
            return null;
        }
        var long_url = result.rows[0].long_url;

        //Insert in the Cache, so that it can be retrieved later.
        await redisClient.set(short_code,long_url,{
            EX : 3600 //Set the expiry time to 1 hr
        });
        return long_url;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        if (pgClient) {
            await pgClient.end();
        }
        if(redisClient){
            await redisClient.quit();
        }
    }
}

module.exports = {shorten,redirect}