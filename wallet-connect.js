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

            // Load WalletConnect Core
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@walletconnect/web3modal@2.7.1/dist/index.umd.js';
            document.head.appendChild(script);

            await new Promise((resolve) => {
                script.onload = () => {
                    console.log('WalletConnect script loaded');
                    resolve();
                };
                script.onerror = (error) => {
                    console.error('Script load error:', error);
                    throw new Error('Failed to load WalletConnect');
                };
            });

            if (!window.Web3Modal) {
                throw new Error('Web3Modal not loaded properly');
            }

            console.log('Creating Web3Modal instance');
            const web3Modal = new window.Web3Modal({
                projectId: '3da84389044f209842d3525861bd5d02',
                standaloneChains: ['xrpl:1'],
                defaultChain: 'xrpl:1',
                metadata: {
                    name: 'XRPL Demo',
                    description: 'XRPL Connection Demo',
                    url: window.location.origin,
                    icons: ['https://walletconnect.com/walletconnect-logo.png']
                }
            });

            if (this.isMobile()) {
                console.log('Mobile device detected, opening Trust Wallet');
                const wcUri = await web3Modal.connect();
                window.location.href = `https://link.trustwallet.com/wc?uri=${encodeURIComponent(wcUri)}`;
            } else {
                console.log('Desktop device detected, showing QR code');
                const session = await web3Modal.connect();
                console.log('Connection successful:', session);
                this.connected = true;
                this.emit('stateChange', { state: 'connected' });
                return session;
            }

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
