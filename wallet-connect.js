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

            // Load WalletConnect Standalone Client
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@walletconnect/standalone@2.10.6/dist/index.umd.js';
            document.head.appendChild(script);

            await new Promise((resolve) => {
                script.onload = resolve;
            });

            // Initialize WalletConnect
            const connector = await window.WalletConnectStandalone.init({
                projectId: '3da84389044f209842d3525861bd5d02',
                metadata: {
                    name: 'XRPL Demo',
                    description: 'XRPL Connection Demo',
                    url: window.location.origin,
                    icons: ['https://walletconnect.com/walletconnect-logo.png']
                }
            });

            // Create connection
            const { uri, approval } = await connector.connect({
                requiredNamespaces: {
                    xrpl: {
                        methods: ['sign_transaction'],
                        chains: ['xrpl:1'],
                        events: ['chainChanged', 'accountsChanged']
                    }
                }
            });

            if (this.isMobile()) {
                // On mobile, open Trust Wallet with WalletConnect URI
                window.location.href = `trust://wc?uri=${encodeURIComponent(uri)}`;
            } else {
                // On desktop, show message to use mobile
                throw new Error('Please open this page on a mobile device with Trust Wallet installed');
            }

            // Wait for connection approval
            const session = await approval();
            console.log('Connected!', session);
            this.connected = true;
            this.emit('stateChange', { state: 'connected' });
            return session;

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
