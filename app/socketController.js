/*
 * This controller deals with the Socket connections
 * It's the "Socket Router"
 */
'use strict';


module.exports = function(io) {

  io.on('connection', function(socket){

    console.log(socket.request.user.twitter.username + ' entrou.');
    socket.user_id = socket.request.user._id;

    socket.on('disconnect', function(){
      console.log(socket.request.user.username + ' saiu.');
    });

    /* Writes user id to attribute,
     * so we can find he or she and send a message later */
    socket.user_id = socket.request.user._id;

  });

}
