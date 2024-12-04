class WalletConnector {
    constructor() {
        this.connected = false;
        this.eventListeners = new Map();
    }

    async connect() {
        try {
            console.log('Initializing WalletConnect...');
            this.emit('stateChange', { state: 'connecting' });

            // Load WalletConnect standalone client
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@walletconnect/standalone@2.10.6/dist/index.umd.js';
            document.head.appendChild(script);

            await new Promise((resolve) => script.onload = resolve);

            // Initialize the client
            const client = await window.WalletConnectStandalone.init({
                projectId: '3da84389044f209842d3525861bd5d02'
            });

            // Create pairing
            const { uri } = await client.pair({
                chains: ['xrpl:1']
            });

            if (this.isMobile()) {
                // Direct deep link to Trust Wallet
                window.location.href = `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`;
            } else {
                // Show QR code for desktop
                this.showQRCode(uri);
            }

        } catch (error) {
            console.error('Connection error:', error);
            this.emit('error', error);
            throw error;
        }
    }

    showQRCode(uri) {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.background = 'white';
        container.style.padding = '20px';
        container.style.borderRadius = '10px';
        container.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        container.style.zIndex = '1000';

        const qr = new QRCode(container, {
            text: uri,
            width: 256,
            height: 256
        });

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.onclick = () => container.remove();
        container.appendChild(closeButton);

        document.body.appendChild(container);
    }

    isMobile() {
        return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    }

    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(callback);
    }

    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => callback(data));
        }
    }
}

export default WalletConnector;
