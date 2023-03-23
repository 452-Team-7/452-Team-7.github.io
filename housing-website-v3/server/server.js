var express = require('express');
const mysql = require('mysql');
var app = express();
app.use(express.json());
const PORT = process.env.PORT || 8080;

// connection details for Google Cloud Platform MySQL server
var connection = mysql.createConnection({
    host: '35.221.15.116',
    user: 'root',
    password: "Nx565*beC7I&",
    database: 'housing'
});

connection.connect(
    function(err) {
      if (err) {
        return console.error("error: " + err.message);
      }
  
      console.log("Connected to database");
      connection.query("CREATE TABLE IF NOT EXISTS listing(provider_username VARCHAR(100),street_address VARCHAR(100),city VARCHAR(100),state VARCHAR(100),zipcode CHAR(5),building_type VARCHAR(100),purchase_type CHAR(4),price FLOAT, availability BOOL, transportation CHAR(100), rooms INT)", function(err, result){
          if(err)
          {
            throw err;
          }
          console.log("'listing' table created"); // Checks for table creation.
        });
      // connection.query(
      //     "INSERT INTO listing(provider_username,street_address,city,state,zipcode,building_type,purchase_type,price,availability,transporation,rooms) values('1','120 Neilson St','New Brunswick','NJ','08091','Apartment','Rent','$2000','1','Bus',3)",
      //     function(err,result){
      //       if (err) throw err;
      //       console.log(result);
      // });

      connection.query("CREATE TABLE IF NOT EXISTS account(username VARCHAR(100) PRIMARY KEY, password VARCHAR(100), role VARCHAR(100))",function(err,result){
        if(err) {throw err;}
        console.log("'account' table created");
      });

      
    }
  
);
  



app.get('/',function(req,res){
    res.send('Hello World');
});

app.post('/signup',function(req,res){
    console.log('signup request recieved');
    const new_username = req.body.username;
    const new_password = req.body.password;
    const new_role = req.body.role;
    
    let account_exists = false;
    // Check if a user already exists with the provided username
    var check_user_query = 'SELECT * FROM account WHERE username=?';
    connection.query(check_user_query,[new_username],function(err,result){
      if(err) throw err;
      if (result) {
        res.status(409).send("Account already exists with given username");
      }
      else{
        var create_user_account = 'INSERT INTO account(username,password,role) VALUES (?,?,?)';
        connection.query(create_user_account,[new_username,new_password,new_role],function(err,result){
          if(err) throw RegExp;
          console.log(result);
        });
        res.status(200).send("Account successfully created");        
      }

    });
  
});


app.post('/login',function(req,res){
  const login_username = req.body.username;
  const login_password = req.body.password;

  var credential_check = "SELECT username,password FROM account WHERE username=? AND password=?";
  connection.query(credential_check,[login_username,login_password],function(err,results){
    if (err) throw err;
  
    if (results.length == 0){
      res.status(409).send("Login unsucessful, please check your credentials and try again")
    }
    else{
        res.status(200).send("Login successful");
    }
  });
});


app.get('/listings',function(req,res){
  var listing_query = 'SELECT * from listing';
  connection.query(listing_query,function(err,result){
    console.log(result);
    res.status(200).send(result);
  });
});


// Start the application server 
var server = app.listen(PORT,() =>{
    console.log('server is running');
});

module.exports = server;