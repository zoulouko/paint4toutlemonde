const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

// Store drawing data
let drawingHistory = [];

io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Send existing drawing history to new users
    socket.emit('drawing-history', drawingHistory);

    // Handle drawing events
    socket.on('draw', (data) => {
        drawingHistory.push(data);
        socket.broadcast.emit('draw', data);
    });

    // Handle eraser events
    socket.on('erase', (data) => {
        drawingHistory = drawingHistory.filter(point => 
            !(point.x >= data.x - data.radius && 
              point.x <= data.x + data.radius && 
              point.y >= data.y - data.radius && 
              point.y <= data.y + data.radius)
        );
        io.emit('clear-area', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 