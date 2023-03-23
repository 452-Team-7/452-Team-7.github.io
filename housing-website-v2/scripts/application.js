const http = require("http"); // Web server module, loaded using "require" - waits for HTTP requests from clients.
const querystring = require('querystring'); // Utilities for parsing and formatting URL query strings.
const mysql = require('mysql'); // MySQL database driver.
const { create } = require("domain");
const port = (process.env.port || 8080); // Port = 8080.

var connection = mysql.createConnection({
  host: '35.221.15.116',
  user: 'root',
  password: 'Nx565*beC7I&',
  database: 'housing'
});


connection.connect(
  function(err) {
    if (err) {
      return console.error("error: " + err.message);
    }

    console.log("Connected to database");
    connection.query("CREATE TABLE IF NOT EXISTS listing(price FLOAT, location CHAR(100), availability BOOL, transportation CHAR(100), rooms INT)", function(err, result)
      {
        if(err)
        {
          throw err;
        }
        console.log("New table created."); // Checks for table creation.
        connection.query("SELECT * FROM listing");
      }
    );
    connection.query("insert into listing(price , location, availability, transportation, rooms) values(100.67 , 'Rutgers' , 1 , 'Bus' , 3)", function(err , result)
      {
        if(err)
        {
          throw err;
        }
        console.log("Inserted into table."); // Checks for table insertion.
      }
    );
  }

);



function applicationServer(request, response)
{
  if (request.method === 'GET' && request.url === '/listing')
  {
    connection.query('SELECT * FROM listing', function(err, result)
      {
        if(err)
        {
          response.writeHead(500, {'Content-Type': 'text/plain'});
          response.write('Error occurred while querying the database.');
          response.end();
          throw err;
        }
        else
        {
          response.writeHead(200, {'Content-Type': 'application/json'});
          response.write(JSON.stringify(result));
          response.end();
        }
      }
    );
  }
  else
  {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('404 Not Found.');
    response.end();
  }
}


const webServer = http.createServer(applicationServer);
webServer.listen(port);