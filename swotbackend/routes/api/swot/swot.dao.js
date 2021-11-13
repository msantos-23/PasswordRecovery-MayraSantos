var conn = require('../../../utils/dao');
var ObjectID = require('mongodb').ObjectId;
var _db;

class Swot{
    swotColl = null;
    constructor(){
        this.initModel();
        //console.log(conn());
        //this.swotColl = conn.collection("SWOT");
    }
    async initModel(){
        try{
            _db = await conn.getDB();
            this.swotColl = await _db.collection("SWOT");
        }catch(ex){
            console.log(ex);
            process.exit(1);
        }
    }
    async getAll(id){
        const filter = {"user_id": ObjectID(id)};
        //return await this.swotColl.find({}).toArray();
        let swots = await this.swotColl.find(filter);
        return swots.toArray();
    }

    async getWithFilterAndProjection(filter,projection){
        //Select {projection} from SWOT where {filter}
        //Select _id, swotRelevance from SWOT
        let p = {
            "projection": projection
        }
        let swots = await this.swotColl.find(filter,p);
        return swots.toArray();
    }

    async updateRelevanceRandom(id){
        const filter = {"_id": new ObjectID(id)};
        const updateAction = {"$set": {swotRelevance: Math.round(Math.random()*100)/100}};
        let result = await this.swotColl.updateOne(filter,updateAction);
        return result;
    }

    async getById(id){
        const filter = {"_id": new ObjectID(id)};
        let swotDocument = await this.swotColl.findOne(filter);
        return swotDocument;
    }

    async getByType(type, userId){
        //SELECT * FROM Swot WHRERE swotType = ?;
        const filter = {"swotType": type, "user_id": new ObjectID (userId)};
        let cursor = await this.swotColl.find(filter);
        return cursor.toArray();

    }

    async getByMetaKey(key, userId){
        const filter ={"swotMeta":key, "user_id": new ObjectID (userId)};
        let cursor = await this.swotColl.find(filter);
        return cursor.toArray();
    }

    async getByFacet(textToSearch, page, itemsPerPage, userId){
        //const filter ={swotDesc: {"$regex": `\/${textToSearch}\/`}};
        const filter = {swotDesc: RegExp(textToSearch, 'g'), "user_id": new ObjectID (userId)};
        /*const options = {
            projection : {},
            limit: itemsPerPage,
            skip: (itemsPerPage*(page-1))
        };*/
        let cursor = await this.swotColl.find(filter);
        let docsMatched = await cursor.count();
        cursor.skip((itemsPerPage*(page-1)));
        cursor.limit(itemsPerPage);
        let documents = await cursor.toArray();
        return{
            docsMatched,
            documents,
            page,
            itemsPerPage
        }
        //SELECT column1, column2 from TABLE where column1 like '%SomeText%';

    }

    async getAggregateData(userId){
        //Select type, count(*) from SWOTS where userId =? group by type;
        //funciones aggregadas, count, sum, meam, avg, max, min, stdev...
        const PipeLine = [
            {
              '$match': {
                'user_id': new ObjectID(userId)
              }
            }, {
              '$group': {
                '_id': '$swotType',
                'swotTypeCount': {
                  '$sum': 1
                }
              }
            }, {
              '$sort': {
                '_id': 1
              }
            }
          ];
          //  ls -l | grep .jpg
          const cursor = this.swotColl.aggregate(PipeLine);
          return await cursor.toArray();
    }
    /**
     * SWOT, SWOTMETA {swotid 1:n}
     * select * from  Swot inner join swot meta on swot.swotid = swotmeta.swotid 
     * where swotmeta.swotkey = ?;
     */

    async addNew(swotType, swotDesc,swotMetaArray,id){
        let newSwot = {
            swotType,
            swotDesc,
            swotMeta: swotMetaArray,
            swotDate: new Date().getTime(),
            swotRelevance: 0,
            "user_id": ObjectID(id)
        }
        let result = await this.swotColl.insertOne(newSwot);
        return result;
    }

    async addMetaToSwot(swotMetaKey, id){
        //UPDATE SWOT set swotMeta = "Nuevo valor" where _id = 'aID';
        let filter = {"_id": new ObjectID(id)};
        let updateJson = {
            "$push":{"swotMeta": swotMetaKey}
        };
        let result = await this.swotColl.updateOne(filter,updateJson);
        return result;
    }

    async deleteById(id){
        //DELETE FROM SWOT where _id = 'aID';
        let filter = {"_id":new ObjectID(id)};
        let result = await this.swotColl.deleteOne(filter);
        return result;
    }

    
}

module.exports = Swot;