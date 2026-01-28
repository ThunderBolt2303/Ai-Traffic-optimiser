import AppState from './state.js';
import { updateTrafficDensity, drawHeatmap, drawPerformanceChart } from './visualization.js';

// Set control mode
export function setMode(mode) {
    AppState.currentMode = mode;
    document.getElementById('aiModeBtn').classList.toggle('active', mode === 'ai');
    document.getElementById('manualModeBtn').classList.toggle('active', mode === 'manual');
    
    if (mode === 'ai') {
        addLog('Switched to AI automatic mode');
    } else {
        addLog('Switched to manual override mode');
    }
}

// Add log entry
export function addLog(message) {
    const logPanel = document.getElementById('logPanel');
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span class="log-time">[${time}]</span>${message}`;
    logPanel.insertBefore(entry, logPanel.firstChild);
    
    // Keep only last 10 entries
    while (logPanel.children.length > 10) {
        logPanel.removeChild(logPanel.lastChild);
    }
}

// Trigger emergency vehicle
export function triggerEmergency() {
    if (!AppState.simulationRunning) {
        addLog('Start simulation first to trigger emergency');
        return;
    }
    
    AppState.emergencyMode = true;
    AppState.vehicleTypes.emergency++;
    document.getElementById('emergencyCount').textContent = AppState.vehicleTypes.emergency;
    document.getElementById('emergencyAlert').classList.add('active');
    
    // Override signal for emergency
    const emergencyLane = Math.floor(Math.random() * 4);
    const direction = emergencyLane < 2 ? 'North-South' : 'East-West';
    AppState.currentSignal = emergencyLane < 2 ? 0 : 1;
    AppState.signalTimer = 60; // Extended time for emergency
    
    addLog(`🚨 Emergency vehicle detected in ${AppState.lanes[emergencyLane].name} lane`);
    addLog(`Priority green light activated for ${direction}`);
    
    setTimeout(() => {
        AppState.emergencyMode = false;
        AppState.vehicleTypes.emergency = Math.max(0, AppState.vehicleTypes.emergency - 1);
        document.getElementById('emergencyCount').textContent = AppState.vehicleTypes.emergency;
        document.getElementById('emergencyAlert').classList.remove('active');
        addLog('Emergency vehicle cleared - resuming normal operation');
    }, 10000);
}

// Add traffic manually
export function addTraffic() {
    AppState.lanes.forEach(lane => {
        lane.vehicles = Math.min(8, lane.vehicles + Math.floor(Math.random() * 3));
    });
    addLog('Manual traffic surge added to all lanes');
    updateTrafficDensity();
}

// Update weather
export function updateWeather() {
    if (Math.random() < 0.1) { // 10% chance to change weather
        AppState.currentWeather = AppState.weatherConditions[Math.floor(Math.random() * AppState.weatherConditions.length)];
        document.getElementById('weatherIcon').textContent = AppState.currentWeather.icon;
        document.getElementById('weatherTemp').textContent = `${AppState.currentWeather.temp}°C`;
        document.getElementById('weatherCondition').textContent = AppState.currentWeather.condition;
        
        addLog(`Weather changed: ${AppState.currentWeather.condition}`);
    }
}

// Update predictions
export function updatePredictions() {
    const totalTraffic = AppState.lanes.reduce((sum, lane) => sum + lane.vehicles, 0);
    
    // Peak forecast
    let peakLevel = 'Low';
    if (totalTraffic > 20) peakLevel = 'High';
    else if (totalTraffic > 12) peakLevel = 'Medium';
    document.getElementById('peakForecast').textContent = peakLevel;
    
    // Congestion risk
    const congestionRisk = Math.min(95, Math.floor((totalTraffic / 32) * 100));
    document.getElementById('congestionRisk').textContent = `${congestionRisk}%`;
    
    // Optimal route
    const nsTraffic = AppState.lanes[0].vehicles + AppState.lanes[1].vehicles;
    const ewTraffic = AppState.lanes[2].vehicles + AppState.lanes[3].vehicles;
    const optimalRoute = nsTraffic < ewTraffic ? 'North-South' : 'East-West';
    document.getElementById('optimalRoute').textContent = optimalRoute;
}

// AI-based signal optimization
export function optimizeSignals() {
    const nsTraffic = AppState.lanes[0].vehicles + AppState.lanes[1].vehicles;
    const ewTraffic = AppState.lanes[2].vehicles + AppState.lanes[3].vehicles;
    
    let greenTime;
    if (AppState.currentSignal === 0) {
        // North-South is green
        if (nsTraffic > ewTraffic * 2) {
            greenTime = 45; // More time for heavier traffic
        } else if (nsTraffic < ewTraffic / 2) {
            greenTime = 20; // Less time if light traffic
        } else {
            greenTime = 30; // Default
        }
    } else {
        // East-West is green
        if (ewTraffic > nsTraffic * 2) {
            greenTime = 45;
        } else if (ewTraffic < nsTraffic / 2) {
            greenTime = 20;
        } else {
            greenTime = 30;
        }
    }
    
    return greenTime;
}

// Update signal lights
export function updateSignals() {
    const signal1 = document.getElementById('signal1');
    const signal2 = document.getElementById('signal2');
    const timer1 = document.getElementById('timer1');
    const timer2 = document.getElementById('timer2');
    
    if (AppState.currentSignal === 0) {
        signal1.className = 'signal-light active-green';
        signal2.className = 'signal-light active-red';
        timer1.textContent = `${AppState.signalTimer}s`;
        timer2.textContent = 'STOP';
    } else {
        signal1.className = 'signal-light active-red';
        signal2.className = 'signal-light active-green';
        timer1.textContent = 'STOP';
        timer2.textContent = `${AppState.signalTimer}s`;
    }
}

// Update statistics
export function updateStats() {
    const totalVehicles = AppState.lanes.reduce((sum, lane) => sum + lane.vehicles, 0);
    document.getElementById('totalVehicles').textContent = totalVehicles;
    
    const avgWait = AppState.emergencyMode ? 5 : Math.floor(15 + Math.random() * 10 * AppState.currentWeather.factor);
    AppState.totalWaitTime += avgWait;
    document.getElementById('avgWait').textContent = `${avgWait}s`;
    
    const baseEfficiency = AppState.currentMode === 'ai' ? 70 : 50;
    const efficiency = Math.min(100, Math.floor(baseEfficiency + AppState.totalCycles * 1.5 + Math.random() * 10 - (AppState.currentWeather.factor - 1) * 20));
    document.getElementById('efficiency').textContent = `${efficiency}%`;
    
    // Add to performance history
    AppState.performanceHistory.push(efficiency);
    if (AppState.performanceHistory.length > AppState.maxHistoryLength) {
        AppState.performanceHistory.shift();
    }
    
    AppState.co2Saved += (0.5 + Math.random() * 0.3) * (efficiency / 100);
    document.getElementById('emissions').textContent = `${AppState.co2Saved.toFixed(1)}kg`;
}

// Main simulation loop
export function runSimulation() {
    if (!AppState.simulationRunning) return;
    
    // Update traffic every second
    updateTrafficDensity();
    updateStats();
    updateWeather();
    updatePredictions();
    drawHeatmap();
    drawPerformanceChart();
    
    // Countdown signal timer
    AppState.signalTimer--;
    
    if (AppState.signalTimer <= 0 && !AppState.emergencyMode) {
        // Switch signal
        AppState.currentSignal = 1 - AppState.currentSignal;
        
        if (AppState.currentMode === 'ai') {
            AppState.signalTimer = optimizeSignals();
        } else {
            AppState.signalTimer = 30; // Fixed time in manual mode
        }
        
        AppState.totalCycles++;
        
        const direction = AppState.currentSignal === 0 ? 'North-South' : 'East-West';
        const modeText = AppState.currentMode === 'ai' ? 'AI optimized' : 'Manual';
        addLog(`${modeText}: ${direction} green for ${AppState.signalTimer}s`);
    }
    
    updateSignals();
    
    setTimeout(runSimulation, 1000 / AppState.simulationSpeed);
}

// Start simulation
export function startSimulation() {
    if (AppState.simulationRunning) return;
    
    AppState.simulationRunning = true;
    AppState.signalTimer = 30;
    AppState.currentSignal = 0;
    
    addLog('AI Traffic Optimizer activated');
    addLog('Analyzing real-time traffic patterns...');
    
    runSimulation();
}

// Stop simulation
export function stopSimulation() {
    if (!AppState.simulationRunning) return;
    
    AppState.simulationRunning = false;
    addLog('AI Traffic Optimizer paused');
}
