// const e = require('express');
var express = require('express');
const mysql = require('mysql');
var app = express();
var bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')

app.use(express.json());
const PORT = process.env.PORT || 8080;


const SmartyStreetsSDK = require('smartystreets-javascript-sdk');
const SmartyStreetsCore = SmartyStreetsSDK.core;
const Lookup = SmartyStreetsSDK.usStreet.Lookup;

let authID = process.env.SMARTY_AUTH_ID
let authToken = process.env.SMARTY_AUTH_TOKEN

let clientBuilder = new SmartyStreetsCore.ClientBuilder(new SmartyStreetsCore.StaticCredentials(authID,authToken))
let client = clientBuilder.buildUsStreetApiClient();


app.use(cors({
  origin: '*',
}))



// connection details for Google Cloud Platform MySQL server
var connection = mysql.createConnection({
    host: process.env.DB_IP,
    user: process.env.DB_USER,
    password: "",
    database: process.env.DB_DATABASE,
    multipleStatements: true
});

connection.connect(
    function(err) {
      if (err) {
        return console.error("error: " + err.message);
      }
  
      console.log("Connected to GCP MySQL database");

      connection.query("CREATE TABLE IF NOT EXISTS agreements(tenant_username VARCHAR(100), provider_username VARCHAR(100), street_address VARCHAR(100), city VARCHAR(100), state VARCHAR(100), start_date DATE, end_date DATE, tenant_signed INT, agreement_link VARCHAR(400),PRIMARY KEY(tenant_username,provider_username,start_date))",function(err,result){
        if (err) throw err;
      })

      connection.query("CREATE TABLE IF NOT EXISTS listing(provider_username VARCHAR(100),street_address VARCHAR(100),city VARCHAR(100),state VARCHAR(100),zipcode CHAR(5),building_type VARCHAR(100),purchase_type CHAR(4),price FLOAT, availability BOOL, rooms INT, description VARCHAR(1000), verified_status INT, deed_link VARCHAR(400) , PRIMARY KEY (street_address,city,state))", function(err, result){
          if(err) throw err;
        });

      connection.query("CREATE TABLE IF NOT EXISTS message(chatroomID INT, sender_username VARCHAR(100), message_content VARCHAR(200), datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)",function(err,results){
        if(err) throw err;
      });
      connection.query("CREATE TABLE IF NOT EXISTS chatroom(chatroomID INT AUTO_INCREMENT PRIMARY KEY, participant_one_username VARCHAR(100), participant_two_username VARCHAR(100))",function(err,results){
        if (err) throw err;
      });

      connection.query("CREATE TABLE IF NOT EXISTS reviews(username VARCHAR(100),street_address VARCHAR(100),city VARCHAR(100),state VARCHAR(100),review VARCHAR(200), rating INT, PRIMARY KEY(username,street_address,city,state))",function(err,result){
          if(err) throw err;
      });

      connection.query("CREATE TABLE IF NOT EXISTS account(username VARCHAR(100) PRIMARY KEY, password VARCHAR(1000), role VARCHAR(100), salt VARCHAR(1000), full_name VARCHAR(100), first_id_link VARCHAR(400), second_id_link VARCHAR(400), verified_status INT )",function(err,result){
        if(err) {throw err;}

      });
    }
);
  



app.get('/',function(req,res){
    res.send('Welcome to housing');
});


app.post('/signup',function(req,res){

  const uploadFolder = path.join(__dirname,"/ids")
  console.log(uploadFolder)
  const form = formidable({multiples:true})

  form.uploadFolder = uploadFolder;
  form.maxFileSize = 100 * 1024 * 1024;
  form.parse(req,(err,fields,files) => {
    const new_username = fields.username
    const new_password = fields.password
    const full_name = fields.full_name
    let new_role
    if( fields.role == "Tenant" ) {
      new_role = "tenant"
    }
    else{
      new_role="housing_provider"
    }

    if (new_role == "housing_provider"  && files.length == 0) {
      res.status(400).send({"message":"Error, Housing Providers must provide two forms of ID"})
    }

    else {

      let account_exists = false;
      // Check if a user already exists with the provided username
      var check_user_query = 'SELECT * FROM account WHERE username=?';

      connection.query(check_user_query,[new_username],function(err,result){
        if(err) throw err;
        /* Account already exists with the given username */
        if (result.length > 0) {
          res.status(409).send({"message": "Account already exists with given username"});
        }
        else{     

          if (new_role == "housing_provider") {
            
            /* Save the two IDs for the housing provider*/
            let file_type;
            let file = files.first_id

        
            let new_path = path.join(uploadFolder,"/" + new_username +"_ID1.png")
            const first_id_link = new_path
            let old_path = file.filepath;
        
            fs.writeFile(new_path,fs.readFileSync(old_path),function(err){
              if (err) console.log(err)
            })
        
            file = files.second_id
            new_path = path.join(uploadFolder,"/" + new_username +"_ID2.png")
            const second_id_link = new_path
            old_path = file.filepath;
        
            fs.writeFile(new_path,fs.readFileSync(old_path),function(err){
              if (err) console.log(err)
            })


            const verified_status = 0

            bcrypt.genSalt(10,(err,salt) => {

              bcrypt.hash(new_password,salt,function(err,hashed_password){
    
                if (err) throw err;
    
                var create_user_account = 'INSERT INTO account(username,password,role,salt,full_name,first_id_link,second_id_link,verified_status) VALUES (?,?,?,?,?,?,?,?)';
                connection.query(create_user_account,[new_username,hashed_password,new_role,salt,full_name,first_id_link,second_id_link,verified_status],function(err,result){
                  if(err) throw err;
                  res.status(200).send({"message":"Housing Provider account creation requested"}); 
                })
              });
    
            })


          }

          else{

            const verified_status = 1

            bcrypt.genSalt(10,(err,salt) => {

              bcrypt.hash(new_password,salt,function(err,hashed_password){
    
                if (err) throw err;
    
                var create_user_account = 'INSERT INTO account(username,password,role,salt,full_name,first_id_link,second_id_link,verified_status) VALUES (?,?,?,?,?,?,?,?)';
                connection.query(create_user_account,[new_username,hashed_password,new_role,salt,full_name,"null","null",verified_status],function(err,result){
                  if(err) throw err;
                  res.status(200).send({"message":"Tenant account created"}); 
                })
              });
    
            })


          }


  
        }
  
      });




    } });
})


app.post('/login',function(req,res){
  const login_username = req.query.username;
  const login_password = req.query.password;

  var password_query = "SELECT password,salt,role FROM account WHERE username=?";

  // var credential_check = "SELECT username,password FROM account WHERE username=? AND password=?";
  connection.query(password_query,[login_username],function(err,results){
    if (err) throw err;
  
    if (results.length == 0){
      res.status(409).send({"message": "Invalid username, no user exists with the given username"})
    }
    else{

      /* Create hash for the provided password*/
      bcrypt.hash(login_password,results[0].salt,function(err,hashed_login_password){
        if( hashed_login_password == results[0].password){
          res.status(200).send({"message":"Login successful","username":''+login_username,"role": results[0].role});
        }
        else{
          res.status(400).send({"message":"Login unsuccessful"});
        }
      })
    }
  });
});


app.get('/listings',function(req,res){

  console.log(req.query.zipcode)
  console.log(req.query.purchase_type)
  console.log(req.query.state)
  console.log(req.query.city)

  const zipcode = req.query.zipcode
  const state = req.query.state
  const city = req.query.city
  const purchase_type = req.query.purchase_type

  let first = 0;

  var search_query = "SELECT * FROM listing WHERE "
  
  if (zipcode) {
    if (first > 0) {
      search_query +="AND "
    }
    search_query += ("zipcode=" + zipcode+" ")
    first++;
  }

  if (state) {
    if(first > 0) {
      search_query +="AND "
    }
    search_query += ("state=" + state+ " ")
    first++;
  }

  if (city) {
    if(first > 0) {
      search_query +="AND "
    }
    search_query += ("city=" + city + " ")
    first++;
  }

  if (purchase_type) {
    if(first > 0) {
      search_query += "AND "
    }
    search_query += ("purchase_type=" + purchase_type+ " ")
    first++;
  }

  if (first == 0){
    search_query = "SELECT * FROM listing WHERE verified_status=1"
  }

  else{
    search_query += "AND verified_status=1"
  }


  connection.query(search_query,function(err,result) {
    if (err) throw err
    res.status(200).send(result)
  })

  // const search_zipcode = req.body.zipcode;

  // var listing_query = 'SELECT * FROM listing WHERE zipcode=?';
  // const search_listing_query = connection.query(listing_query,[search_zipcode],function(err,result){
  //   if (err) throw err;
  //   if (result.length == 0) {
  //     res.status(200).send({"message": "There are no listings for your area"});
  //   }
  //   else{
  //     res.status(200).send(result);
  //   }
  // });
});

/* NEED TO TEST */
app.post('/listings',function(req,res){
  // const provider_username = req.body.provider_username;
  // const street_address = req.body.street_address;
  // const city = req.body.city;
  // const state = req.body.state;
  // const zipcode = req.body.zipcode;
  // const building_type = req.body.building_type;
  // const purchase_type = req.body.purchase_type;
  // const price = req.body.price;
  // const availability = req.body.availability;
  // const transportation = req.body.transportation;
  // const rooms = req.body.rooms;

  const uploadFolder = path.join(__dirname,"/user_files")
  console.log(uploadFolder)
  const form = formidable({multiples:true})

  form.uploadFolder = uploadFolder;
  form.maxFileSize = 100 * 1024 * 1024;
  form.parse(req,(err,fields,files) => {
    const provider_username = fields.provider_username
    const street_address = fields.street_address
    const city = fields.city
    const state = fields.state
    const zipcode = fields.zipcode
    const building_type = fields.building_type
    const purchase_type = fields.purchase_type
    const price = fields.price
    const availability = fields.availability
    const description = fields.description
    

    // Check if the user trying to place a listing is a housing_provider, only housing_providers can place reviews
    var check_user_role = "SELECT * FROM account WHERE username=? AND role=?";
    connection.query(check_user_role,[provider_username,"housing-provider"],function(err,result){
      if (err) throw err;

      // User is not a housing_provider
      if (result.length == 0){
        res.status(400).send({"message":"Listing not posted, only housing providers can post listings"});
        return;
      }

      // User is a housing provider
      else{
        // Check if there exists a listing with these details, if it does than another housing_provider owns that listing
        var check_listing = 'SELECT * FROM listing where street_address=? AND city=? AND state=?';
        connection.query(check_listing,[street_address,city,state],function(err,result){
          if (err) throw err;

          // Another housing provider owns this listing, return status 409
          if (result.length != 0) {
            res.status(409).send({"message": "Listing already exists, another housing provider owns this listing"});
            return;
          }

          // No other listings exist matching the given details, create new listing

          /* Call Smarty Address Verification API and make sure that the address exists and that it is of type residential*/
          // "https://www.smarty.com/products/apis/us-street-api?key=21102174564513388&candidates=10&street=5%20Ronald%20Drive&city=Colonia&state=NJ&zipcode=07067&match=enhanced&license=us-rooftop-geocoding-cloud&method=get"
          let lookup = new Lookup();
          lookup.street = street_address;
          lookup.city = city;
          lookup.state = state;
          lookup.zipcode = zipcode;
          lookup.maxCandidates = 10;
        
          client.send(lookup)
            .then((response) => {
              
              let lookups = response.lookups;
        
              /* Address does not exist or could not be verified*/
              if (lookups[0].result.length === 0){
                res.status(400).send({"message":"Address could not be verified using Smarty API"});
              }
        
              /* Address exists*/
              else {
        

                /* Get the lat and lon of the property for the Walk Score API*/
                let lon = lookups[0].result[0].metadata.longitude
                let lat = lookups[0].result[0].metadata.latitude
                
                if (lookups[0].result[0].metadata.rdi == "Residential"){
                  
                  let file_type;
                  const file = files.deed_or_title
                  if(file.originalFilename.includes(".png")){
                    file_type = ".png"
                  }
                  else if(file.originalFilename.includes(".pdf")){
                    file_type = ".pdf"
                  }
              
                  const new_path = path.join(uploadFolder,"/" + fields.provider_username + fields.street + file_type)
                  const old_path = file.filepath;
              
                  fs.writeFile(new_path,fs.readFileSync(old_path),function(err){
                    if (err) console.log(err)
                  })


                  const verified_status = 0;
                  

                  /* Create listing and add it to the database*/
                  /* Listing is unverified until, a employee is able to verify that the deed matches */
                  var place_listing = 'INSERT INTO listing(provider_username,street_address,city,state,zipcode,building_type,purchase_type,price,availability,rooms,description,verified_status,deed_link) values(?,?,?,?,?,?,?,?,?,?,?,?,?)';
                  connection.query(place_listing, [provider_username,street_address,city,state,zipcode,building_type,purchase_type,price,availability,rooms,description,verified_status,new_path], function(err,result){
                    if (err) throw err;
                      res.status(200).send(req.body);
                    });

                }
        
                else{
                  res.status(400).send({"message":"{Address was verified using Smarty API, Address was not of type Residential}"});
                }
              }
            })
            .catch((response) => {
              res.status(400).send({"message":"{Error with Smarty API, could not verify address. Please try again at a later time}"});
            })
        });
      }
    });

  })

  return res.status(200)
});




app.post('/listings/post-review',function(req,res){
  const street_address = req.body.street_address;
  const city = req.body.city;
  const state = req.body.state;
  const review = req.body.review;
  const tenant_username = req.body.username;
  const rating = req.body.rating

  // Check if the listing exists
  var listing_exists = "SELECT * FROM listing WHERE street_address=? AND city=? AND state=?";
  connection.query(listing_exists,[street_address,city,state],function(err,result){
    if (err) throw err;

    // Listing does not exist, return status 400
    if (result.length == 0){
      res.status(400).send({"message": "Listing does not exist"});
      return;
    }

    // Check if user trying to place review is a tenant, only tenant's are allowed to place reviews
    var check_user_role = "SELECT * FROM account WHERE username=? AND role=?";
    connection.query(check_user_role,[tenant_username,"tenant"],function(err,result){
      if (err) throw err;

      // User is a tenant 
      if(result.length!=0){
        // Check if user already has left a review. If they have not then place the review
        var check_user_review = "SELECT * FROM agreements WHERE tenant_username=? AND street_address=? AND city=? AND state=?";
        connection.query(check_user_review,[street_address,city,state,tenant_username],function(err,result){
          if (err) throw err;
    
          // User already left a review for this building, return status 409
          if (result.length == 0){
            res.status(400).send({"message": "Tenant does not have an agreement at this location"});
            return;
          }
          
          else{
            var place_review =  "INSERT INTO reviews(username,street_address,city,state,review,rating) values(?,?,?,?,?,?); SELECT * FROM reviews WHERE street_address=? AND city=? AND state=?";
            connection.query(place_review,[tenant_username,street_address,city,state,review,rating,street_address,city,state,tenant_username],function(err,result){
              if (err) throw err;
              if (result.length!=0){
                res.status(200).send(result[1]);
              }
            });
        }
        });       
      }

      // User is not a tenant
      else{
        res.status(400).send({"message":"Review could not be placed, only tenant's can place reviews"});
      }

    });
  });
});



app.get('/listings/get-reviews', function(req,res){
    const street_address = req.body.street_address;
    const city = req.body.city;
    const state = req.body.state;


    /* Check if the listing still exists*/
    var listing_exists = "SELECT * FROM listing WHERE street_address=? AND city=? AND state=?";
    connection.query(listing_exists,[street_address,city,state],function(err,result){
      if (err) throw err;

      // Listing does not exist, return status 400
      if (result.length == 0){
        res.status(400).send({"message": "Listing does not exist"});
        return;
      }

      // Return all the reviews for the listing
      var get_reviews = "SELECT * FROM reviews WHERE street_address=? AND city=? AND state=?";
      connection.query(get_reviews,[street_address,city,state],function(err,result){
        if (err) throw err;
        if (result.length!=0){
          res.status(200).send(result);
        }
      });
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
      res.status(400).send({"message": "One or more users does not exist."});
      return;
    }
    else{

      // Check if there exists a chat room containing both users, if it does return status 409
      var check_chatroom_exists = "SELECT * FROM chatroom WHERE (participant_one_username=? AND participant_two_username=?) OR (participant_one_username=? AND participant_two_username=?)";
      connection.query(check_chatroom_exists,[participant_one_username,participant_two_username,participant_two_username,participant_one_username],function(err,result){
        if (err) throw err;
        if (result.length != 0){
            res.status(409).send({"message": "Chatroom could not be created because a chatroom exists between both users"});
            return;
        }
        else{

          // Create the chatroom between both users
          var create_chatroom = "INSERT INTO chatroom(participant_one_username,participant_two_username) values(?,?)";
          connection.query(create_chatroom,[participant_one_username,participant_two_username],function(err,result){
            if (err) throw err;
            res.status(200).send({"message": "Chatroom successfully created"});
          });
        }
      });
    }
  });
});



app.post('/message/send',function(req,res){
  const sender_username = req.body.sender_username;
  const receiver_username = req.body.receiver_username;
  const message_content = req.body.message_content;

  var check_users_exist = "SELECT * FROM account WHERE username=?;SELECT * FROM account WHERE username=?";
  connection.query(check_users_exist,[sender_username,receiver_username],function(err,result){
    if (err) throw err;
    if (result.length != 2 || (result[0].length == 0  || result[1].length == 0) ){
      res.status(400).send({"message": "One or more users does not exist."});
      return;
    }
    var check_chatroom_exists = "SELECT chatroomID FROM chatroom WHERE (participant_one_username=? AND participant_two_username=?) OR (participant_one_username=? AND participant_two_username=?)";
    connection.query(check_chatroom_exists,[sender_username,receiver_username,receiver_username,sender_username],function(err,result){
      if(err) throw err;
      // A chatroom exists between the two users, post the given message
      if (result.length != 0){
        var post_message = "INSERT INTO message(chatroomID,sender_username,message_content) values(?,?,?)";
        connection.query(post_message,[result[0].chatroomID,sender_username,message_content],function(err,result){
          if (err) throw err;
          res.status(200).send({"message": "Message sent successfully"});
        })
      }
    });
  });  
});



app.get('/message/open-chat',function(req,res){
  const participant_one_username = req.body.username_one;
  const participant_two_username = req.body.username_two;
  // Check if users exist
  var check_users_exist = "SELECT * FROM account WHERE username=?;SELECT * FROM account WHERE username=?";
  connection.query(check_users_exist,[participant_one_username,participant_two_username],function(err,result){
    if (err) throw err;
    if (result.length != 2 || (result[0].length == 0  || result[1].length == 0) ){
      res.status(400).send({"message": "One or more users does not exist."});
      return;
    }
    
    else{

      var check_chatroom_exists = "SELECT chatroomID FROM chatroom WHERE (participant_one_username=? AND participant_two_username=?) OR (participant_one_username=? AND participant_two_username=?)";
      connection.query(check_chatroom_exists,[participant_one_username,participant_two_username,participant_two_username,participant_one_username],function(err,result){
        if (err) throw err;
        // A chatroom exists between the two users, get the messaages
        if (result.length != 0){
          var get_messages = "SELECT sender_username,message_content FROM message WHERE chatroomID=? ORDER BY datetime ASC";
          connection.query(get_messages,result[0].chatroomID,function(err,result){
            console.log(result);
            res.status(200).send(result);
          });
        }
        // Chatroom does not exist between users, send status 400.
        else{
          res.status(400).send({"message": "No chat exists between users"});
        }
      });

    }
  });
});


app.get('/verify/housing-providers',function(req,res) {
  connection.query("SELECT * FROM account WHERE verified_status=0", function(err,result) {
    res.status(200).send(result)
  })
})


app.post('/verify/housing-providers',function(req,res) {
  console.log("got it")
  connection.query("UPDATE account SET verified_status=? WHERE username=?",[req.query.verified_status,req.query.username],function(err,result) {
    if (err) throw err
    if (result.affectedRows > 0) {
      if (req.query.verified_status == 1) {
        res.status(200).send({"message":"Account status updated, successfully accepted"})
      }
      else{
        res.status(200).send({"message":"Account status updated, sucessfully rejected"})
      }
    }

  })
})



app.get('/verify/listings',function (req,res) {
  console.log("hit")
  var get_unverified = "SELECT * FROM listing WHERE verified_status=0";
  connection.query(get_unverified,function(err,result) {
    res.status(200).send(result)
  })

})



app.post('/verify/listings',function(req,res) {

  const street = req.body.street;
  const city = req.body.city
  const state = req.body.state

  var update_verified = "UPDATE listing SET verified_status=1 WHERE street_address=? AND city=? AND state=?"
  connection.query(update_verified, [street,city,state], function(err,result){
    if (err) throw err
    if (result.affectedRows > 0) {
      res.status(200).send({"message":"Listing status sucessfully updated"})
    }
  })
})


app.post('/agreement/create',function(req,res) {
  
  const uploadFolder = path.join(__dirname,"/agreements")
  const form = formidable({multiples:true})

  form.uploadFolder = uploadFolder;
  form.maxFileSize = 100 * 1024 * 1024;
  form.parse(req,(err,fields,files) => {
    const tenant_username = fields.tenant_username
    const provider_username = fields.provider_username
    const street = fields.street
    const city = fields.city
    const state = fields.state
    const start_date = fields.start_date
    const end_date = fields.end_date
    
    let file_type;
    const file = files.agreement
    if(file.originalFilename.includes(".png")){
      file_type = ".png"
    }
    else if(file.originalFilename.includes(".pdf")){
      file_type = ".pdf"
    }

    const new_path = path.join(uploadFolder,"/" + provider_username +"_"+ tenant_username + file_type)
    const old_path = file.filepath;

    fs.writeFile(new_path,fs.readFileSync(old_path),function(err){
      if (err) console.log(err)
    })

    var create_agreement = "INSERT INTO agreements(tenant_username,provider_username,street,city,state,start_date,end_date,tenant_signed,agreement_link) VALUES (?,?,?,?,?,?,?,?,?)"
    connection.query(create_agreement,[tenant_username,provider_username,street,city,state,start_date,end_date,0,new_path],function(err,result) {
      if (err) throw err
      res.status(200).send({"message":"Agreement created, tenant still needs to sign"})
    })
  })
})

app.post('/agreement/sign',function(req,res) {
  const tenant_username = req.body.username
  const street = req.body.street
  const city = req.body.city
  const state = req.body.state

  connection.query("SELECT * FROM agreements WHERE tenant_username=? AND street_address=? AND city=? AND state=?",[tenant_username,street,city,state],function(err,result) {
    if (err) throw err
    if (results.length == 0) {
      res.status(400).send({"message":"No agreement exists with the provided credentials"})
    }

    else{
      connection.query("UPDATE agreements SET tenant_signed=1 WHERE tenant_username=? AND street_address=? AND city=? AND state=?",[tenant_username,street,city,state], function(err,result) {
        if (err) throw err
        if (results.length > 0) {
          res.status(200).send({"message":"Agreement successfully signed"})
        }
      })
    }
  })
})


app.get('/agreements',function(req,res) {
  const tenant_username = req.body.username

  connection.query("SELECT * FROM agreements WHERE tenant_username=?",[tenant_username],function(err,result){
    if (err) throw err
    res.status(200).send(result);
  })
})






// Start the application server 
var server = app.listen(PORT,() =>{
    console.log('Server has started, listenting at PORT: ' + PORT);
});



module.exports = server;


