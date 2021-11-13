var conn = require('../../../utils/dao');
var ObjectID = require('mongodb').ObjectId;
var _db;
const bcrypt = require("bcryptjs");

class Sec{
    secColl = null;
    constructor(){
        this.initModel();
    }
    async initModel(){
        try{
            _db = await conn.getDB();
            this.secColl = await _db.collection("users");
        }catch(ex){
            console.log(ex);
            process.exit(1);
        }
    }

    async createNewUser( email, password) {
        try {
          let user = {
            email: email,
            password: await bcrypt.hash(password, 10),
            lastlogin: null,
            lastpasswordchange: null,
            passwordexpires: new Date().getTime() + (90 * 24 * 60 * 60 * 1000), 
            oldpasswords: [],
            roles:["public"]
          }
          let result = await this.secColl.insertOne(user);
          //console.log(result); 
          return result;
        } catch(ex) {
          console.log(ex);
          throw(ex);
        }
      }

      async updatePassword(email, newpassword) {
        try {
          const filter = {"email": email};
          let oldpassword = await this.secColl.findOne(filter,{"password":1});
          let updateOldPasswords = {
            "$push" : {"oldpasswords": oldpassword}
          };
          let result1 = await this.secColl.updateOne(filter,updateOldPasswords);
    
          const updateAction = {"$set": {
            password: await bcrypt.hash(newpassword, 10),
            lastpasswordchange: new Date().getTime()
          }};
          let result = await this.secColl.updateOne(filter,updateAction);
          return result;
        } catch(ex) {
          console.log(ex);
          throw(ex);
        }
      }
    
      async oldpasswords (email){
        const filter = {"email": email};
        let projection = {
          "projection": {password:1, _id:0}
        }
        let oldpassword = await this.secColl.findOne(filter,projection);
        let updateJson = {
          "$push" : {"oldpasswords": oldpassword}
        };
        
      }
    
      async setResetToken(email, uuid) {
        try {
          const filter = {"email": email};
          const updateAction = {"$set": {
            "resettoken": uuid,
            "tokenexpires": new Date().getTime() + (30 * 60 * 1000)
          }};
          let result = await this.secColl.updateOne(filter,updateAction);
          return result;
        } catch(ex) {
          console.log(ex);
          throw(ex);
        }
      }
    
      async unsetResetToken(email) {
        try {
          const filter = {"email": email};
          const updateAction = {"$unset": {
            resettoken: "",
            tokenexpires: ""
          }};
          let result = await this.secColl.updateOne(filter,updateAction);
          return result;
        } catch(ex) {
          console.log(ex);
          throw(ex);
        }
      }
    
      async validateToken(email, uuid) {
        try {
          const filter = {
            "email": email, 
            "resettoken":uuid, 
            "tokenexpires":{$gte:(new Date().getTime())}};
          return await this.secColl.findOne(filter);
        } catch(ex) {
          console.log(ex);
          throw(ex);
        }
      }

    async getByEmail(email){
        const filter = {"email": email};
        return await this.secColl.findOne(filter);
    }

    async comparePassword(rawPassword, dbPassword){
        return await bcrypt.compare(rawPassword,dbPassword);
    }
    
}
module.exports = Sec;