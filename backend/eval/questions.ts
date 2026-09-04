// 15 natural-language questions, each with the call that answers it and a
// distinctive phrase that should appear in the returned context.
export interface Question {
  query: string;
  call: string;
  expect: string;
}

export const QUESTIONS: Question[] = [
  // northwind-sales-call
  { query: "what is the customer's biggest concern about buying", call: 'northwind-sales-call', expect: 'per-seat cost adds up' },
  { query: 'is there a discount for bigger teams', call: 'northwind-sales-call', expect: 'volume pricing' },
  { query: 'does the product support single sign-on', call: 'northwind-sales-call', expect: 'SAML SSO' },
  { query: 'when does the customer want to get started', call: 'northwind-sales-call', expect: 'start in Q2' },

  // acme-support-call
  { query: "the customer's dashboard will not load", call: 'acme-support-call', expect: 'shows a spinner' },
  { query: 'was the outage the customer fault or ours', call: 'acme-support-call', expect: "it's our issue" },
  { query: 'does the customer have a deadline today', call: 'acme-support-call', expect: 'board meeting at 3pm' },

  // long-onboarding-call
  { query: 'how will the customer data be moved over', call: 'long-onboarding-call', expect: 'live connector' },
  { query: 'how to handle hundreds of user accounts', call: 'long-onboarding-call', expect: 'SCIM provisioning' },
  { query: 'when does the customer financial year begin', call: 'long-onboarding-call', expect: 'start the year in February' },
  { query: 'what network access is required for the integration', call: 'long-onboarding-call', expect: 'port 443' },

  // retention-call
  { query: 'is the customer planning to cancel', call: 'retention-call', expect: 'going to renew' },
  { query: 'what alternatives to cancelling were offered', call: 'retention-call', expect: 'starter plan' },

  // feature-request-call
  { query: 'can you export reports as pdf', call: 'feature-request-call', expect: 'print to PDF' },
  { query: 'problem with timezones in scheduled emails', call: 'feature-request-call', expect: 'wrong timestamps' },
];
