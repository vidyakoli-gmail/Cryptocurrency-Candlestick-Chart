let socket;
let chartInstance;
let chartData = { ethusdt: [], bnbusdt: [], dotusdt: [] };
const storageKey = 'cryptoChartData';

// Load saved data from localStorage if available
if (localStorage.getItem(storageKey)) {
    chartData = JSON.parse(localStorage.getItem(storageKey));
}

// Function to connect to Binance WebSocket
function connectToWebSocket(symbol, interval) {
    const url = `wss://stream.binance.com:9443/ws/${symbol}@kline_${interval}`;
    if (socket) socket.close(); // Close existing connection

    socket = new WebSocket(url);
    socket.onmessage = function (event) {
        const message = JSON.parse(event.data);
        updateChart(message.k, symbol);
    };
}

// Function to update chart data
function updateChart(kline, symbol) {
    const { t: timestamp, o: open, h: high, l: low, c: close } = kline;
    const candle = {
        time: new Date(timestamp).toLocaleTimeString(),
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close)
    };

    chartData[symbol].push(candle);
    localStorage.setItem(storageKey, JSON.stringify(chartData));
    drawChart(chartData[symbol]);
}

// Function to draw the chart using Chart.js
function drawChart(candles) {
    const labels = candles.map(candle => candle.time);
    const data = {
        labels: labels,
        datasets: [{
            label: 'Price',
            data: candles.map(candle => candle.close),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            scales: {
                x: { display: true, title: { display: true, text: 'Time' } },
                y: { display: true, title: { display: true, text: 'Price (USDT)' } }
            }
        }
    };

    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(document.getElementById('myChart'), config);
}

// Initialize the app
function init() {
    const cryptoSelect = document.getElementById('crypto-select');
    const intervalSelect = document.getElementById('interval-select');

    cryptoSelect.addEventListener('change', () => {
        const symbol = cryptoSelect.value;
        const interval = intervalSelect.value;
        drawChart(chartData[symbol]);
        connectToWebSocket(symbol, interval);
    });

    intervalSelect.addEventListener('change', () => {
        const symbol = cryptoSelect.value;
        const interval = intervalSelect.value;
        connectToWebSocket(symbol, interval);
    });

    const initialSymbol = cryptoSelect.value;
    const initialInterval = intervalSelect.value;
    drawChart(chartData[initialSymbol]);
    connectToWebSocket(initialSymbol, initialInterval);
}

// Start the app
window.onload = init;
