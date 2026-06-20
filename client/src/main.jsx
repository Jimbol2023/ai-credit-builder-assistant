import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const DISCLAIMER =
  'This tool does not provide financial, legal, credit repair, lending, tax, or professional advice. Users should consult qualified professionals before making financial decisions.';

const initialForm = {
  scoreRange: '',
  paymentHistory: '',
  utilizationRange: '',
  accountCount: '',
  recentLatePayments: '',
  creditGoal: '',
  timeline: ''
};

const fields = [
  {
    id: 'scoreRange',
    label: 'Current credit score range',
    type: 'select',
    options: [
      ['300-579', '300-579'],
      ['580-669', '580-669'],
      ['670-739', '670-739'],
      ['740-799', '740-799'],
      ['800-850', '800-850']
    ]
  },
  {
    id: 'paymentHistory',
    label: 'Payment history',
    type: 'select',
    options: [
      ['excellent', 'Excellent: no missed payments'],
      ['good', 'Good: rare missed payments'],
      ['fair', 'Fair: a few missed payments'],
      ['poor', 'Poor: frequent missed payments']
    ]
  },
  {
    id: 'utilizationRange',
    label: 'Credit utilization range',
    type: 'select',
    options: [
      ['0-9', '0-9%'],
      ['10-29', '10-29%'],
      ['30-49', '30-49%'],
      ['50-74', '50-74%'],
      ['75-100', '75-100%']
    ]
  },
  {
    id: 'accountCount',
    label: 'Number of credit accounts',
    type: 'number',
    min: 0,
    max: 60,
    placeholder: '4'
  },
  {
    id: 'recentLatePayments',
    label: 'Recent late payments',
    type: 'select',
    options: [
      ['none', 'None in the last 24 months'],
      ['one', 'One recent late payment'],
      ['multiple', 'Multiple recent late payments']
    ]
  },
  {
    id: 'creditGoal',
    label: 'Credit goal',
    type: 'select',
    options: [
      ['build-score', 'Build my score'],
      ['prepare-mortgage', 'Prepare for a mortgage'],
      ['lower-utilization', 'Lower utilization'],
      ['recover-late-payments', 'Recover from late payments'],
      ['learn-credit', 'Learn how credit works']
    ]
  },
  {
    id: 'timeline',
    label: 'Timeline',
    type: 'select',
    options: [
      ['30-days', '30 days'],
      ['60-days', '60 days'],
      ['90-days', '90 days'],
      ['6-months', '6 months']
    ]
  }
];

function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const completedFields = useMemo(
    () => Object.values(form).filter((value) => String(value).trim()).length,
    [form]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          accountCount: Number(form.accountCount)
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to generate your action plan.');
      }

      setResult(data);
      setStatus('success');
    } catch (requestError) {
      setError(requestError.message);
      setStatus('error');
    }
  };

  return (
    <main>
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">Portfolio Project</p>
          <h1 id="page-title">AI Credit Builder Assistant</h1>
          <p>
            Create an educational 30/60/90 day action plan based on common credit factors,
            risk areas, and credit-building habits.
          </p>
        </div>
        <aside className="disclaimer" aria-label="Important disclaimer">
          <strong>Important disclaimer</strong>
          <span>{DISCLAIMER}</span>
        </aside>
      </section>

      <section className="workspace">
        <form className="planner-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <div>
              <p className="eyebrow">Assessment</p>
              <h2>Credit profile inputs</h2>
            </div>
            <span className="progress-pill">{completedFields}/7 complete</span>
          </div>

          <div className="form-grid">
            {fields.map((field) => (
              <label key={field.id} htmlFor={field.id}>
                <span>{field.label}</span>
                {field.type === 'select' ? (
                  <select
                    id={field.id}
                    name={field.id}
                    value={form[field.id]}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select an option</option>
                    {field.options.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    min={field.min}
                    max={field.max}
                    placeholder={field.placeholder}
                    value={form[field.id]}
                    onChange={handleChange}
                    required
                  />
                )}
              </label>
            ))}
          </div>

          <button className="primary-button" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Generating plan...' : 'Generate action plan'}
          </button>
          {status === 'error' && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}
        </form>

        <section className="results-panel" aria-live="polite" aria-label="Generated credit plan">
          {!result && (
            <div className="empty-state">
              <p className="eyebrow">Output</p>
              <h2>Your educational plan appears here</h2>
              <p>
                Complete the assessment to generate a profile summary, key factors, risk areas,
                next steps, and a practical 30/60/90 day action plan.
              </p>
            </div>
          )}
          {result && <Results data={result} />}
        </section>
      </section>
    </main>
  );
}

function Results({ data }) {
  return (
    <div className="results">
      <div className="result-header">
        <p className="eyebrow">Generated guidance</p>
        <h2>Educational credit-building plan</h2>
        <p>{data.disclaimer}</p>
      </div>

      <ResultBlock title="Credit Profile Summary" items={[data.profileSummary]} />
      <ResultBlock title="Key Credit Factors" items={data.keyFactors} />
      <ResultBlock title="Possible Risk Areas" items={data.riskAreas} />
      <ResultBlock title="Suggested Next Steps" items={data.nextSteps} />

      <section className="timeline" aria-labelledby="timeline-title">
        <h3 id="timeline-title">30/60/90 Day Action Plan</h3>
        <div className="timeline-grid">
          {data.actionPlan.map((phase) => (
            <article key={phase.period}>
              <span>{phase.period}</span>
              <ul>
                {phase.tasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <ResultBlock title="Educational Resources" items={data.educationalResources} />
    </div>
  );
}

function ResultBlock({ title, items }) {
  return (
    <section className="result-block">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);
