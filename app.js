const wallet = new WalletConnector();
let loadingTimeout;

// Initialize WalletConnect on page load
window.addEventListener('load', async () => {
    try {
        await wallet.initialize();
        setupEventListeners();
    } catch (error) {
        handleError(error);
    }
});

function setupEventListeners() {
    wallet.on('stateChange', handleStateChange);
    wallet.on('sessionEvent', handleSessionEvent);
    wallet.on('disconnect', handleDisconnect);
    wallet.on('error', handleError);
}

function handleStateChange({ state, error }) {
    updateUI(state);
    if (error) {
        handleError(error);
    }
}

function handleSessionEvent(event) {
    console.log('Session event:', event);
    // Handle specific events like chain or account changes
}

function handleDisconnect() {
    updateUI('disconnected');
}

function handleError(error) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = error.message || 'An error occurred';
    errorElement.style.display = 'block';
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

async function handleConnect(method = 'auto') {
    try {
        showLoading();
        const session = await wallet.connect(method);
        if (session) {
            console.log('Connected successfully!');
        }
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading();
    }
}

function showLoading() {
    const loader = document.getElementById('loader');
    loader.style.display = 'block';
    
    // Set timeout for loading
    loadingTimeout = setTimeout(() => {
        hideLoading();
        handleError(new Error('Connection timed out'));
    }, 30000);
}

function hideLoading() {
    const loader = document.getElementById('loader');
    loader.style.display = 'none';
    if (loadingTimeout) {
        clearTimeout(loadingTimeout);
    }
}

function updateUI(state) {
    const buttons = document.querySelectorAll('.wallet-connect-btn');
    const statusElement = document.getElementById('connection-status');
    
    buttons.forEach(button => {
        button.disabled = state === 'connecting' || state === 'connected';
    });
    
    const statusMessages = {
        disconnected: 'Not connected',
        connecting: 'Connecting...',
        connected: 'Connected',
        error: 'Connection failed',
        initializing: 'Initializing...'
    };
    
    statusElement.textContent = statusMessages[state] || state;
    statusElement.className = `status-${state}`;
} 