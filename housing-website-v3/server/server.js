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
    database: 'housing',
    multipleStatements: true
});

connection.connect(
    function(err) {
      if (err) {
        return console.error("error: " + err.message);
      }
  
      console.log("Connected to database");
      connection.query("CREATE TABLE IF NOT EXISTS listing(provider_username VARCHAR(100),street_address VARCHAR(100),city VARCHAR(100),state VARCHAR(100),zipcode CHAR(5),building_type VARCHAR(100),purchase_type CHAR(4),price FLOAT, availability BOOL, transportation CHAR(100), rooms INT, PRIMARY KEY (street_address,city,state))", function(err, result){
          if(err)
          {
            throw err;
          }
          console.log("'listing' table created"); // Checks for table creation.
        });
      // connection.query(
      //     "INSERT INTO listing(provider_username,street_address,city,state,zipcode,building_type,purchase_type,price,availability,transportation,rooms) values('1','120 Neilson St','New Brunswick','NJ','08091','Apartment','Rent','2000','1','Bus',3)",
      //     function(err,result){
      //       if (err) throw err;
      //       console.log(result);
      // });
      connection.query("CREATE TABLE IF NOT EXISTS chatroom(chatroomID INT AUTO_INCREMENT PRIMARY KEY, participant_one_username VARCHAR(100), participant_two_username VARCHAR(100))",function(err,results){
        if (err) throw err;
        console.log("'chatroom' table created");
      });

      connection.query("CREATE TABLE IF NOT EXISTS reviews(username VARCHAR(100),street_address VARCHAR(100),city VARCHAR(100),state VARCHAR(100),review VARCHAR(200), PRIMARY KEY(username,street_address,city,state))",function(err,result){
          if(err) throw err;
          console.log("'reviews' table created");
      });

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
      if (result.length > 0) {
        res.status(409).send("Account already exists with given username");
      }
      else{
        var create_user_account = 'INSERT INTO account(username,password,role) VALUES (?,?,?)';
        connection.query(create_user_account,[new_username,new_password,new_role],function(err,result){
          if(err) throw RegExp;
          res.status(200).send("Account successfully created"); 
        });       
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
  const search_zipcode = req.body.zipcode;

  var listing_query = 'SELECT * FROM listing WHERE zipcode=?';
  const search_listing_query = connection.query(listing_query,[search_zipcode],function(err,result){
    if (err) throw err;
    if (result.length == 0) {
      res.status(200).send("There are no listings for your area");
    }
    else{
      res.status(200).send(result);
    }
  });
});


app.post('/listings',function(req,res){
  const provider_username = req.body.provider_username;
  const street_address = req.body.street_address;
  const city = req.body.city;
  const state = req.body.state;
  const zipcode = req.body.zipcode;
  const building_type = req.body.building_type;
  const purchase_type = req.body.purchase_type;
  const price = req.body.price;
  const availability = req.body.availability;
  const transportation = req.body.transportation;
  const rooms = req.body.rooms;

  // Check if there exists a listing with these details, if it does than another housing_provider owns that listing
  var check_listing = 'SELECT * FROM listing where street_address=? AND city=? AND state=?';
  connection.query(check_listing,[street_address,city,state],function(err,result){
    if (err) throw err;
    if (result.length != 0) {
      res.status(409).send("Another housing provider owns this listing");
      return;
    }
  });

  // No other listings exist matching the given details, create new listing
  var place_listing = 'INSERT INTO listing(provider_username,street_address,city,state,zipcode,building_type,purchase_type,price,availability,transportation,rooms) values(?,?,?,?,?,?,?,?,?,?,?)';
  connection.query(place_listing, [provider_username,street_address,city,state,zipcode,building_type,purchase_type,price,availability,transportation,rooms], function(err,result){
    if (err) throw err;
    res.status(200).send(req.body);
    }
  );
});


app.post('/listings/post-review',function(req,res){
  const street_address = req.body.street_address;
  const city = req.body.city;
  const state = req.body.state;
  const review = req.body.review;
  const tenant_username = req.body.username;

  // Check if the listing exists
  var listing_exists = "SELECT * FROM listing WHERE street_address=? AND city=? AND state=?";
  connection.query(listing_exists,[street_address,city,state],function(err,result){
    if (err) throw err;
    if (result.length == 0){
      res.status(400).send("Listing does not exist");
      return;
    }
  });


  // Checked that the listing does exist, check if user already has left a review. If they have not then place the review
  var check_user_review = "SELECT * FROM reviews WHERE street_address=? AND city=? AND state=? AND username=?";
  connection.query(check_user_review,[street_address,city,state,tenant_username],function(err,result){
    if (err) throw err;
    if (result.length != 0){
      res.status(409).send("A review has a already been placed by the user");
      return;
    }
  });
  
  // DO WE WANT TO RETURN ALL THE REVIEWS OR JUST SHOW THAT IT WAS SUCESSFULLY DONE?
  var place_review = 
    "INSERT INTO reviews(username,street_address,city,state,review) values(?,?,?,?,?); SELECT * FROM reviews WHERE street_address=? AND city=? AND state=?";
  connection.query(place_review,[tenant_username,street_address,city,state,review,street_address,city,state,tenant_username],function(err,result){
    if (err) throw err;
    if (result.length!=0){
      res.status(200).send(result[1]);
    }
  });
});



app.get('/listings/get-reviews', function(req,res){

    const street_address = req.body.street_address;
    const city = req.body.city;
    const state = req.body.state;
  // Check if the listing actually exists
    var listing_exists = "SELECT * FROM listing WHERE street_address=? AND city=? AND state=?";
    connection.query(listing_exists,[street_address,city,state],function(err,result){
      if (err) throw err;
      if (result.length == 0){
        res.status(400).send("Listing does not exist");
        return;
      }
    });


  // Return all the reviews for the listing
    var get_reviews = "SELECT * FROM reviews WHERE street_address=? AND city=? AND state=?";
    connection.query(get_reviews,[street_address,city,state],function(err,result){
      if (err) throw err;
      if (result.length!=0){
        res.status(200).send(result);
      }
    });

});

app.post('/message/create-chat',function(req,res){
  const participant_one_username = req.body.username_one;
  const participant_two_username = req.body.username_two;


  // Check if both users exist, if one or both don't then return status 400
  var check_users_exist = "SELECT * FROM account WHERE username=?;SELECT * FROM account WHERE username=?";
  connection.query(check_users_exist,[participant_one_username,participant_two_username],function(err,result){
    if(err) throw err;
    if (result.length != 2 || (result[0].length == 0  || result[1].length == 0) ){
      res.status(400).send("One or more users does not exist.");
      return;
    }
    else{

      // Check if there exists a chat room containing both users, if it does return status 409
      var check_chatroom_exists = "SELECT * FROM chatroom WHERE (participant_one_username=? AND participant_two_username=?) OR (participant_one_username=? AND participant_two_username=?)";
      connection.query(check_chatroom_exists,[participant_one_username,participant_two_username,participant_two_username,participant_one_username],function(err,result){
        if (err) throw err;
        if (result.length != 0){
            res.status(409).send("Chatroom could not be created because a chatroom exists between both users");
            return;
        }
        else{

          // Create the chatroom between both users
          var create_chatroom = "INSERT INTO chatroom(participant_one_username,participant_two_username) values(?,?)";
          connection.query(create_chatroom,[participant_one_username,participant_two_username],function(err,result){
            if (err) throw err;
            res.status(200).send("Chatroom successfully created");
          });


        }
      });



    }
  });
});


app.get('/message/open-chat',function(req,res){
  



});




// Start the application server 
var server = app.listen(PORT,() =>{
    console.log('server is running');
});

module.exports = server;