# InstaINR - Worldcoin Mini App

InstaINR is a Worldcoin mini app that allows users to convert their crypto to INR instantly.

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- World App installed on your device

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_WORLD_APP_ID=your_world_app_id
```

Replace `your_world_app_id` with your actual World App ID from the Worldcoin Developer Portal.

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
# or
yarn build
```

## Features

- World Wallet integration
- Crypto to INR conversion
- Transaction history
- Secure authentication

## License

This project is licensed under the MIT License. 