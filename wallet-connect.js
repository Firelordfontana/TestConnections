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

            // Load required scripts
            await Promise.all([
                this.loadScript('https://unpkg.com/@walletconnect/sign-client@2.10.6'),
                this.loadScript('https://unpkg.com/@walletconnect/utils@2.10.6')
            ]);

            console.log('Scripts loaded, initializing client...');
            
            const signClient = await window.SignClient.init({
                projectId: '3da84389044f209842d3525861bd5d02',
                metadata: {
                    name: 'XRPL Demo',
                    description: 'XRPL Connection Demo',
                    url: window.location.origin,
                    icons: ['https://walletconnect.com/walletconnect-logo.png']
                }
            });

            console.log('Client initialized, creating connection...');

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
                console.log('Mobile device detected, opening Trust Wallet');
                window.location.href = `trust://wc?uri=${encodeURIComponent(uri)}`;
            } else {
                console.log('Desktop device detected, showing QR code');
                this.showQRCode(uri);
            }

            const session = await approval();
            console.log('Connection approved:', session);
            this.connected = true;
            this.emit('stateChange', { state: 'connected' });
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
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    showQRCode(uri) {
        // Create QR code container
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

        // Add QR code
        const qr = new QRCode(container, {
            text: uri,
            width: 256,
            height: 256
        });

        // Add close button
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
