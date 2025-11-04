/**
 * Decision Support Calculator
 *
 * Analyzes whether to:
 * - BUY: Purchase outright
 * - RENT: Short-term rental
 * - TEST: Try before deciding
 * - ALTERNATIVES: Consider other options
 */

class DecisionCalculator {
  constructor() {
    this.thresholds = {
      testRecommendationPrice: 1000, // Recommend testing for items >$1000
      shortTermMonths: 6,             // <6 months = short-term
      longTermMonths: 24,             // >24 months = long-term
      highUsagePerWeek: 3,            // >3x/week = high usage
      rapidDepreciationRate: 0.3      // >30% annual depreciation
    };
  }

  /**
   * Main analysis function
   * @param {Object} params - Analysis parameters
   * @returns {Object} Complete decision analysis
   */
  analyze(params) {
    const {
      itemName,
      category,
      purchasePrice,
      rentalPrice,
      rentalPeriod = 'month', // 'day', 'week', 'month'
      expectedDuration,       // in months
      usageFrequency = 'weekly', // 'daily', 'weekly', 'monthly'
      usageTimes = 1,            // how many times per frequency period
      maintenanceCostAnnual = 0,
      depreciationRate = 0.15,   // 15% annual depreciation
      hasTrialAvailable = false,
      trialDuration = 0,         // in days
      uncertainNeed = false
    } = params;

    // Normalize rental price to monthly
    const monthlyRentalPrice = this._normalizeToMonthly(rentalPrice, rentalPeriod);

    // Calculate actual usage
    const actualUsagePerMonth = this._calculateMonthlyUsage(usageFrequency, usageTimes);

    // Calculate costs
    const buyAnalysis = this._analyzeBuy(
      purchasePrice,
      expectedDuration,
      maintenanceCostAnnual,
      depreciationRate
    );

    const rentAnalysis = this._analyzeRent(
      monthlyRentalPrice,
      expectedDuration,
      actualUsagePerMonth
    );

    const testAnalysis = this._analyzeTest(
      purchasePrice,
      hasTrialAvailable,
      trialDuration,
      uncertainNeed
    );

    const alternatives = this._findAlternatives(category, purchasePrice);

    // Determine recommendation
    const recommendation = this._makeRecommendation({
      buyAnalysis,
      rentAnalysis,
      testAnalysis,
      expectedDuration,
      actualUsagePerMonth,
      purchasePrice,
      uncertainNeed
    });

    return {
      itemName,
      category,
      buyAnalysis,
      rentAnalysis,
      testAnalysis,
      alternatives,
      recommendation,
      usageProfile: {
        frequency: usageFrequency,
        timesPerPeriod: usageTimes,
        monthlyUsage: actualUsagePerMonth
      },
      breakEven: this._calculateBreakEven(purchasePrice, monthlyRentalPrice),
      summary: this._generateSummary({
        itemName,
        buyAnalysis,
        rentAnalysis,
        recommendation,
        expectedDuration
      })
    };
  }

  /**
   * Analyze BUY option
   */
  _analyzeBuy(price, durationMonths, maintenanceAnnual, depreciationRate) {
    const years = durationMonths / 12;
    const maintenanceTotal = maintenanceAnnual * years;
    const depreciation = price * depreciationRate * years;
    const totalCost = price + maintenanceTotal;
    const resaleValue = Math.max(0, price - depreciation);
    const netCost = totalCost - resaleValue;

    return {
      upfrontCost: price,
      maintenanceCost: Math.round(maintenanceTotal),
      totalCost: Math.round(totalCost),
      resaleValue: Math.round(resaleValue),
      netCost: Math.round(netCost),
      monthlyEquivalent: Math.round(netCost / durationMonths),
      pros: [
        "Own the asset",
        "No recurring payments",
        resaleValue > 0 ? `Can resell for ~$${Math.round(resaleValue)}` : null,
        "Unlimited usage",
        "Can customize/modify"
      ].filter(Boolean),
      cons: [
        `High upfront cost ($${price.toLocaleString()})`,
        "Responsible for maintenance",
        "Depreciation risk",
        "Storage/space required",
        "May become outdated"
      ]
    };
  }

  /**
   * Analyze RENT option
   */
  _analyzeRent(monthlyPrice, durationMonths, usagePerMonth) {
    const totalCost = monthlyPrice * durationMonths;
    const costPerUse = usagePerMonth > 0 ? monthlyPrice / usagePerMonth : monthlyPrice;

    return {
      monthlyPrice: Math.round(monthlyPrice),
      totalCost: Math.round(totalCost),
      monthlyEquivalent: Math.round(monthlyPrice),
      costPerUse: Math.round(costPerUse),
      pros: [
        "No upfront cost",
        "Maintenance often included",
        "Easy to return/cancel",
        "Always have latest version",
        "No storage concerns",
        usagePerMonth < 5 ? "Pay only when needed" : null
      ].filter(Boolean),
      cons: [
        "No ownership/equity",
        "Ongoing payments",
        "May cost more long-term",
        "Availability dependence",
        "Usage restrictions"
      ]
    };
  }

  /**
   * Analyze TEST option
   */
  _analyzeTest(price, hasTrialAvailable, trialDuration, uncertainNeed) {
    const shouldTest = price > this.thresholds.testRecommendationPrice ||
                       uncertainNeed ||
                       hasTrialAvailable;

    return {
      recommended: shouldTest,
      available: hasTrialAvailable,
      duration: trialDuration,
      reasons: shouldTest ? [
        price > this.thresholds.testRecommendationPrice ?
          `High cost ($${price.toLocaleString()}) justifies testing` : null,
        uncertainNeed ? "Uncertain if it meets your needs" : null,
        hasTrialAvailable ? `${trialDuration}-day trial available` : null,
        "Reduce buyer's remorse risk",
        "Validate assumptions before commitment"
      ].filter(Boolean) : []
    };
  }

  /**
   * Find alternative options
   */
  _findAlternatives(category, price) {
    // This would query a real database in production
    const alternativeDatabase = {
      "Photography Equipment": [
        {
          name: "Camera sharing platform",
          type: "service",
          costModel: "per-day",
          estimatedCost: price * 0.05,
          savings: 0.47,
          description: "Rent from local photographers"
        },
        {
          name: "Smartphone with pro camera",
          type: "product",
          costModel: "one-time",
          estimatedCost: price * 0.4,
          savings: 0.60,
          description: "Modern phones have excellent cameras"
        },
        {
          name: "Hire professional photographer",
          type: "service",
          costModel: "per-event",
          estimatedCost: 300,
          savings: null,
          description: "Full service including expertise"
        }
      ],
      "Computing": [
        {
          name: "Refurbished device",
          type: "product",
          costModel: "one-time",
          estimatedCost: price * 0.6,
          savings: 0.40,
          description: "Certified refurbished with warranty"
        },
        {
          name: "Previous generation model",
          type: "product",
          costModel: "one-time",
          estimatedCost: price * 0.7,
          savings: 0.30,
          description: "Often 95% of the performance"
        },
        {
          name: "Cloud workstation",
          type: "service",
          costModel: "monthly",
          estimatedCost: 50,
          savings: null,
          description: "Pay-as-you-go cloud computing"
        }
      ]
    };

    return alternativeDatabase[category] || [];
  }

  /**
   * Make final recommendation
   */
  _makeRecommendation(data) {
    const {
      buyAnalysis,
      rentAnalysis,
      testAnalysis,
      expectedDuration,
      actualUsagePerMonth,
      purchasePrice,
      uncertainNeed
    } = data;

    // Calculate break-even point
    const breakEvenMonths = purchasePrice / rentAnalysis.monthlyPrice;

    // Decision logic
    let decision = 'BUY';
    let confidence = 0.5;
    let reasoning = [];

    // Test first if recommended
    if (testAnalysis.recommended && uncertainNeed) {
      return {
        decision: 'TEST',
        confidence: 0.90,
        reasoning: [
          "High uncertainty about need",
          ...testAnalysis.reasons
        ],
        nextStep: "After testing, re-evaluate between BUY and RENT"
      };
    }

    // Short-term need
    if (expectedDuration < this.thresholds.shortTermMonths) {
      decision = 'RENT';
      confidence = 0.85;
      reasoning = [
        `Short-term need (${expectedDuration} months)`,
        `Would not reach break-even (${Math.round(breakEvenMonths)} months)`,
        "Lower commitment and flexibility"
      ];
    }
    // Long-term + high usage
    else if (expectedDuration > this.thresholds.longTermMonths &&
             actualUsagePerMonth >= this.thresholds.highUsagePerWeek * 4) {
      decision = 'BUY';
      confidence = 0.90;
      reasoning = [
        `Long-term need (${expectedDuration} months)`,
        `High usage (${actualUsagePerMonth} times/month)`,
        `Will exceed break-even point`,
        `Savings: $${Math.round(rentAnalysis.totalCost - buyAnalysis.netCost).toLocaleString()}`
      ];
    }
    // Medium-term
    else if (expectedDuration >= breakEvenMonths * 1.5) {
      decision = 'BUY';
      confidence = 0.75;
      reasoning = [
        `Duration (${expectedDuration} months) exceeds break-even (${Math.round(breakEvenMonths)} months)`,
        "Will save money in the long run"
      ];
    }
    // Occasional use
    else if (actualUsagePerMonth < 5) {
      decision = 'RENT';
      confidence = 0.80;
      reasoning = [
        `Low usage frequency (${actualUsagePerMonth} times/month)`,
        "Rental more cost-effective for occasional needs",
        `Cost per use: $${rentAnalysis.costPerUse}`
      ];
    }
    // Default: compare total costs
    else {
      if (rentAnalysis.totalCost < buyAnalysis.netCost) {
        decision = 'RENT';
        confidence = 0.70;
        reasoning = [
          `Rental total cost lower ($${rentAnalysis.totalCost.toLocaleString()} vs $${buyAnalysis.netCost.toLocaleString()})`,
          "Better value for your timeline"
        ];
      } else {
        decision = 'BUY';
        confidence = 0.70;
        reasoning = [
          `Purchase more economical over ${expectedDuration} months`,
          "Build equity in the asset"
        ];
      }
    }

    return {
      decision,
      confidence,
      reasoning,
      alternativeWorth: data.alternatives?.length > 0,
      breakEvenMonths: Math.round(breakEvenMonths)
    };
  }

  /**
   * Calculate break-even point
   */
  _calculateBreakEven(purchasePrice, monthlyRentalPrice) {
    return {
      months: Math.round(purchasePrice / monthlyRentalPrice),
      description: `After this point, buying becomes more economical`
    };
  }

  /**
   * Normalize rental price to monthly
   */
  _normalizeToMonthly(price, period) {
    const multipliers = {
      'day': 30,
      'week': 4.33,
      'month': 1,
      'year': 1/12
    };
    return price * multipliers[period];
  }

  /**
   * Calculate monthly usage frequency
   */
  _calculateMonthlyUsage(frequency, times) {
    const multipliers = {
      'daily': 30,
      'weekly': 4.33,
      'monthly': 1,
      'yearly': 1/12
    };
    return Math.round(times * multipliers[frequency]);
  }

  /**
   * Generate human-readable summary
   */
  _generateSummary(data) {
    const { itemName, buyAnalysis, rentAnalysis, recommendation, expectedDuration } = data;

    return `
📊 ${itemName} - ${expectedDuration} Month Analysis

BUY:  $${buyAnalysis.totalCost.toLocaleString()} total ($${buyAnalysis.monthlyEquivalent}/month)
RENT: $${rentAnalysis.totalCost.toLocaleString()} total ($${rentAnalysis.monthlyEquivalent}/month)

💡 RECOMMENDATION: ${recommendation.decision} (${Math.round(recommendation.confidence * 100)}% confidence)

Reasoning:
${recommendation.reasoning.map(r => `  ✓ ${r}`).join('\n')}
    `.trim();
  }
}

// ============================================
// USAGE EXAMPLES
// ============================================

function demonstrateDecisionCalculator() {
  console.log("=== Decision Calculator Demo ===\n");

  const calculator = new DecisionCalculator();

  // Example 1: Professional Camera
  console.log("1. SCENARIO: Professional Camera");
  console.log("=".repeat(70));

  const example1 = calculator.analyze({
    itemName: "Professional Camera",
    category: "Photography Equipment",
    purchasePrice: 2500,
    rentalPrice: 150,
    rentalPeriod: 'day',
    expectedDuration: 12,
    usageFrequency: 'monthly',
    usageTimes: 2,
    maintenanceCostAnnual: 200,
    depreciationRate: 0.20,
    hasTrialAvailable: false,
    uncertainNeed: false
  });

  console.log(example1.summary);
  console.log("\nAlternatives to consider:");
  example1.alternatives.forEach(alt => {
    console.log(`  → ${alt.name} (${alt.type})`);
    console.log(`    ${alt.description}`);
    if (alt.savings) {
      console.log(`    Potential savings: ${Math.round(alt.savings * 100)}%`);
    }
  });

  // Example 2: Business Laptop
  console.log("\n\n2. SCENARIO: Business Laptop");
  console.log("=".repeat(70));

  const example2 = calculator.analyze({
    itemName: "MacBook Pro 16\"",
    category: "Computing",
    purchasePrice: 2499,
    rentalPrice: 150,
    rentalPeriod: 'month',
    expectedDuration: 36,
    usageFrequency: 'daily',
    usageTimes: 8,
    maintenanceCostAnnual: 0,
    depreciationRate: 0.25,
    hasTrialAvailable: true,
    trialDuration: 14,
    uncertainNeed: false
  });

  console.log(example2.summary);

  // Example 3: Uncertain Purchase
  console.log("\n\n3. SCENARIO: Expensive Tool (Uncertain Need)");
  console.log("=".repeat(70));

  const example3 = calculator.analyze({
    itemName: "Professional 3D Printer",
    category: "Manufacturing Equipment",
    purchasePrice: 3500,
    rentalPrice: 200,
    rentalPeriod: 'month',
    expectedDuration: 6,
    usageFrequency: 'weekly',
    usageTimes: 1,
    maintenanceCostAnnual: 500,
    depreciationRate: 0.30,
    hasTrialAvailable: true,
    trialDuration: 7,
    uncertainNeed: true
  });

  console.log(example3.summary);
  if (example3.recommendation.nextStep) {
    console.log(`\n📋 Next Step: ${example3.recommendation.nextStep}`);
  }

  // Example 4: Short-term Rental Obvious
  console.log("\n\n4. SCENARIO: Power Tool (Short-term Project)");
  console.log("=".repeat(70));

  const example4 = calculator.analyze({
    itemName: "Industrial Concrete Mixer",
    category: "Construction Equipment",
    purchasePrice: 1200,
    rentalPrice: 75,
    rentalPeriod: 'day',
    expectedDuration: 1,
    usageFrequency: 'monthly',
    usageTimes: 3,
    maintenanceCostAnnual: 0,
    depreciationRate: 0.15,
    hasTrialAvailable: false,
    uncertainNeed: false
  });

  console.log(example4.summary);
}

// Run demo
if (require.main === module) {
  demonstrateDecisionCalculator();
}

module.exports = { DecisionCalculator };
