 const http = require("http") ;

 const querystring = require('querystring') ; 

 const mysql = require('mysql') ;

const port = ( process.env.port || 8080 ) ;

const housingDatabase = mysql.createConnection(
  {
    host: "localhost" , 
    user: "root" , 
    password: "your_root_password" ,
    dataBase: "HousingDatabse" 
  }
)

housingDatabase.connect(function(err) {
  if(err) throw err ; 
  console.log(result) ; 

  housingDatabase.query("CREATE TABLE LISTING(Price MONEY, Location VARCHAR(100), Availability BOOL, Transportation VARCHAR(100), Rooms SMALLINT" ,
  function(err, result){
  if(err) throw err ; 
  console.log("New table created") ; }) ; // table created in database

  housingDatabase.query("insert into listing(Price , Location, Availability, Transportation, Rooms) values(100.67 , 'Rutgers' , 1 , 'Bus' , 3) " ,
  function(err , result){
  if(err) throw err ; 
  console.log("Inserted into table") ; }) ;
})
console.log("connected") ; 

function applicationServer( request , response ) 
{
  response.writeHead(200, {'Content-Type': 'text/plain'}) ; 
  response.write('Hello World') ; 
  response.end() ; 
} // idk

const webServer = http.createServer(applicationServer) ; 
webServer.listen(port) ;

//this is a test


