class WalletConnector {
    constructor() {
        this.connected = false;
        this.eventListeners = new Map();
        this.wcUri = null;
    }

    async connect() {
        try {
            console.log('Initializing WalletConnect...');
            this.emit('stateChange', { state: 'connecting' });

            // Load WalletConnect Web3Modal
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@web3modal/standalone@2.4.1/dist/index.umd.js';
            document.head.appendChild(script);

            await new Promise((resolve) => {
                script.onload = resolve;
            });

            // Initialize Web3Modal
            const web3Modal = new window.Web3Modal.standalone({
                projectId: '3da84389044f209842d3525861bd5d02',
                chains: ['xrpl:1'],
                walletConnectVersion: 2,
                metadata: {
                    name: 'XRPL Demo',
                    description: 'XRPL Connection Demo',
                    url: window.location.origin,
                    icons: ['https://walletconnect.com/walletconnect-logo.png']
                }
            });

            if (this.isMobile()) {
                // On mobile, show QR or open Trust Wallet
                const uri = await web3Modal.getWalletConnectUri();
                console.log('Opening Trust Wallet with WalletConnect URI');
                window.location.href = `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`;
            } else {
                // On desktop, show QR code modal
                console.log('Showing QR code for desktop');
                await web3Modal.openModal();
            }

            // Listen for connection events
            web3Modal.subscribeModal((state) => {
                if (state.open) {
                    console.log('Modal opened');
                } else {
                    console.log('Modal closed');
                }
            });

            return new Promise((resolve, reject) => {
                web3Modal.on('connect', (session) => {
                    console.log('Connected!', session);
                    this.connected = true;
                    this.emit('stateChange', { state: 'connected' });
                    resolve(session);
                });

                web3Modal.on('error', (error) => {
                    console.error('Connection error:', error);
                    reject(error);
                });

                // Add timeout
                setTimeout(() => {
                    if (!this.connected) {
                        reject(new Error('Connection timeout'));
                    }
                }, 30000);
            });

        } catch (error) {
            console.error('Connection error:', error);
            this.emit('error', error);
            throw error;
        }
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
