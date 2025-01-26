const socket = io();
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const penButton = document.getElementById('pen');
const eraserButton = document.getElementById('eraser');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Drawing state
let isDrawing = false;
let currentTool = 'pen';
const penSize = 2;
const eraserSize = 20;

// Tool selection
penButton.addEventListener('click', () => {
    currentTool = 'pen';
    penButton.classList.add('active');
    eraserButton.classList.remove('active');
});

eraserButton.addEventListener('click', () => {
    currentTool = 'eraser';
    eraserButton.classList.add('active');
    penButton.classList.remove('active');
});

// Mouse event handlers
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'pen') {
        ctx.lineWidth = penSize;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
        
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);

        // Emit drawing data
        socket.emit('draw', { x, y, tool: 'pen' });
    } else {
        // Eraser
        const radius = eraserSize;
        ctx.clearRect(x - radius, y - radius, radius * 2, radius * 2);
        
        // Emit eraser data
        socket.emit('erase', { x, y, radius });
    }
}

// Socket.io event handlers
socket.on('draw', (data) => {
    if (data.tool === 'pen') {
        ctx.lineWidth = penSize;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
        
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
    }
});

socket.on('clear-area', (data) => {
    ctx.clearRect(
        data.x - data.radius,
        data.y - data.radius,
        data.radius * 2,
        data.radius * 2
    );
});

socket.on('drawing-history', (history) => {
    history.forEach(point => {
        if (point.tool === 'pen') {
            ctx.lineWidth = penSize;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000';
            
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
        }
    });
}); 