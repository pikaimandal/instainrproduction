# InstaINR - Crypto to INR Conversion App

InstaINR is a Worldcoin mini-app that allows users to securely convert cryptocurrency to Indian Rupees (INR).

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- World App
- Supabase account

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd instainr-production
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Install Supabase dependencies:
   ```
   bash supabase-install.sh
   ```

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
# Worldcoin Mini App Configuration
NEXT_PUBLIC_WORLD_APP_ID=your_world_app_id

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Payment Configuration
NEXT_PUBLIC_RECIPIENT_ADDRESS=your_recipient_wallet_address
```

Replace the placeholder values with your actual credentials.

## Database Setup

1. Create a new Supabase project
2. Go to the SQL Editor in your Supabase dashboard
3. Execute the SQL script from `supabase/schema.sql` to create the necessary tables and security policies

## Development

Run the development server:

```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```
npm run build
```

Then start the production server:

```
npm start
```

## Features

- Secure wallet authentication with World App
- User profile management with KYC
- Bank and UPI payment methods
- Real-time transaction tracking
- Secure crypto-to-INR conversion

## License

MIT 