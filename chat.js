var mongoClient = require('mongodb').MongoClient

// Mongolab connection url
var mongolab_url = 'mongodb://keepworks:simplechat123@ds049150.mongolab.com:49150/simplechat';

module.exports = function(io){

  io.on('connection', function (socket) {
    var dbHandler,room,roomCollection;

    socket.on('join',function (data){

      if (typeof dbHandler === "undefined") {
        mongoClient.connect(mongolab_url, function(error, db) { // Attempting connection to the database

          if (error) {console.log(error); return;};

          roomCollection = db.collection(room);

          if (typeof roomCollection !== "undefined") {
            messagesQuery = roomCollection.find().limit(20); // query for the last 20 messages on a particular room/collection
            messagesQuery.toArray(function(err,results){
              if (err) return;
              socket.emit('buffer',results);
            });
          }

          dbHandler = db; // provide the handler to another variable accessor

        });
      }
      room = data.room;
      socket.join(room);

    console.log(socket.rooms);
      this.emit('joinmsg','[JOIN] You have joined #'+room); // Join Message on your tab
      this.to(room).emit('recieve',{username:data.username,message:"I'm a new joinee."}); // Join Message on other's tab
    });

    socket.on('send', function (data) { // If message recieved
      this.to(room).emit('recieve', data); // broadcast it to others as well

      if (typeof dbHandler !== "undefined"){
        roomCollection = dbHandler.collection(room); 
        roomCollection.insert([{"timestamp":new Date().getTime(),"username":data.username,"message":data.message}],function(err){ // store the message in database with a timestamp.
          if (err) { console.log(err); return;};
        });
      };

    });

    socket.on('disconnect',function(){
      if (!io.sockets.sockets.length) { // Check if all the rooms are closed
        if (typeof dbHandler !== "undefined") {
          dbHandler.close(); // Close database connection, we're running on mongolab dev mode anyway
        }
      }
    });
  });
};
