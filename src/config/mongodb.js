var port = process.env.MONGO_PORT || 27017;

var connection = process.env.MONGO_HOST || "mongodb://localhost:" + port + "/todo";

const options = {
    server: {
        poolSize: 5,
        socketOptions: {
            keepAlive: 1
        }
    }
};

module.exports = () => ({
    connection,
    options
});
