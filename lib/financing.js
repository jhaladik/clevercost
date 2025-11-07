/**
 * Financing Calculator
 * Handles loan calculations, interest, and total cost of ownership
 */

class FinancingCalculator {
  constructor() {
    // Default financing terms by category
    this.defaultTerms = {
      "Transportation": { apr: 7.0, term: 60, insurance: 200, maintenance: 150 },
      "Computing": { apr: 0, term: 24, insurance: 0, maintenance: 50 },
      "Photography Equipment": { apr: 12.0, term: 36, insurance: 30, maintenance: 100 },
      "default": { apr: 10.0, term: 36, insurance: 0, maintenance: 50 }
    };
  }

  /**
   * Calculate monthly loan payment using amortization formula
   * P × [r(1+r)^n] / [(1+r)^n-1]
   */
  calculateMonthlyPayment(principal, annualRate, months) {
    if (annualRate === 0) {
      // 0% financing
      return principal / months;
    }

    const monthlyRate = annualRate / 100 / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
                    (Math.pow(1 + monthlyRate, months) - 1);

    return payment;
  }

  /**
   * Calculate total interest paid over loan term
   */
  calculateTotalInterest(principal, annualRate, months) {
    const monthlyPayment = this.calculateMonthlyPayment(principal, annualRate, months);
    const totalPaid = monthlyPayment * months;
    return totalPaid - principal;
  }

  /**
   * Calculate total cost of ownership with financing
   */
  calculateTotalOwnershipCost(params) {
    const {
      purchasePrice,
      paymentMethod = 'cash',
      downPayment = 0,
      interestRate = 0,
      loanTerm = 36,
      insuranceMonthly = 0,
      maintenanceMonthly = 0,
      durationMonths = 36,
      depreciationRate = 0.15
    } = params;

    // Calculate loan details
    const loanAmount = purchasePrice - downPayment;
    let monthlyPayment = 0;
    let totalInterest = 0;

    if (paymentMethod === 'finance' && loanAmount > 0) {
      monthlyPayment = this.calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
      totalInterest = this.calculateTotalInterest(loanAmount, interestRate, loanTerm);
    }

    // Calculate monthly costs
    const totalMonthlyPayment = monthlyPayment + insuranceMonthly + maintenanceMonthly;

    // Calculate costs over ownership period
    const paymentPeriod = Math.min(loanTerm, durationMonths);
    const totalLoanPayments = monthlyPayment * paymentPeriod;
    const totalInsurance = insuranceMonthly * durationMonths;
    const totalMaintenance = maintenanceMonthly * durationMonths;

    // Calculate depreciation and resale value
    const years = durationMonths / 12;
    const depreciation = purchasePrice * depreciationRate * years;
    const resaleValue = Math.max(0, purchasePrice - depreciation);

    // Total cost calculation
    const totalPaid = downPayment + totalLoanPayments + totalInsurance + totalMaintenance;
    const netCost = totalPaid - resaleValue;

    return {
      paymentMethod,
      downPayment: Math.round(downPayment),
      loanAmount: Math.round(loanAmount),
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      insuranceMonthly: Math.round(insuranceMonthly),
      maintenanceMonthly: Math.round(maintenanceMonthly),
      totalMonthlyPayment: Math.round(totalMonthlyPayment),
      totalLoanPayments: Math.round(totalLoanPayments),
      totalInsurance: Math.round(totalInsurance),
      totalMaintenance: Math.round(totalMaintenance),
      totalPaid: Math.round(totalPaid),
      resaleValue: Math.round(resaleValue),
      netCost: Math.round(netCost),
      monthlyEquivalent: Math.round(netCost / durationMonths),
      savingsVsCash: paymentMethod === 'finance' ? Math.round(totalInterest) : 0
    };
  }

  /**
   * Compare financing options
   */
  compareFinancingOptions(purchasePrice, durationMonths) {
    const options = [
      {
        name: "Pay Cash",
        method: "cash",
        interestRate: 0,
        term: 0,
        description: "Best option if you have the money"
      },
      {
        name: "0% Financing (24 months)",
        method: "finance",
        interestRate: 0,
        term: 24,
        description: "Promotional rate - no interest"
      },
      {
        name: "Low Interest Loan (5% APR, 36 months)",
        method: "finance",
        interestRate: 5,
        term: 36,
        description: "Good credit rate"
      },
      {
        name: "Standard Loan (10% APR, 36 months)",
        method: "finance",
        interestRate: 10,
        term: 36,
        description: "Average rate"
      },
      {
        name: "Credit Card (19% APR, 24 months)",
        method: "finance",
        interestRate: 19,
        term: 24,
        description: "Expensive - avoid if possible"
      }
    ];

    return options.map(option => {
      const cost = this.calculateTotalOwnershipCost({
        purchasePrice,
        paymentMethod: option.method,
        downPayment: 0,
        interestRate: option.interestRate,
        loanTerm: option.term || durationMonths,
        insuranceMonthly: 0,
        maintenanceMonthly: 0,
        durationMonths: Math.min(option.term || durationMonths, durationMonths),
        depreciationRate: 0.15
      });

      return {
        ...option,
        monthlyPayment: cost.monthlyPayment,
        totalInterest: cost.totalInterest,
        totalCost: cost.totalPaid,
        recommendation: option.interestRate === 0 ? "✅ Recommended" :
                       option.interestRate <= 5 ? "👍 Good" :
                       option.interestRate <= 12 ? "⚠️ Acceptable" :
                       "❌ Avoid"
      };
    });
  }

  /**
   * Get smart financing recommendations
   */
  getFinancingRecommendations(purchasePrice, monthlyBudget, durationMonths) {
    const recommendations = [];

    // Calculate what they can afford
    const maxLoanWithBudget = this._calculateMaxLoan(monthlyBudget, 10, 36);

    if (purchasePrice > monthlyBudget * 12) {
      recommendations.push({
        type: "save",
        message: `Consider saving for ${Math.ceil(purchasePrice / monthlyBudget)} months to pay cash`,
        priority: "high"
      });
    }

    if (purchasePrice <= maxLoanWithBudget) {
      recommendations.push({
        type: "finance",
        message: "You can afford this with standard financing",
        priority: "medium"
      });
    }

    // Check for 0% financing value
    const zeroPercentValue = this.calculateTotalInterest(purchasePrice, 10, 36);
    if (zeroPercentValue > 200) {
      recommendations.push({
        type: "promo",
        message: `Look for 0% financing - could save $${Math.round(zeroPercentValue)}`,
        priority: "high"
      });
    }

    // Suggest alternatives if expensive
    if (purchasePrice > monthlyBudget * 24) {
      recommendations.push({
        type: "alternative",
        message: "This is very expensive for your budget - consider cheaper alternatives",
        priority: "high"
      });
    }

    return recommendations;
  }

  /**
   * Calculate maximum loan amount for given monthly payment
   */
  _calculateMaxLoan(monthlyPayment, annualRate, months) {
    const monthlyRate = annualRate / 100 / 12;
    const maxLoan = monthlyPayment * (Math.pow(1 + monthlyRate, months) - 1) /
                    (monthlyRate * Math.pow(1 + monthlyRate, months));
    return maxLoan;
  }

  /**
   * Get default financing terms for category
   */
  getDefaultTerms(category) {
    return this.defaultTerms[category] || this.defaultTerms.default;
  }

  /**
   * Calculate usage-based crosspoint
   * At what usage frequency does each option make sense?
   */
  calculateUsageCrosspoint(purchasePrice, rentalPriceMonthly, financingCost) {
    // This helps determine: "If I use it less than X days/month, rent. More than X, buy."
    const monthlyOwnershipCost = financingCost.totalMonthlyPayment;

    // Simple crosspoint: when is rental cheaper than ownership?
    const crosspoint = {
      breakEvenMonths: Math.ceil(purchasePrice / rentalPriceMonthly),
      monthlyComparison: {
        ownership: monthlyOwnershipCost,
        rental: rentalPriceMonthly,
        difference: Math.abs(monthlyOwnershipCost - rentalPriceMonthly)
      },
      recommendation: monthlyOwnershipCost < rentalPriceMonthly ?
        "Ownership costs less per month" :
        "Rental costs less per month"
    };

    return crosspoint;
  }
}
