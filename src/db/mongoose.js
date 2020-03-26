const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
})

//to get database started /Users/JonathanHuertas/mongodb/bin/mongod.exe --dbpath=/Users/JonathanHuertas/mongodb-data



