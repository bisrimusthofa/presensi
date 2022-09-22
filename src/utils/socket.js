const helper = require('./helper');

class Socket{

    constructor(socket){
        this.io = socket;
    }

    socketEvents(){
        this.io.on('connection', (socket) => {

            socket.on('addIzin', async (dataizin)=>{
                const admin = await helper.getAdmin();
            
                admin.forEach((data, i) => {
                    if(data.socketId){
                        this.io.to(data.socketId).emit('notifIzin', dataizin);
                    }
                });
            });

            socket.on('addCuti', async (dataizin)=>{
                const admin = await helper.getAdmin();
            
                admin.forEach((data, i) => {
                    if(data.socketId){
                        this.io.to(data.socketId).emit('notifCuti', dataizin);
                    }
                });
            });

            socket.on('addPresensi', async (dataPresensi)=>{
                const admin = await helper.getAdmin();
                console.log('presensiIII')
                admin.forEach((data, i) => {
                    if(data.socketId){
                        this.io.to(data.socketId).emit('notifPresensi', dataPresensi);
                    }
                });
            });

        });
    }

    socketConfig(){
        this.io.use( async (socket, next) => {
            let userId = socket.request._query['id'];
            let userSocketId = socket.id;
            const response = await helper.setUser(userId, userSocketId);
            if(response[0] !== 0){
                next();
            }else{
                console.error(`Socket connection failed, for  user Id ${userId}.`);
            }
        });
        this.socketEvents();
    }
}
module.exports = Socket;