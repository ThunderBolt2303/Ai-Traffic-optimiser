import AppState from './state.js';

// Initialize canvases
export function initCanvases() {
    for (let i = 0; i < 4; i++) {
        const canvas = document.getElementById(`camera${i + 1}`);
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 225;
        AppState.lanes[i].canvas = canvas;
        AppState.lanes[i].ctx = ctx;
    }
}

// Draw traffic scene
export function drawTrafficScene(lane, index) {
    const ctx = lane.ctx;
    const canvas = lane.canvas;
    
    // Clear canvas
    ctx.fillStyle = '#1a1f3a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw road
    ctx.fillStyle = '#2a2f4a';
    ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.3);
    
    // Draw lane markings
    ctx.strokeStyle = '#ffbe0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.55);
    ctx.lineTo(canvas.width, canvas.height * 0.55);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw vehicles
    const vehicleWidth = 30;
    const vehicleHeight = 20;
    const spacing = 40;
    
    for (let i = 0; i < lane.vehicles; i++) {
        const x = 50 + (i * spacing);
        const y = canvas.height * 0.5 - vehicleHeight / 2;
        
        // Vehicle body
        ctx.fillStyle = `hsl(${(i * 30) % 360}, 70%, 60%)`;
        ctx.fillRect(x, y, vehicleWidth, vehicleHeight);
        
        // Vehicle windows
        ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.fillRect(x + 5, y + 3, vehicleWidth - 10, vehicleHeight - 6);
        
        // Headlights
        ctx.fillStyle = '#ffbe0b';
        ctx.fillRect(x + vehicleWidth - 3, y + 2, 2, 5);
        ctx.fillRect(x + vehicleWidth - 3, y + vehicleHeight - 7, 2, 5);
    }
    
    // Draw traffic density indicator
    const density = lane.vehicles / 8;
    const barWidth = canvas.width * 0.15;
    const barHeight = 10;
    const barX = canvas.width - barWidth - 10;
    const barY = 10;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    let barColor;
    if (density < 0.3) barColor = '#00ff9d';
    else if (density < 0.7) barColor = '#ffbe0b';
    else barColor = '#ff006e';
    
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, barWidth * density, barHeight);
}

// Update vehicle counts randomly
export function updateTrafficDensity() {
    // Reset vehicle types
    AppState.vehicleTypes = { cars: 0, buses: 0, bikes: 0, trucks: 0, emergency: 0, pedestrians: 0 };
    
    AppState.lanes.forEach((lane, index) => {
        // Simulate traffic flow with weather impact
        const weatherImpact = AppState.currentWeather.factor;
        const change = Math.floor((Math.random() * 3 - 1) * weatherImpact);
        lane.vehicles = Math.max(0, Math.min(8, lane.vehicles + change));
        
        // Randomly assign vehicle types
        AppState.vehicleTypes.cars += Math.floor(lane.vehicles * 0.5);
        AppState.vehicleTypes.bikes += Math.floor(lane.vehicles * 0.2);
        AppState.vehicleTypes.buses += Math.floor(lane.vehicles * 0.1);
        AppState.vehicleTypes.trucks += Math.floor(lane.vehicles * 0.1);
        
        // Update UI
        document.getElementById(`count${index + 1}`).textContent = `${lane.vehicles} vehicles`;
        drawTrafficScene(lane, index);
    });
    
    // Random pedestrians
    AppState.vehicleTypes.pedestrians = Math.floor(Math.random() * 20);
    
    // Update vehicle type display
    document.getElementById('carCount').textContent = AppState.vehicleTypes.cars;
    document.getElementById('busCount').textContent = AppState.vehicleTypes.buses;
    document.getElementById('bikeCount').textContent = AppState.vehicleTypes.bikes;
    document.getElementById('truckCount').textContent = AppState.vehicleTypes.trucks;
    document.getElementById('emergencyCount').textContent = AppState.vehicleTypes.emergency;
    document.getElementById('pedestrianCount').textContent = AppState.vehicleTypes.pedestrians;
}

// Draw traffic heatmap
export function drawHeatmap() {
    const canvas = document.getElementById('heatmapCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.fillStyle = '#1a1f3a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw intersection
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const roadWidth = 80;
    
    // Horizontal road
    ctx.fillStyle = '#2a2f4a';
    ctx.fillRect(0, centerY - roadWidth/2, canvas.width, roadWidth);
    
    // Vertical road
    ctx.fillRect(centerX - roadWidth/2, 0, roadWidth, canvas.height);
    
    // Draw heatmap for each direction
    const directions = [
        { x: centerX, y: centerY - 100, width: 60, height: 80, lane: 0, label: 'N' },
        { x: centerX, y: centerY + 20, width: 60, height: 80, lane: 1, label: 'S' },
        { x: centerX + 20, y: centerY, width: 80, height: 60, lane: 2, label: 'E' },
        { x: centerX - 100, y: centerY, width: 80, height: 60, lane: 3, label: 'W' }
    ];
    
    directions.forEach(dir => {
        const density = AppState.lanes[dir.lane].vehicles / 8;
        let color;
        if (density < 0.3) color = 'rgba(0, 255, 157, 0.6)';
        else if (density < 0.7) color = 'rgba(255, 190, 11, 0.6)';
        else color = 'rgba(255, 0, 110, 0.6)';
        
        ctx.fillStyle = color;
        ctx.fillRect(dir.x - dir.width/2, dir.y - dir.height/2, dir.width, dir.height);
        
        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Rajdhani';
        ctx.textAlign = 'center';
        ctx.fillText(dir.label, dir.x, dir.y + 7);
    });
    
    // Draw signal indicators
    const signal1Color = AppState.currentSignal === 0 ? '#00ff9d' : '#ff006e';
    const signal2Color = AppState.currentSignal === 1 ? '#00ff9d' : '#ff006e';
    
    ctx.fillStyle = signal1Color;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 50, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = signal2Color;
    ctx.beginPath();
    ctx.arc(centerX + 50, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
}

// Draw performance chart
export function drawPerformanceChart() {
    const canvas = document.getElementById('performanceChart');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.fillStyle = '#1a1f3a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (AppState.performanceHistory.length < 2) return;
    
    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 157, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = (canvas.height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Draw efficiency line
    ctx.strokeStyle = '#00ff9d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const spacing = canvas.width / (AppState.maxHistoryLength - 1);
    AppState.performanceHistory.forEach((value, index) => {
        const x = index * spacing;
        const y = canvas.height - (value / 100 * canvas.height);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Draw glow effect
    ctx.strokeStyle = 'rgba(0, 255, 157, 0.3)';
    ctx.lineWidth = 4;
    ctx.stroke();
}
