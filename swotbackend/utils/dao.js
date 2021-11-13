var mongoClient = require('mongodb').MongoClient;
//var dotenv = require('dotenv'); -> lo quitamos para que funcionara la seguridad
//dotenv.config();

var {
 MONGO_USER,
 MONGO_PSWD,
 MONGO_HOST,
 MONGO_DB
} = process.env;

var _db = null;
var connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PSWD}@${MONGO_HOST}/${MONGO_DB}?retryWrites=true&w=majority`;

var client = new mongoClient(connectionString, {useNewUrlParser: true, useUnifiedTopology: true});

module.exports = class {
    static async getDB(){
        if(!_db){
            try{
                var conn = await client.connect();
                console.log("Conectado a la DB");
                _db = conn.db(MONGO_DB);
            }catch(err){
                console.log("Error al conectar a la db",err);
                process.exit(1);
            }
        }
        return _db;
    }
}

   /*if(!connection){

        client.connect()
        .then((conn)=>{
            console.log("Conectado a la DB");
            connection = conn.db(MONGO_DB);
            return connection;
        })
        .catch((err)=>{
            console.log("Error al conectar a la db")
            process.exit(1);
        });
    }
    return connection;*/