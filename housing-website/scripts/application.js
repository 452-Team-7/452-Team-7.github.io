const http = require("http"); // Web server module, loaded using "require" - waits for HTTP requests from clients.
const querystring = require('querystring'); // Utilities for parsing and formatting URL query strings.
const mysql = require('mysql'); // MySQL database driver.
const port = (process.env.port || 8080); // Port = 8080.
const housingDatabase = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "your_root_password",
    dataBase: "Housing_Databse"
  }
) // MySQL database
housingDatabase.connect(function(err)
  {
    if(err)
      throw err;
    console.log("Housing databse connected."); // Checks for connection.

    housingDatabase.query("CREATE TABLE LISTING(price FLOAT, location CHAR(100), availability BOOL, transportation CHAR(100), rooms INT)", function(err, result)
      {
        if(err)
          throw err;
        console.log("New table created."); // Checks for table creation.
      }
    );
    
    housingDatabase.query("insert into listing(Price , Location, Availability, Transportation, Rooms) values(100.67 , 'Rutgers' , 1 , 'Bus' , 3)", function(err , result)
      {
        if(err)
          throw err;
        console.log("Inserted into table."); // Checks for table insertion.
      }
    );
  }
);
function applicationServer(request, response)
{
  // To be defined later. Finalize the HTTP response message for the client.
  if (!resMsg.headers || resMsg.headers === null)
  {
    resMsg.headers = {};
  }
  if (!resMsg.headers["Content-Type"])
  {
    resMsg.headers["Content-Type"] = "application/json";
  }
  // Send the response message.
  response.writeHead(resMsg.code, resMsg.hdrs),
  response.end(resMsg.body);
  //  response.writeHead(200, {'Content-Type': 'text/plain'});
  //  response.write('Hello World');
  //  response.end();
}
const webServer = http.createServer(applicationServer);
webServer.listen(port);