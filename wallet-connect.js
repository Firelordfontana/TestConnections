class WalletConnector {
    constructor() {
        this.connected = false;
        this.eventListeners = new Map();
    }

    async connect() {
        try {
            console.log('Initializing WalletConnect...');
            this.emit('stateChange', { state: 'connecting' });

            // Load WalletConnect Core packages
            await Promise.all([
                this.loadScript('https://unpkg.com/@walletconnect/sign-client@2.10.6/dist/index.umd.js'),
                this.loadScript('https://unpkg.com/@walletconnect/modal@2.6.2/dist/index.umd.js')
            ]);

            // Initialize SignClient
            const signClient = await window.SignClient.init({
                projectId: '3da84389044f209842d3525861bd5d02',
                metadata: {
                    name: 'XRPL Demo',
                    description: 'XRPL Connection Demo',
                    url: window.location.origin,
                    icons: ['https://walletconnect.com/walletconnect-logo.png']
                }
            });

            // Create connection
            const { uri, approval } = await signClient.connect({
                requiredNamespaces: {
                    xrpl: {
                        methods: ['sign_transaction'],
                        chains: ['xrpl:1'],
                        events: []
                    }
                }
            });

            if (this.isMobile()) {
                // Use Trust Wallet's universal link for iOS
                window.location.href = `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`;
            } else {
                // Show QR code for desktop
                this.showQRCode(uri);
            }

            const session = await approval();
            this.connected = true;
            this.emit('stateChange', { state: 'connected' });
            console.log('Connected successfully!', session);

            return session;

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
