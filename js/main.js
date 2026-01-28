import AppState from './state.js';
import { initCanvases, updateTrafficDensity, drawHeatmap, drawPerformanceChart } from './visualization.js';
import { setMode, addLog, triggerEmergency, addTraffic, updateWeather, updatePredictions, updateSignals, updateStats, startSimulation, stopSimulation } from './simulation.js';

// Export functions for global access (if needed)
window.setMode = setMode;
window.triggerEmergency = triggerEmergency;
window.addTraffic = addTraffic;
window.startSimulation = startSimulation;
window.stopSimulation = stopSimulation;

// Initialize application
export function initApplication() {
    // Initialize canvases
    initCanvases();
    
    // Set initial random traffic
    AppState.lanes.forEach((lane, index) => {
        lane.vehicles = Math.floor(Math.random() * 5) + 1;
        const { drawTrafficScene } = require('./visualization.js');
        drawTrafficScene(lane, index);
        document.getElementById(`count${index + 1}`).textContent = `${lane.vehicles} vehicles`;
    });
    
    // Speed slider
    const speedSlider = document.getElementById('speedSlider');
    if (speedSlider) {
        speedSlider.addEventListener('input', function(e) {
            AppState.simulationSpeed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = `${AppState.simulationSpeed}x`;
            addLog(`Simulation speed changed to ${AppState.simulationSpeed}x`);
        });
    }
    
    updateSignals();
    updateTrafficDensity();
    drawHeatmap();
    drawPerformanceChart();
    addLog('System initialized. Ready to start.');
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApplication);
} else {
    initApplication();
}
