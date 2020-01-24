
//Configure create variables written in .env file to the environment
require('dotenv').config();
//imports Express 
const express = require('express');
//Enable middleware functions
const morgan = require('morgan');
//Enable Cross Origin Resource Sharing, simplifies the config of CORS in Express
const cors = require('cors');
//does the security hiding for us
const helmet = require('helmet');
//imports environment from config settings
const { NODE_ENV } = require('./config');

const app = express();

// Depends on the condition of the environment
// Morgan - tiny format for production environment
// Morgan - common format for development environment
const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

// Mounting our middleware, always put helmet before cors!
app.use(morgan(morganOption)); 
app.use(helmet());
app.use(cors());

const uuid = require('uuid/v4');
// app.use(express.json());


app.use((error, req, res, next) => {
  let response;
  if(NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }

  res.status(500).json(response);
});

//validation middleware
function validateBearToken(req,res, next) {
  const apiToken = process.env.SECRET_API_KEY
  const authToken = req.get('Authorization')
  if(!authToken || authToken.split(' ')[1] !== apiToken){
    return res 
      .status(401).json({ error: 'Unauthorized request '})
  }
  next();
}


//this is the address array of objects containing all addresses 
address = [
  {
    id: 1,
    firstName: "String",
    lastName: "String",
    address1: "String",
    address2: "String",
    city: "String",
    state: "String",
    zip: 78945
  },
  {
    id: 2,
    firstName: "String2",
    lastName: "String2",
    address1: "String2",
    address2: "String2",
    city: "String2",
    state: "String2",
    zip: 99854
  },{
    id: 3,
    firstName: "String2",
    lastName: "String2",
    address1: "String2",
    address2: "String2",
    city: "String2",
    state: "String2",
    zip: 12345
  },
]



//this is a get request for all address objects in the address array
 app.get('/address', (req, res) => {
  res.json(address);
})


 app.post('/address', [express.json(), validateBearToken], (req, res) => {
  
  //deconstructing all keys from req.body objects in address array
  const { firstName,lastName, address1 , address2, city, state, zip } = req.body;
 
  if(!firstName){
    return res
    .status(400)
    .send("First name required");
  }
  if(!lastName){
    return res
    .status(400)
    .send("Last name required");
  }
  if(!address1){
    return res
    .status(400)
    .send("Address required");
  }
  if(!city){
    return res
    .status(400)
    .send("City required");
  }
  if(!state){
    return res
    .status(400)
    .send("State required");
  }
  if(state.length !== 2){
    return res
    .status(400)
    .send("State must be 2 Characters");
  }
  if(!zip){
    return res
    .status(400)
    .send("ZIP Code required");
  }
  if(zip.toString().length !== 5){
    return res
    .status(400)
    .send("ZIP needs to be 5 digits");
  }
  if(isNaN(zip)){
    return res
      .status(400)
      .send('ZIP code can only be numerical')
  }
  

  //newAddress(generated uuid + req.body(all submitted form data))
  const id = uuid();
  const newAddress = {
    id,
    ...req.body
  }

  //this is pushing the newAddress(uuid + req.body(all submitted form data)) into the array of addresses!(address)
  address.push(newAddress);

  //Here, we are sending the new address object in the body.
  //The client would be able to directly use the details of the address that was created.
  res
    .status(201)
    .location(`http://localhost:8000/address/${id}`)
    .json(newAddress);
});


app.delete('/address/:addressId', validateBearToken, (req, res) => {
  const { addressId } = req.params;

  //find the index of the address in the array
  const index= address.findIndex(u => u.id === addressId);
  
  //make sure we actually find an address with that id
  if(index === -1) {
    return res
      .status(404)
      .send('Address not found');
  }
  //remove that address with splice (not slice!)
  address.splice(index, 1)

  //we don't need a response body, just a status to say all is well
  //204 no content is acceptable feedback
  res
    .status(204)
    .end();
});


module.exports = app;