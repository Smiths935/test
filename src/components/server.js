const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const cors = require('cors'); // Importer le module cors
const app = express();

const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 5000;

// Configurer CORS pour permettre les requêtes depuis http://localhost:9000
app.use(cors({
    origin: 'http://localhost:9000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

io.on('connection', socket => {
    socket.on('join-room', ({ roomId, userName }) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-joined', { userId: socket.id, userName });

        socket.on('sending-signal', payload => {
            io.to(payload.userIdToSignal).emit('user-joined', { signal: payload.signal, callerId: payload.callerId });
        });

        socket.on('returning-signal', payload => {
            io.to(payload.callerId).emit('receiving-returned-signal', { signal: payload.signal, id: socket.id });
        });

        socket.on('send-message', ({ roomId, message }) => {
            io.to(roomId).emit('receive-message', message);
        });

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-left', socket.id);
        });

        socket.on('start-recording', () => {
            const filePath = `./recordings/${roomId}.webm`;
            const fileStream = fs.createWriteStream(filePath, { flags: 'a' });
            socket.on('recording-data', data => {
                fileStream.write(data);
            });

            socket.on('stop-recording', () => {
                fileStream.end();
                socket.emit('recording-stopped', { filePath });
            });
        });
    });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
