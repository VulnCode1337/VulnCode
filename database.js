/*
database.js
used to connect to the MongoDB backend over default port 27017
Monitor the access log:
PS C:\Program Files\MongoDB\Server\6.0\bin> Get-Content ..\log\mongod.log -Wait
*/

const mongoose = require('mongoose');

// connection URL
const url = 'mongodb://127.0.0.1:27017/vulncodeserverDB';

async function connectToMongo() {
    try {
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true});
        console.log('Connected successfully to the MongoDB Server');
    } catch (err) {
        console.error('Failed to connect to the MongoDB server.', err);
    }
};

module.exports = {
    connectToMongo
};