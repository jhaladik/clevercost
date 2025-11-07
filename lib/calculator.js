/**
 * Decision Calculator for Browser
 * Analyzes Buy vs Rent vs Test vs Alternatives
 */

class DecisionCalculator {
  constructor() {
    this.thresholds = {
      testRecommendationPrice: 1000,
      shortTermMonths: 6,
      longTermMonths: 24,
      highUsagePerWeek: 3,
      rapidDepreciationRate: 0.3
    };
    this.financingCalc = new FinancingCalculator();
  }

  /**
   * Main analysis function
   */
  analyze(params) {
    const {
      itemName,
      category,
      purchasePrice,
      rentalPrice,
      rentalPeriod = 'month',
      expectedDuration,
      usageFrequency = 'weekly',
      usageTimes = 1,
      maintenanceCostAnnual = 0,
      depreciationRate = 0.15,
      hasTrialAvailable = false,
      trialDuration = 0,
      uncertainNeed = false,
      // Financing params
      paymentMethod = 'cash',
      downPayment = 0,
      interestRate = 0,
      loanTerm = 36,
      insuranceCost = 0,
      maintenanceCostMonthly = 0
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
      depreciationRate,
      {
        paymentMethod,
        downPayment,
        interestRate,
        loanTerm,
        insuranceCost,
        maintenanceCostMonthly
      }
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
      financing: {
        enabled: paymentMethod === 'finance',
        details: buyAnalysis.paymentMethod === 'finance' ? {
          monthlyPayment: buyAnalysis.monthlyPayment,
          totalInterest: buyAnalysis.totalInterest,
          insuranceMonthly: buyAnalysis.insuranceMonthly,
          maintenanceMonthly: buyAnalysis.maintenanceMonthly,
          totalMonthlyPayment: buyAnalysis.totalMonthlyPayment
        } : null
      }
    };
  }

  /**
   * Analyze BUY option
   */
  _analyzeBuy(price, durationMonths, maintenanceAnnual, depreciationRate, financingParams = {}) {
    const {
      paymentMethod = 'cash',
      downPayment = 0,
      interestRate = 0,
      loanTerm = 36,
      insuranceCost = 0,
      maintenanceCostMonthly = 0
    } = financingParams;

    // Use financing calculator for detailed costs
    const financingDetails = this.financingCalc.calculateTotalOwnershipCost({
      purchasePrice: price,
      paymentMethod,
      downPayment,
      interestRate,
      loanTerm,
      insuranceMonthly: insuranceCost,
      maintenanceMonthly: maintenanceCostMonthly || (maintenanceAnnual / 12),
      durationMonths,
      depreciationRate
    });

    // Build pros and cons based on payment method
    const pros = [
      "Own the asset",
      paymentMethod === 'cash' ? "No debt or interest" : null,
      financingDetails.resaleValue > 0 ? `Can resell for ~$${financingDetails.resaleValue.toLocaleString()}` : null,
      "Unlimited usage",
      "Can customize/modify"
    ].filter(Boolean);

    const cons = [
      paymentMethod === 'cash' ? `High upfront cost ($${price.toLocaleString()})` : null,
      paymentMethod === 'finance' && financingDetails.totalInterest > 0 ?
        `Interest cost: $${financingDetails.totalInterest.toLocaleString()}` : null,
      paymentMethod === 'finance' ? `Monthly payment: $${financingDetails.totalMonthlyPayment}/mo` : null,
      "Responsible for maintenance",
      "Depreciation risk",
      "Storage/space required",
      "May become outdated"
    ].filter(Boolean);

    return {
      ...financingDetails,
      upfrontCost: financingDetails.downPayment || price,
      maintenanceCost: financingDetails.totalMaintenance,
      totalCost: financingDetails.totalPaid,
      netCost: financingDetails.netCost,
      pros,
      cons
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
    const alternativeDatabase = {
      "Photography Equipment": [
        {
          name: "Camera sharing platform",
          type: "service",
          description: "Rent from local photographers"
        },
        {
          name: "Smartphone with pro camera",
          type: "product",
          description: "Modern phones have excellent cameras"
        }
      ],
      "Computing": [
        {
          name: "Refurbished device",
          type: "product",
          description: "Certified refurbished with warranty"
        },
        {
          name: "Previous generation model",
          type: "product",
          description: "Often 95% of the performance"
        }
      ]
    };

    // Generic alternatives for all categories
    const genericAlternatives = [
      {
        name: "Buy used/refurbished",
        type: "product",
        description: "Save 30-50% with pre-owned options"
      },
      {
        name: "Share with others",
        type: "service",
        description: "Split costs with friends or coworkers"
      }
    ];

    return alternativeDatabase[category] || genericAlternatives;
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

    const breakEvenMonths = purchasePrice / rentAnalysis.monthlyPrice;

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
}
