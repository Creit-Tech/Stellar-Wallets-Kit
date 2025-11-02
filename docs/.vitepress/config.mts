import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "files",

  title: "Stellar Wallets Kit",
  description: "A kit to handle all Stellar Wallets at once",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {text: 'Documentation', link: '/installation'}
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          {text: 'Installation', link: '/installation'},
          {text: 'The structure', link: '/kit-structure'},
        ]
      },
      {
        text: 'How to',
        items: [
          {text: 'The easy way', link: '/how-to/the-easy-way'},
          {text: 'Starting the kit', link: '/how-to/init'},
          {text: 'Authenticate', link: '/how-to/authenticate'},
          {text: 'Fetch the address', link: '/how-to/get-wallet-address'},
          {text: 'Request a signature', link: '/how-to/sign-with-wallet'},
          {text: 'Events listening', link: '/how-to/kit-events'},
        ]
      },
      {
        text: 'Wallets',
        items: [
          {text: 'Supported wallets', link: '/wallets/supported-wallets'},
          {text: 'Ledger Wallets', link: '/wallets/ledger'},
          {text: 'Trezor Wallets', link: '/wallets/trezor'},
          {text: 'Wallet Connect', link: '/wallets/wallet-connect'},
          {text: 'Add your wallet', link: '/wallets/create-wallet-module'},
        ]
      },
      {
        text: 'Theme',
        items: [
          {text: 'Default themes', link: '/theme/default-themes'},
          {text: 'Custom styles', link: '/theme/custom-styles'},
        ]
      },
      // {
      //   text: 'Examples',
      //   items: [
      //     {text: 'Create React App', link: '/examples/create-react-app'},
      //     {text: 'React + Vite', link: '/examples/vite-react'},
      //     {text: 'Preact + Vite', link: '/examples/vite-preact'},
      //     {text: 'Angular with SSR', link: '/examples/angular-ssr'},
      //   ]
      // }
    ],

    socialLinks: [
      {icon: 'github', link: 'https://github.com/Creit-Tech/Stellar-Wallets-Kit'}
    ]
  }
})
