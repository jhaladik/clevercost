# CleverCost - Intelligent Cost Calculator

An intelligent, cloud-based cost calculation platform that helps you make informed decisions about purchasing, renting, testing, or finding alternatives for products and services.

## Features

### 1. 🎯 Category-Based Intelligent Selection
- Smart autocomplete based on first characters typed
- Automatic price fill-in from historical data
- Context-aware suggestions
- Fuzzy search for typo tolerance

### 2. ☁️ Cloud-Based Architecture
- Access from anywhere
- Real-time data synchronization
- Automatic backups
- No installation required

### 3. 🔒 Anonymized Patterns
- Learn from community patterns
- Privacy-first approach (no PII stored)
- Aggregate insights without compromising privacy
- GDPR/CCPA compliant

### 4. ⚡ Real-Time Updates
- Live calculations as you type
- Market price monitoring
- Push notifications for price changes
- Collaborative editing support

### 5. 🤔 Decision Support System
- **Buy vs Rent Analysis**: Break-even calculations
- **Test First**: Trial period recommendations
- **Alternatives**: Discover cheaper or better options
- **TCO Calculator**: Total Cost of Ownership analysis

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis (optional, for caching)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd clevercost

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Project Structure

```
clevercost/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API clients
│   │   ├── utils/         # Utility functions
│   │   └── App.tsx        # Main app component
│   └── index.html
├── server/                # Backend Node.js application
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   │   ├── calculator.js  # Cost calculation engine
│   │   ├── autocomplete.js # Intelligent search
│   │   └── anonymizer.js  # Privacy protection
│   ├── utils/            # Utility functions
│   └── index.js          # Server entry point
├── shared/               # Shared types and utilities
├── DESIGN.md            # Detailed design document
└── package.json

## Usage Examples

### Example 1: Should I buy or rent a camera?

```javascript
const analysis = {
  item: "Professional Camera",
  purchasePrice: 2500,
  rentalPricePerDay: 150,
  expectedUsageDays: 24, // 2 days/month × 12 months
  duration: 12 // months
};

// Result:
// Buy: $2,500 total ($208/month)
// Rent: $3,600 total ($300/month)
// Recommendation: BUY if you plan to keep it >17 months
//                 RENT for your 12-month need
```

### Example 2: Intelligent category search

```
User types: "lap"

Suggestions:
→ Laptops (Business) - Avg: $1,200-$2,500
→ Laptops (Personal) - Avg: $600-$1,200
→ Laptop Accessories - Avg: $50-$200
```

## API Documentation

### Calculate Cost Decision
```http
POST /api/calculate
Content-Type: application/json

{
  "itemName": "Professional Camera",
  "category": "Photography Equipment",
  "purchasePrice": 2500,
  "rentalPrice": 150,
  "rentalPeriod": "day",
  "expectedDuration": 12,
  "usageFrequency": "monthly",
  "usageTimes": 2
}
```

Response:
```json
{
  "recommendation": "RENT",
  "confidence": 0.85,
  "buyAnalysis": {
    "totalCost": 2700,
    "monthlyEquivalent": 225
  },
  "rentAnalysis": {
    "totalCost": 3600,
    "monthlyEquivalent": 300
  },
  "breakEvenMonths": 17,
  "alternatives": [
    {
      "name": "Camera sharing platform",
      "type": "service",
      "costPerDay": 80,
      "savings": "47%"
    }
  ]
}
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Caching**: Redis
- **Real-time**: Socket.io
- **Testing**: Vitest, React Testing Library

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## Privacy & Security

- All user data is encrypted at rest and in transit
- Personal information is never shared
- Anonymized patterns use k-anonymity (k≥5)
- GDPR compliant with right to deletion
- Regular security audits

## License

MIT License - see [LICENSE](./LICENSE) file

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/clevercost/issues)
- Documentation: See [DESIGN.md](./DESIGN.md)

---

**Status**: 🚧 In Development (Brainstorming Phase)
**Version**: 0.1.0
**Last Updated**: 2025-11-04
