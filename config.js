const WALLET_CONFIG = {
    trust: {
        deepLink: "trust://",
        xrplNetwork: "mainnet",
        appStore: "https://trustwallet.com/dl",
        playStore: "https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp"
    },
    reown: {
        projectId: "3da84389044f209842d3525861bd5d02",
        metadata: {
            name: "XRPL Wallet Demo",
            description: "Connect your wallet to interact with XRPL",
            url: window.location.origin,
            icons: [`${window.location.origin}/logo.png`]
        }
    }
};

export default WALLET_CONFIG;
