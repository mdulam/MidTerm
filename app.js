const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Event = require("./models/events.js");
const fetch = require('node-fetch');
const eventRoutes = require("./routes/eventController.js");

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require ('swagger-ui-express');

const swaggerOptions ={
swaggerDefinition: {
  info: {
    title: 'Events api',
    description: 'implementation of swagger for Events api',
    contact: {
      name:' sai meghana dulam'
    },
    servers:["http://159.65.32.112:3000"]
  }
},
apis: ["app.js"]
}

const swaggerDocs= swaggerJsDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/assets',express.static('assets'));
app.set('view engine','ejs');

mongoose.connect(
  "mongodb+srv://meghanadulam:Meghana*50@siproject-34kp9.mongodb.net/test?retryWrites=true&w=majority",
    {
       useNewUrlParser: true,useUnifiedTopology:true
    }
);
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

/**
* @swagger
* /api/v1/events:
*   get:
*     description: request all events
*     responses:
*       '200':
*         description: OK
*/
app.get("/api/v1/events", (req, res, next) => {
  Event.find()
  .exec()
  .then(docs => {
    res.status(200).json({
      events: docs.map(doc => {
        return {
          _id: doc._id,
          eventTitle: doc.eventTitle,
          eventDate: doc.eventDate,
          eventDescription: doc.eventDescription,
          request: {
            type: "GET",
            url: "http://159.65.32.112:3000/api/v1/events/" + doc._id
          }
        };
      })
    });
  }).catch(errMsg => {
    res.status(500).json({
      error: errMsg
    });
  });
});

/**
* @swagger
* /api/v1/events/{eventID}:
*   get:
*    description: request an particular event details
*    parameters:
 *       - name: eventID
 *         in: path
 *         type: string
 *         required: true
*    responses:
*       '200':
*         description: OK
*/
app.get("/api/v1/events/:eventID", (req, res, next) => {
Event.findById(req.params.eventID)
.exec()
.then(event => {
  if (!event) {
    return res.status(404).json({
      message: "Event not found"
    });
  }
  res.status(200).json({
    event: event,
    request: {
      type: "GET",
      url: "http://159.65.32.112:3000/api/v1/events"
    }
  });
})
.catch(errMsg => {
  res.status(500).json({
    error: errMsg
  });
});
});

/**
* @swagger
* /api/v1/events:
*   post:
*     description: add an event
*     parameters:
 *       - name: eventTitle
 *         in: formData
 *         type: string
 *         required: true
 *       - name: eventDate
 *         in: formData
 *         type: string
 *         required: true   
 *       - name: eventDescription
 *         in: formData
 *         type: string
 *         required: true
*     responses:
*       '200':
*         description: OK
*/
app.post("/api/v1/events", (req, res, next) => {
    const event = new Event({
      eventTitle: req.body.eventTitle,
      eventDate: req.body.eventDate,
      eventDescription: req.body.eventDescription
    });
  event.save().then(result => {
    res.status(201).json({
      message: "Event Added",
      createdEvent: {
        _id: result.eventID,
        eventTitle: result.eventTitle,
        eventDate: result.eventDate,
        eventDescription: result.eventDescription
      }
    })
}).catch(errMsg => {
res.status(500).json({
  error: errMsg
});
});
});

/**
* @swagger
* /api/v1/events/{eventID}:
*   put:
*    description: update an particular event details with all fields
*    parameters:
 *     - name: eventTitle
 *       in: formData
 *       type: string
 *       required: true
 *     - name: eventDate
 *       in: formData
 *       type: string
 *       required: true   
 *     - name: eventDescription
 *       in: formData
 *       type: string
 *       required: true
 *     - name: eventID
 *       in: path
 *       type: string
 *       required: true
*    responses:
*       '200':
*         description: OK
*/
app.put("/api/v1/events/:eventID", (req, res, next) => {
const eventID = req.params.eventID;
Event.updateMany({_id: eventID},{$set:{eventTitle:req.body.eventTitle, eventDate:req.body.eventDate, eventDescription: req.body.eventDescription}})
  .exec()
  .then(result => {
    res.status(200).json({
        message: 'Event updated',
        request: {
            type: 'GET',
            url: 'http://159.65.32.112:3000/api/v1/events/' + eventID
        }
    });
  }).catch(errMsg => {
    res.status(500).json({
      error: errMsg
    });
  });
});

/**
* @swagger
* /api/v1/events/{eventID}:
*   patch:
*    description: update an particular event details with all fields
*    parameters:
 *     - name: eventDate
 *       in: formData
 *       type: string
 *       required: true   
 *     - name: eventID
 *       in: path
 *       type: string
 *       required: true
*    responses:
*       '200':
*         description: OK
*/
app.patch("/api/v1/events/:eventID", (req, res, next) => {
const eventID = req.params.eventID;
Event.updateOne({_id: eventID},{$set:{eventDate:req.body.eventDate}})
  .exec()
  .then(result => {
    res.status(200).json({
        message: 'Event updated',
        request: {
            type: 'GET',
            url: 'http://159.65.32.112:3000/api/v1/events/' + eventID
        }
    });
  }).catch(errMsg => {
    res.status(500).json({
      error: errMsg
    });
  });
});

/**
* @swagger
* /api/v1/events/{eventID}:
*   delete:
*    description: removes an particular event
*    parameters:
 *       - name: eventID
 *         in: path
 *         type: string
 *         required: true
*    responses:
*       '200':
*         description: OK
*/
app.delete("/api/v1/events/:eventID", (req, res, next) => {
  Event.remove({ _id: req.params.eventID })
  .exec()
  .then(result => {
    res.status(200).json({
      message: "Event deleted",
      request: {
        type: "GET",
        url: "http://159.65.32.112:3000/api/v1/events"
      }
    });
  }).catch(errMsg => {
    res.status(500).json({
      error: errMsg
    });
  });
});




app.get('/event',function(req,res){
  fetch('http://159.65.32.112:3000/api/v1/events').then(res => res.json()).then(json => {
      res.render('events',{eventsData: json.events});
  })

});

app.get('/addEvent',function(req,res){
  res.render('newEvent');
});


app.post('/addEvent', function(req, res){
  console.log(req.body);
  var body= {
      'eventTitle':req.body.title,
      'eventDate':req.body.date,
      'eventDescription':req.body.description
  };
  fetch('http://159.65.32.112:3000/api/v1/events/', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json()).then(json => {
      res.redirect('/event');
  })
});

app.post('/updateEvent', function(req, res){
  var body= {
    'eventTitle':req.body.title,
    'eventDate':req.body.date,
    'eventDescription':req.body.description
};

fetch('http://159.65.32.112:3000/api/v1/events/'+req.body.eventId, {
  method: 'PUT',
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' }
}).then(res => res.json()).then(json => {
  res.redirect('/event');
})

});



app.get('/',function(req,res){

  res.render('home');
});


app.listen(3000);
