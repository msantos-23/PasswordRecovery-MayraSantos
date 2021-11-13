/*const { ObjectId } = require("bson");
const { BadGateway } = require("http-errors");
const { Collection } = require("mongodb");

var documentos =[];
for(var i = 100; i<=199; i++){
    documentos.push({"index": i});
}

db.docs.insert(documentos);

/** Coleccion donde se va insertar los documentos -> docs*/
/**Cuantos documentos se van a insertar ->100 */
/**Atributo que se está guardando -> index */
/**Se guarda uno por uno o en bulto -> pues en bulto ya que al inicio documentos está como un arreglo vacío */
//{} [] <- Es un documento json bien formado json.org y se consideran objetos y arreglos vacíos

/*
{
    "nombre" : "Un nombre",
    "edad" : 15,
    "camino" array("a"=>1,"b"=>2, "c"=>3, "d"=>4)
}
//No es válido porque en vez de flechas irian puntos y tampoco se pueden establecer funciones como array

{
    "nombre" : "Un nombre",
    "edad" : 15,
    "camino" : ["a":1,"b":2, "c":3, "d":4]
}
//Correcto json bien formado 

{"datos" : 1, "ejemplo" : 1,2,3,4}

//No es un documento json bien formado


{"datos" : 1, "ejemplo" : [1,2,3,4]}
//Este si es correcto

//Lenguaje de programacion  que se usa para ejecutar comandos en la terminal de mongo compass -> Javascript

db.micoll.find().pretty() //-> find lo encuentra y para mostrarlo bonito es pretty
db.micoll.count() //-> Cuenta los documentos en la coleccion

{
    _id: ObjectId("jbcdhbcds"),
    nombre: "HOla Mundo",
    edad: 50
}

//Extraer todos los documentos que estan entre la edad de 50 y de 70 años 
db.micoll.find({edad: {"$gte":50, "$lte":70}});

/*
gt<-mayor que  >
gte<- mayor o igua que  >=
lt<- menos que  <
lte <- menor que <=
*/

//Extraer los documentos que esten en los extremos menor a 10 y mayor a 90
/*db.micoll.find({$or:[{edad: {"$lte":10}}, {edad: {"$gte":90}}]});

//nombre de la base de datos en la que estos trabajando 
unicamente es -> db //base actual

//use nombre de la base -> cambiar de base
//show databases o show dbs -> mostrar todas las bases del cluster
//show collectios -> muestra las colecciones de la base de datos en la que estoy trabajando actualmente
// db.SWOT.findOne() // Muestra un documento de la coleccion

//Muestre dos atributos del documento
//db.SWOT.find({projection, filter}),
//db.SWOT.find({}, {"swotType" : 1, "swotMeta":1}).pretty()


// los ultimos 10 que tengan mayor cantidad de relevacia
db.Swot.find({}).sort({"swotRelevance": -1}).limit(10)

//metodos http 
/**
 * post
 * get
 * put
 * delete
 */

/**
 * metodos del driver de mongo
 * insertone
 * deleteone
 * updateone
 * findone
 * 
 * Agregado
 * var pipeline = [
 *  "$group" : {
 *  "_id" : "$someAtt",
 *  "$sum" : 1
 * }
 * ]
 * Sacar un agregado <- aggregate()
 */


//Metodo para devolverlos todos formateados en un objeto json
//const cursor = await collection.find({}).toArray();
