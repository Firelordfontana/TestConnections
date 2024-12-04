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
                this.loadScript('https://unpkg.com/@walletconnect/web3modal@2.7.1/dist/index.umd.js'),
                this.loadScript('https://unpkg.com/@walletconnect/core@2.10.6/dist/index.umd.js')
            ]);

            // Initialize Web3Modal
            const web3Modal = new window.Web3Modal({
                projectId: '3da84389044f209842d3525861bd5d02',
                chains: ['xrpl:1'],
                defaultChain: 'xrpl:1',
                themeMode: 'light',
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

            if (this.isMobile()) {
                // Use Trust Wallet's universal link for iOS
                const wcUri = await web3Modal.getWalletConnectUri();
                window.location.href = `https://link.trustwallet.com/wc?uri=${encodeURIComponent(wcUri)}`;
            } else {
                // Show QR code modal on desktop
                await web3Modal.openModal();
            }

            return new Promise((resolve, reject) => {
                web3Modal.subscribeModal((state) => {
                    if (state.open) {
                        console.log('Modal opened');
                    } else {
                        console.log('Modal closed');
                    }
                });

                web3Modal.on('connect', (session) => {
                    this.connected = true;
                    this.emit('stateChange', { state: 'connected' });
                    console.log('Connected successfully!', session);
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
