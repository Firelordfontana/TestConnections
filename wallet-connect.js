class WalletConnector {
    constructor() {
        this.connected = false;
        this.eventListeners = new Map();
    }

    async connect() {
        try {
            console.log('Initializing WalletConnect...');
            this.emit('stateChange', { state: 'connecting' });

            // Load WalletConnect Modal SDK
            await this.loadScript('https://unpkg.com/@walletconnect/modal@2.6.2/dist/index.umd.js');
            
            // Initialize WalletConnect Modal
            const modal = new window.WalletConnectModal({
                projectId: '3da84389044f209842d3525861bd5d02',
                chains: ['xrpl:1'],
                enableExplorer: true,
                mobileWallets: [
                    {
                        id: 'trust',
                        name: 'Trust Wallet',
                        links: {
                            native: 'trust://wc',
                            universal: 'https://link.trustwallet.com/wc'
                        }
                    }
                ]
            });

            // Get WalletConnect URI
            const { uri } = await modal.connect({
                requiredNamespaces: {
                    xrpl: {
                        methods: ['sign_transaction'],
                        chains: ['xrpl:1'],
                        events: ['chainChanged', 'accountsChanged']
                    }
                }
            });

            if (this.isMobile()) {
                // Use Trust Wallet's official deep linking format
                window.location.href = `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`;
            } else {
                // Show QR code modal on desktop
                await modal.openModal();
            }

            return new Promise((resolve, reject) => {
                modal.on('connect', (session) => {
                    this.connected = true;
                    this.emit('stateChange', { state: 'connected' });
                    console.log('Connected successfully!', session);
                    resolve(session);
                });

                modal.on('error', (error) => {
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

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log(`Script loaded: ${src}`);
                resolve();
            };
            script.onerror = (err) => {
                console.error(`Script load error: ${src}`, err);
                reject(err);
            };
            document.head.appendChild(script);
        });
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
