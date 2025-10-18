let ioInstance = null;

function init(io){
  ioInstance = io;
}

function emit(channel, payload){
  if(ioInstance) ioInstance.emit(channel, payload);
}

module.exports = { init, emit };
