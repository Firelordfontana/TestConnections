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
                this.loadScript('https://unpkg.com/@web3modal/ethereum@2.7.1/dist/index.umd.js'),
                this.loadScript('https://unpkg.com/@walletconnect/ethereum-provider@2.10.6/dist/index.umd.js')
            ]);

            // Initialize provider
            const provider = await window.WalletConnect.init({
                projectId: '3da84389044f209842d3525861bd5d02',
                chains: ['xrpl:1'],
                showQrModal: true,
                metadata: {
                    name: 'XRPL Demo',
                    description: 'XRPL Connection Demo',
                    url: window.location.origin,
                    icons: ['https://walletconnect.com/walletconnect-logo.png']
                },
                mobileLinks: ['trust']
            });

            if (this.isMobile()) {
                // Use Trust Wallet's universal link for iOS
                const uri = await provider.getWalletConnectUri();
                window.location.href = `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`;
            } else {
                // Show QR code modal on desktop
                await provider.connect();
            }

            this.connected = true;
            this.emit('stateChange', { state: 'connected' });
            console.log('Connected successfully!');

            return provider;

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
