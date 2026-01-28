// Global application state
const AppState = {
    simulationRunning: false,
    currentMode: 'ai', // 'ai' or 'manual'
    emergencyMode: false,
    simulationSpeed: 1,
    currentSignal: 0, // 0 = North-South green, 1 = East-West green
    signalTimer: 30,
    totalCycles: 0,
    totalWaitTime: 0,
    co2Saved: 0,
    
    lanes: [
        { name: 'North', vehicles: 0, canvas: null, ctx: null },
        { name: 'South', vehicles: 0, canvas: null, ctx: null },
        { name: 'East', vehicles: 0, canvas: null, ctx: null },
        { name: 'West', vehicles: 0, canvas: null, ctx: null }
    ],
    
    vehicleTypes: {
        cars: 0,
        buses: 0,
        bikes: 0,
        trucks: 0,
        emergency: 0,
        pedestrians: 0
    },
    
    performanceHistory: [],
    maxHistoryLength: 30,
    
    currentWeather: null,
    
    weatherConditions: [
        { icon: '☀️', temp: 28, condition: 'Clear Sky', factor: 1.0 },
        { icon: '⛅', temp: 25, condition: 'Partly Cloudy', factor: 1.1 },
        { icon: '☁️', temp: 22, condition: 'Cloudy', factor: 1.2 },
        { icon: '🌧️', temp: 20, condition: 'Rainy', factor: 1.5 },
        { icon: '⛈️', temp: 18, condition: 'Stormy', factor: 2.0 }
    ]
};

// Initialize weather
AppState.currentWeather = AppState.weatherConditions[0];

export default AppState;
