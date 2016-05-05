/*
 * This controller deals with the Socket connections
 * It's the "Socket Router"
 */
'use strict';

var RoundController = require('./roundController');

module.exports = function(io) {

  var socketController = this;
  var roundController = new RoundController(function onRoundFinish(data){
    socketController.broadcastMessage('receiveRound',data);
  });

  io.on('connection', function(socket){

    console.log(socket.request.user.twitter.username + ' entrou.');
    socket.on('disconnect', function(){
      console.log(socket.request.user.twitter.username + ' saiu.');
    });

    socket.on('requestRound', function(){
      socket.emit('receiveRound',roundController.getRound());
    });

    /* Writes user id to attribute,
     * so we can find he or she and send a message later */
    socket.user_id = socket.request.user._id;

  });

  // Send messages -------------------------------------------------------------
  this.broadcastMessage = function(theEvent, theMessage){
    io.sockets.emit(theEvent, theMessage);
  };

  /* Send a message via socket to the user */
  this.sendMessage = function(user_id, theEvent, theMessage){

    for (var socketId in io.sockets.sockets) {
      if(io.sockets.sockets[socketId].user_id.equals(user_id))
        io.to(socketId).emit( theEvent, theMessage);
    }

  };

  this.sendError = function(user_id, theMessage){
    socketManager.sendMessage(user_id, 'errorMessage', theMessage);
  };

  this.sendSuccess = function(user_id, theMessage){
    socketManager.sendMessage(user_id, 'successMessage', theMessage);
  };

}
