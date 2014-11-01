var roomView = Backbone.View.extend({
  // Setting view scope
  el: ".room-view",
  
  events: {
    // User types the message and submits the message
    "submit #message_form" : function (e){
      e.preventDefault();
      var lastMessage =  this.$el.find(".yourmessage").val();
      app.socketEmitter('send', {username: app.chatInfo.username, message:lastMessage });
      this.$el.find(".yourmessage").val("");
      this.appendMessage('Me: '+ lastMessage);
    },
  // User submits his/her nickname and channelname to enter
    "submit #user_form" : function(e){
      e.preventDefault();
      app.chatInfo = new chatData({
        username:$("#username").val(),
        room:$("#room").val()
      });
    
      this.joinRoom();
    },
  },

  joinRoom: function(){
    // Hide the Entry Form
    this.$el.find(".intro-block").hide();
    this.$el.find(".hidden").removeClass("hidden");
    // Set the room name
    this.$el.find("#channel").text('#'+app.chatInfo.room);
    // On join, display the joining message
    this.listenTo(app.socket,'joinmsg',function(data){
      app.chatRoom.appendMessage(data);
    });
    // Load the buffer/chat history
    this.listenTo(app.socket,'buffer',function(results){
      app.chatRoom.appendMessage('--Chat buffer started--');
      // Iterate through, maximum 20 msgs
      results.forEach(function(data){
        app.chatRoom.appendMessage(data.username+': '+data.message);
      });
      
      app.chatRoom.appendMessage('--Chat buffer completed--');
    });
    // If any new message is recieved, add it to the message box
    this.listenTo(app.socket,'recieve',function(lastMessage){
      app.chatInfo.set({'lastMessage':lastMessage});
      app.chatInfo.on("change:lastMessage",app.chatRoom.appendMessage(lastMessage.username + ': '+ lastMessage.message));
    });
  },
  // Adding messages literally here 
  appendMessage: function(lastMessage){
    var messagesElem = this.$el.find(".messages");
    messagesElem.append('<div class="message">'+lastMessage+'</div>');
    // Ensure the last message is visible
    if (messagesElem.height() < messagesElem[0].scrollHeight){ messagesElem.scrollTop(messagesElem[0].scrollHeight) };
  }

});

var chatData = Backbone.Model.extend({
  defaults:{
    username:'',
    room:'',
    lastMessage:'',
  },

  initialize:function(data){
  
    this.username = data.username;
    this.room = data.room;
    // Let the server know the chatroom has been created
    app.socketEmitter('join',{username:data.username,room:data.room});
  }
});

var app = {
  // URL which the socket has to connect to
  socket : io.connect('http://simplechatt.herokuapp.com'),
  socketEmitter: function(method,data){
    this.socket.emit(method,data);
  },
  // Attach the view with its scope
  chatRoom: new roomView()

};


