/**
 * CleverCost - Main Application
 * Connects autocomplete and calculator with UI
 */

// Initialize
const autocomplete = new IntelligentAutocomplete();
const calculator = new DecisionCalculator();

let selectedCategory = null;
let currentKeyboardIndex = -1;

// DOM Elements
const itemNameInput = document.getElementById('itemName');
const categoryInput = document.getElementById('category');
const autocompleteResults = document.getElementById('autocompleteResults');
const calculatorForm = document.getElementById('calculatorForm');
const resultsSection = document.getElementById('resultsSection');
const toggleAdvancedBtn = document.getElementById('toggleAdvanced');
const advancedOptions = document.getElementById('advancedOptions');
const recalculateBtn = document.getElementById('recalculateBtn');
const shareBtn = document.getElementById('shareBtn');
const paymentMethodSelect = document.getElementById('paymentMethod');
const financingOptions = document.getElementById('financingOptions');

// Load categories
autocomplete.loadCategories(DEFAULT_CATEGORIES);

// ==========================================
// Autocomplete Functionality
// ==========================================

itemNameInput.addEventListener('input', (e) => {
  const query = e.target.value;
  handleAutocomplete(query);
});

itemNameInput.addEventListener('keydown', (e) => {
  const items = autocompleteResults.querySelectorAll('.autocomplete-item');

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    currentKeyboardIndex = Math.min(currentKeyboardIndex + 1, items.length - 1);
    updateKeyboardSelection(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    currentKeyboardIndex = Math.max(currentKeyboardIndex - 1, -1);
    updateKeyboardSelection(items);
  } else if (e.key === 'Enter' && currentKeyboardIndex >= 0) {
    e.preventDefault();
    items[currentKeyboardIndex].click();
  } else if (e.key === 'Escape') {
    hideAutocomplete();
  }
});

// Close autocomplete when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.autocomplete-wrapper')) {
    hideAutocomplete();
  }
});

function handleAutocomplete(query) {
  if (query.length === 0) {
    hideAutocomplete();
    return;
  }

  const results = autocomplete.search(query, 5);

  if (results.length === 0) {
    hideAutocomplete();
    return;
  }

  displayAutocompleteResults(results);
  currentKeyboardIndex = -1;
}

function displayAutocompleteResults(results) {
  autocompleteResults.innerHTML = '';

  results.forEach((result, index) => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    item.innerHTML = `
      <div class="autocomplete-name">${result.icon} ${result.name}</div>
      <div class="autocomplete-details">
        Avg: $${result.averagePrice?.toLocaleString() || 'N/A'} |
        ~$${result.monthlyCost || 'N/A'}/month
      </div>
    `;

    item.addEventListener('click', () => selectCategory(result));
    autocompleteResults.appendChild(item);
  });

  autocompleteResults.classList.add('active');
}

function selectCategory(category) {
  selectedCategory = category;

  // Fill in form fields
  itemNameInput.value = category.name;
  categoryInput.value = category.name;

  // Auto-fill price if available
  if (category.averagePrice) {
    document.getElementById('purchasePrice').value = category.averagePrice;
  }

  // Auto-fill rental estimate if available
  if (category.rentalPriceEstimate) {
    document.getElementById('rentalPrice').value = category.rentalPriceEstimate;
  }

  hideAutocomplete();
}

function hideAutocomplete() {
  autocompleteResults.classList.remove('active');
  currentKeyboardIndex = -1;
}

function updateKeyboardSelection(items) {
  items.forEach((item, index) => {
    if (index === currentKeyboardIndex) {
      item.classList.add('selected');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('selected');
    }
  });
}

// ==========================================
// Payment Method Toggle
// ==========================================

paymentMethodSelect.addEventListener('change', (e) => {
  const isFinancing = e.target.value === 'finance';
  financingOptions.style.display = isFinancing ? 'block' : 'none';
});

// ==========================================
// Advanced Options Toggle
// ==========================================

toggleAdvancedBtn.addEventListener('click', () => {
  const isVisible = advancedOptions.style.display !== 'none';

  if (isVisible) {
    advancedOptions.style.display = 'none';
    toggleAdvancedBtn.classList.remove('active');
  } else {
    advancedOptions.style.display = 'block';
    toggleAdvancedBtn.classList.add('active');
  }
});

// ==========================================
// Form Submission & Calculation
// ==========================================

calculatorForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(calculatorForm);
  const data = {
    itemName: formData.get('itemName'),
    category: formData.get('category') || 'General',
    purchasePrice: parseFloat(formData.get('purchasePrice')),
    rentalPrice: parseFloat(formData.get('rentalPrice')),
    rentalPeriod: formData.get('rentalPeriod'),
    expectedDuration: parseInt(formData.get('expectedDuration')),
    usageFrequency: formData.get('usageFrequency'),
    usageTimes: parseInt(formData.get('usageTimes')),
    maintenanceCostAnnual: parseFloat(formData.get('maintenanceCost')) || 0,
    depreciationRate: parseFloat(formData.get('depreciationRate')) / 100 || 0.15,
    uncertainNeed: formData.get('uncertainNeed') === 'on',
    // Financing parameters
    paymentMethod: formData.get('paymentMethod'),
    downPayment: parseFloat(formData.get('downPayment')) || 0,
    interestRate: parseFloat(formData.get('interestRate')) || 0,
    loanTerm: parseInt(formData.get('loanTerm')) || 36,
    insuranceCost: parseFloat(formData.get('insuranceCost')) || 0,
    maintenanceCostMonthly: parseFloat(formData.get('maintenanceCostMonthly')) || 0
  };

  // Perform calculation
  const result = calculator.analyze(data);

  // Display results
  displayResults(result);

  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth' });
});

// ==========================================
// Display Results
// ==========================================

function displayResults(result) {
  const { recommendation, buyAnalysis, rentAnalysis, alternatives, breakEven, financing } = result;

  // Show results section
  resultsSection.style.display = 'block';

  // Recommendation Card
  displayRecommendation(recommendation);

  // Financing Breakdown (if using financing)
  if (financing.enabled && financing.details) {
    displayFinancingBreakdown(financing.details);
  } else {
    document.getElementById('financingBreakdown').style.display = 'none';
  }

  // Buy Card
  displayBuyAnalysis(buyAnalysis);

  // Rent Card
  displayRentAnalysis(rentAnalysis);

  // Reasoning
  displayReasoning(recommendation, breakEven);

  // Alternatives
  if (alternatives && alternatives.length > 0) {
    displayAlternatives(alternatives);
  } else {
    document.getElementById('alternativesSection').style.display = 'none';
  }
}

function displayRecommendation(recommendation) {
  const card = document.getElementById('recommendationCard');
  const badge = document.getElementById('recommendationBadge');
  const title = document.getElementById('recommendationTitle');
  const confidenceFill = document.getElementById('confidenceFill');
  const confidenceText = document.getElementById('confidenceText');

  // Update card class
  card.className = `recommendation-card ${recommendation.decision.toLowerCase()}`;

  // Update badge
  badge.textContent = `RECOMMENDATION: ${recommendation.decision}`;

  // Update title
  const emoji = {
    'BUY': '💵',
    'RENT': '📅',
    'TEST': '🧪'
  };
  title.textContent = `${emoji[recommendation.decision]} ${recommendation.decision}`;

  // Update confidence
  const confidencePercent = Math.round(recommendation.confidence * 100);
  confidenceFill.style.width = `${confidencePercent}%`;
  confidenceText.textContent = `${confidencePercent}% Confidence`;
}

function displayBuyAnalysis(buyAnalysis) {
  document.getElementById('buyTotalCost').textContent = `$${buyAnalysis.totalCost.toLocaleString()}`;
  document.getElementById('buyMonthlyCost').textContent = `$${buyAnalysis.monthlyEquivalent}/mo`;
  document.getElementById('buyResaleValue').textContent = `$${buyAnalysis.resaleValue.toLocaleString()}`;

  const prosList = document.getElementById('buyPros');
  prosList.innerHTML = '';
  buyAnalysis.pros.forEach(pro => {
    const li = document.createElement('li');
    li.textContent = pro;
    prosList.appendChild(li);
  });

  const consList = document.getElementById('buyCons');
  consList.innerHTML = '';
  buyAnalysis.cons.forEach(con => {
    const li = document.createElement('li');
    li.textContent = con;
    consList.appendChild(li);
  });
}

function displayRentAnalysis(rentAnalysis) {
  document.getElementById('rentTotalCost').textContent = `$${rentAnalysis.totalCost.toLocaleString()}`;
  document.getElementById('rentMonthlyCost').textContent = `$${rentAnalysis.monthlyEquivalent}/mo`;
  document.getElementById('rentCostPerUse').textContent = `$${rentAnalysis.costPerUse}`;

  const prosList = document.getElementById('rentPros');
  prosList.innerHTML = '';
  rentAnalysis.pros.forEach(pro => {
    const li = document.createElement('li');
    li.textContent = pro;
    prosList.appendChild(li);
  });

  const consList = document.getElementById('rentCons');
  consList.innerHTML = '';
  rentAnalysis.cons.forEach(con => {
    const li = document.createElement('li');
    li.textContent = con;
    consList.appendChild(li);
  });
}

function displayReasoning(recommendation, breakEven) {
  const reasoningList = document.getElementById('reasoningList');
  reasoningList.innerHTML = '';

  recommendation.reasoning.forEach(reason => {
    const li = document.createElement('li');
    li.textContent = reason;
    reasoningList.appendChild(li);
  });

  const breakEvenText = document.getElementById('breakEvenText');
  breakEvenText.textContent = `⚖️ Break-even point: ${breakEven.months} months. ${breakEven.description}`;
}

function displayFinancingBreakdown(details) {
  const breakdownSection = document.getElementById('financingBreakdown');
  breakdownSection.style.display = 'block';

  document.getElementById('financeMonthlyPayment').textContent = `$${details.monthlyPayment}`;
  document.getElementById('financeTotalInterest').textContent = `$${details.totalInterest.toLocaleString()}`;
  document.getElementById('financeInsurance').textContent = `$${details.insuranceMonthly}`;
  document.getElementById('financeMaintenance').textContent = `$${details.maintenanceMonthly}`;
  document.getElementById('financeTotalMonthly').textContent = `$${details.totalMonthlyPayment}`;
  document.getElementById('financeExtraCost').textContent = `$${details.totalInterest.toLocaleString()}`;
}

function displayAlternatives(alternatives) {
  const alternativesSection = document.getElementById('alternativesSection');
  const alternativesGrid = document.getElementById('alternativesGrid');

  alternativesSection.style.display = 'block';
  alternativesGrid.innerHTML = '';

  alternatives.forEach(alt => {
    const item = document.createElement('div');
    item.className = 'alternative-item';
    item.innerHTML = `
      <div class="alternative-name">${alt.name}</div>
      <div class="alternative-type">${alt.type}</div>
      <div class="alternative-description">${alt.description}</div>
    `;
    alternativesGrid.appendChild(item);
  });
}

// ==========================================
// Actions
// ==========================================

recalculateBtn.addEventListener('click', () => {
  resultsSection.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  calculatorForm.reset();
  itemNameInput.focus();
});

shareBtn.addEventListener('click', () => {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({
      title: 'CleverCost Analysis',
      text: 'Check out my cost analysis from CleverCost!',
      url: url
    }).catch(err => console.log('Error sharing:', err));
  } else {
    // Fallback: Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.log('Error copying:', err);
      alert('Please copy the URL manually: ' + url);
    });
  }
});

// ==========================================
// Initialize
// ==========================================

// Focus on item name input
itemNameInput.focus();

console.log('CleverCost initialized! 💰');
