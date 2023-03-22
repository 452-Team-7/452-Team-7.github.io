 const http = require("http") ;

 const querystring = require('querystring') ; 

 const mysql = require('mysql') ;

const port = ( process.env.port || 8080 ) ;

const housingDatabase = mysql.createconnection(
  {
    host: "host" , 
    user: "root" , 
    password: "Saezlouie1@" ,
    dataBase: "HousingDatabse" 
  }
)

housingDatabase.connect(function(err) {
  if(err) throw err ; 
  console.log(result) ;
})
console.log("connected") ;

function applicationServer( request , response ) 
{
  
}

const webSever = http.createServer(applicationServer) ; 
webServer.listen(port) ;