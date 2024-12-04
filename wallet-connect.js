class WalletConnector {
    constructor() {
        this.connected = false;
        this.eventListeners = new Map();
    }

    async connect() {
        try {
            console.log('Attempting to connect to Trust Wallet...');
            this.emit('stateChange', { state: 'connecting' });

            // Use WalletConnect format for Trust Wallet with XRPL specifics
            const deepLink = 'trust://wallet_connect?' + new URLSearchParams({
                uri: encodeURIComponent(`wc:?chainId=xrpl:1&projectId=3da84389044f209842d3525861bd5d02`),
                callback: window.location.href
            }).toString();
            
            if (this.isMobile()) {
                console.log('Opening Trust Wallet with deep link:', deepLink);
                // On mobile, directly open Trust Wallet
                window.location.href = deepLink;
                
                // Set a timeout to check if Trust Wallet opened
                setTimeout(() => {
                    if (!this.connected) {
                        // If app didn't open, redirect to app store
                        window.location.href = 'https://trustwallet.com/dl';
                    }
                }, 1500);
            } else {
                // On desktop, show message to use mobile
                throw new Error('Please open this page on a mobile device with Trust Wallet installed');
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
