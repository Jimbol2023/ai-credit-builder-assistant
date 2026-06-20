export const DISCLAIMER =
  'This tool does not provide financial, legal, credit repair, lending, tax, or professional advice. Users should consult qualified professionals before making financial decisions.';

export const allowedValues = {
  scoreRange: ['300-579', '580-669', '670-739', '740-799', '800-850'],
  paymentHistory: ['excellent', 'good', 'fair', 'poor'],
  utilizationRange: ['0-9', '10-29', '30-49', '50-74', '75-100'],
  recentLatePayments: ['none', 'one', 'multiple'],
  creditGoal: [
    'build-score',
    'prepare-mortgage',
    'lower-utilization',
    'recover-late-payments',
    'learn-credit'
  ],
  timeline: ['30-days', '60-days', '90-days', '6-months']
};

const scoreLabels = {
  '300-579': 'deep subprime or rebuilding range',
  '580-669': 'fair range',
  '670-739': 'good range',
  '740-799': 'very good range',
  '800-850': 'excellent range'
};

const goalLabels = {
  'build-score': 'build your score',
  'prepare-mortgage': 'prepare for a mortgage conversation',
  'lower-utilization': 'lower revolving utilization',
  'recover-late-payments': 'recover from recent late payments',
  'learn-credit': 'learn how credit works'
};

export function validateAssessment(payload = {}) {
  const errors = [];

  for (const [field, values] of Object.entries(allowedValues)) {
    if (!payload[field]) {
      errors.push(`${field} is required.`);
    } else if (!values.includes(payload[field])) {
      errors.push(`${field} is invalid.`);
    }
  }

  if (payload.accountCount === undefined || payload.accountCount === null || payload.accountCount === '') {
    errors.push('accountCount is required.');
  } else if (
    typeof payload.accountCount !== 'number' ||
    !Number.isFinite(payload.accountCount) ||
    payload.accountCount < 0 ||
    payload.accountCount > 60
  ) {
    errors.push('accountCount must be a number between 0 and 60.');
  }

  return errors;
}

export function buildRecommendation(input) {
  const utilizationHigh = ['30-49', '50-74', '75-100'].includes(input.utilizationRange);
  const utilizationVeryHigh = ['50-74', '75-100'].includes(input.utilizationRange);
  const hasLatePayments = input.recentLatePayments !== 'none' || ['fair', 'poor'].includes(input.paymentHistory);
  const thinFile = input.accountCount <= 2;
  const strongScore = ['740-799', '800-850'].includes(input.scoreRange);

  const riskAreas = [];
  if (utilizationHigh) {
    riskAreas.push('Utilization may be weighing on available credit capacity and score movement.');
  }
  if (hasLatePayments) {
    riskAreas.push('Recent or repeated late payments can remain influential in many scoring models.');
  }
  if (thinFile) {
    riskAreas.push('A limited number of accounts may make the profile more sensitive to changes.');
  }
  if (!riskAreas.length) {
    riskAreas.push('No major risk area was flagged from these inputs; continue monitoring reports and habits.');
  }

  const keyFactors = [
    `Score range is currently in the ${scoreLabels[input.scoreRange]}.`,
    `Payment history is marked as ${input.paymentHistory}, which is commonly one of the most important factors.`,
    `Utilization is in the ${input.utilizationRange}% range.`,
    `${input.accountCount} credit account${input.accountCount === 1 ? '' : 's'} reported by the user.`
  ];

  const nextSteps = [
    'Set calendar reminders or autopay safeguards for every minimum payment due date.',
    'Review credit reports for accuracy through official reporting channels.',
    'Track balances before statement closing dates, not only before due dates.'
  ];

  if (utilizationHigh) {
    nextSteps.push('Prioritize reducing revolving balances before applying for new credit.');
  }
  if (utilizationVeryHigh) {
    nextSteps.push('Consider a focused balance paydown plan before taking on additional obligations.');
  }
  if (hasLatePayments) {
    nextSteps.push('Document payment due dates and build a cash-flow buffer around recurring bills.');
  }
  if (strongScore) {
    nextSteps.push('Protect current progress by avoiding unnecessary hard inquiries and missed payments.');
  }

  return {
    disclaimer: DISCLAIMER,
    profileSummary: `Based on the provided inputs, your profile appears focused on the goal to ${goalLabels[input.creditGoal]} within a ${input.timeline.replace('-', ' ')} timeline. This educational plan emphasizes payment consistency, utilization awareness, account monitoring, and realistic habit-building.`,
    keyFactors,
    riskAreas,
    nextSteps,
    actionPlan: [
      {
        period: '30 Days',
        tasks: [
          'Pull and review credit reports for unfamiliar accounts, balances, and payment status.',
          'Create a due-date calendar for every active account.',
          utilizationHigh
            ? 'Choose one revolving balance to target for an initial utilization reduction.'
            : 'Keep revolving balances low and avoid unnecessary new charges.'
        ]
      },
      {
        period: '60 Days',
        tasks: [
          'Compare statement balances with the plan and adjust spending categories.',
          'Build a small payment buffer before each due date.',
          thinFile
            ? 'Learn how account age and account mix can affect thin credit profiles.'
            : 'Continue monitoring account age, balances, and inquiry activity.'
        ]
      },
      {
        period: '90 Days',
        tasks: [
          'Review progress against the original score range, utilization range, and payment habits.',
          'Refresh the next 90-day plan based on what changed.',
          'Prepare questions for a qualified professional before making major borrowing decisions.'
        ]
      }
    ],
    educationalResources: [
      'Consumer Financial Protection Bureau credit reports and scores resources.',
      'AnnualCreditReport.com for official access to free credit reports.',
      'FTC guidance on avoiding credit repair scams.',
      'Creditor hardship or payment assistance pages when cash flow changes.'
    ]
  };
}
