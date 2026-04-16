const {createClient} = require("redis");

async function createRedisClient() {
    try {
        const redisClient = createClient(
            {
                url:"redis://localhost:6379",
            }
        )

        redisClient.on("error",(error)=>{
            throw error;
        })

        await redisClient.connect();
        return redisClient;    
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports = {createRedisClient}