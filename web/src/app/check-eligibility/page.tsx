import { getCurrentUser } from '@/lib/session';

interface SchemeEvaluation {
  scheme_id: string;
  scheme_name: string;
  decision: 'eligible' | 'ineligible';
  coverage: string;
  reasons: string[];
  required_documents: string[];
  citation: string;
}

async function evaluateSchemes(programme: string, income: number, cgpa: number): Promise<SchemeEvaluation[]> {
  try {
    const res = await fetch('http://localhost:4000/api/brand', { cache: 'no-store' });
  } catch {}

  // Run deterministic rules matching schemes.yaml
  const results: SchemeEvaluation[] = [];

  // 1. NBFA Tier 1 (Income <= 3,00,000, CGPA >= 5.5)
  const nbfa1Eligible = income <= 300000 && cgpa >= 5.5 && ['PGP', 'PGP-DBM', 'IPM'].includes(programme);
  results.push({
    scheme_id: 'nbfa_tier1',
    scheme_name: 'Need-Based Financial Assistance (Tier 1)',
    decision: nbfa1Eligible ? 'eligible' : 'ineligible',
    coverage: '100% Tuition Fee Waiver',
    reasons: [
      income <= 300000
        ? `Family income (INR ${income.toLocaleString('en-IN')}) is within the INR 3,00,000 ceiling.`
        : `Family income exceeds INR 3,00,000 limit.`,
      cgpa >= 5.5 ? `CGPA ${cgpa} satisfies minimum 5.5 requirement.` : `CGPA ${cgpa} is below minimum 5.5.`,
    ],
    required_documents: [
      'Government Income Certificate (valid within 12 months)',
      'Parent ITR-V / Form 16 for preceding FY',
      'Bank Account Statement (6 months)',
      'Income Affidavit on Non-Judicial Stamp Paper',
    ],
    citation: 'Scholarship Policy 2026-27, §3.1',
  });

  // 2. NBFA Tier 2 (Income <= 6,00,000, CGPA >= 5.5)
  const nbfa2Eligible = income > 300000 && income <= 600000 && cgpa >= 5.5 && ['PGP', 'PGP-DBM', 'IPM'].includes(programme);
  results.push({
    scheme_id: 'nbfa_tier2',
    scheme_name: 'Need-Based Financial Assistance (Tier 2)',
    decision: nbfa2Eligible ? 'eligible' : 'ineligible',
    coverage: '50% Tuition Fee Waiver',
    reasons: [
      income <= 600000
        ? `Family income (INR ${income.toLocaleString('en-IN')}) is within INR 6,00,000 ceiling.`
        : `Family income exceeds INR 6,00,000 limit.`,
      cgpa >= 5.5 ? `CGPA ${cgpa} meets academic threshold.` : `CGPA is below 5.5.`,
    ],
    required_documents: [
      'Government Income Certificate (valid within 12 months)',
      'Parent ITR-V / Form 16 for preceding FY',
      'Bank Account Statement (6 months)',
    ],
    citation: 'Scholarship Policy 2026-27, §3.2',
  });

  // 3. Director's Merit Scholarship (CGPA >= 8.5)
  const meritEligible = cgpa >= 8.5 && ['PGP', 'PGP-DBM'].includes(programme);
  results.push({
    scheme_id: 'merit_director',
    scheme_name: "Director's Merit Scholarship",
    decision: meritEligible ? 'eligible' : 'ineligible',
    coverage: 'INR 1,00,000 One-Time Merit Award',
    reasons: [
      cgpa >= 8.5
        ? `CGPA ${cgpa} satisfies the 8.5 threshold for top academic performance.`
        : `CGPA ${cgpa} is below the 8.5 merit cutoff.`,
      ['PGP', 'PGP-DBM'].includes(programme) ? `Enrolled in eligible postgraduate programme.` : `Programme not eligible.`,
    ],
    required_documents: [
      'Term I / Year I Official Grade Transcript',
      'Good Conduct Undertaking from Hostel Warden',
    ],
    citation: 'Merit Scholarship Rules, §2.1',
  });

  return results;
}

export default async function CheckEligibilityPage({
  searchParams,
}: {
  searchParams?: {
    step?: string;
    programme?: string;
    income?: string;
    cgpa?: string;
  };
}) {
  const user = await getCurrentUser();
  const step = searchParams?.step || '1';
  const programme = searchParams?.programme || user.programme || 'PGP';
  const income = searchParams?.income || (user.annual_family_income ? String(user.annual_family_income) : '240000');
  const cgpa = searchParams?.cgpa || (user.cgpa ? String(user.cgpa) : '7.8');

  // STEP 1: Programme
  if (step === '1') {
    return (
      <div>
        <a href="/" className="govuk-link" style={{ display: 'inline-block', marginBottom: '1rem' }}>
          ← Back to Home
        </a>

        <span className="govuk-body-s" style={{ textTransform: 'uppercase', color: '#505a5f' }}>
          Step 1 of 4: Academic Programme
        </span>
        <h1 className="govuk-heading-xl">Which programme are you enrolled in?</h1>

        <form method="GET" action="/check-eligibility">
          <input type="hidden" name="step" value="2" />
          <input type="hidden" name="income" value={income} />
          <input type="hidden" name="cgpa" value={cgpa} />

          <div className="govuk-form-group">
            <fieldset style={{ border: 'none', padding: 0 }}>
              <legend className="govuk-hint">Select your current degree programme at IIM Bodh Gaya:</legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {[
                  { code: 'PGP', label: 'Post Graduate Programme in Management (PGP)' },
                  { code: 'PGP-DBM', label: 'PGP in Digital Business Management (PGP-DBM)' },
                  { code: 'IPM', label: 'Integrated Programme in Management (IPM)' },
                  { code: 'PHD', label: 'Doctoral Programme in Management (PhD)' },
                ].map((p) => (
                  <label key={p.code} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="programme"
                      value={p.code}
                      defaultChecked={programme === p.code}
                      style={{ width: '22px', height: '22px' }}
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <button type="submit" className="govuk-button">
            Continue to Step 2
          </button>
        </form>
      </div>
    );
  }

  // STEP 2: Annual Family Income
  if (step === '2') {
    return (
      <div>
        <a href={`/check-eligibility?step=1&programme=${programme}&income=${income}&cgpa=${cgpa}`} className="govuk-link" style={{ display: 'inline-block', marginBottom: '1rem' }}>
          ← Back
        </a>

        <span className="govuk-body-s" style={{ textTransform: 'uppercase', color: '#505a5f' }}>
          Step 2 of 4: Financial Circumstances
        </span>
        <h1 className="govuk-heading-xl">What is your annual gross family income?</h1>

        <form method="GET" action="/check-eligibility">
          <input type="hidden" name="step" value="3" />
          <input type="hidden" name="programme" value={programme} />
          <input type="hidden" name="cgpa" value={cgpa} />

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="income">
              Gross Total Family Income (in INR)
            </label>
            <div className="govuk-hint">
              Include total combined income of father, mother, and student from all sources as stated on your ITR or Income Certificate.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '340px' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>₹</span>
              <input
                id="income"
                name="income"
                type="number"
                step="1000"
                className="govuk-input"
                defaultValue={income}
                required
              />
            </div>
          </div>

          <button type="submit" className="govuk-button">
            Continue to Step 3
          </button>
        </form>
      </div>
    );
  }

  // STEP 3: Current CGPA
  if (step === '3') {
    return (
      <div>
        <a href={`/check-eligibility?step=2&programme=${programme}&income=${income}&cgpa=${cgpa}`} className="govuk-link" style={{ display: 'inline-block', marginBottom: '1rem' }}>
          ← Back
        </a>

        <span className="govuk-body-s" style={{ textTransform: 'uppercase', color: '#505a5f' }}>
          Step 3 of 4: Academic Performance
        </span>
        <h1 className="govuk-heading-xl">What is your current cumulative grade point average (CGPA)?</h1>

        <form method="GET" action="/check-eligibility">
          <input type="hidden" name="step" value="check" />
          <input type="hidden" name="programme" value={programme} />
          <input type="hidden" name="income" value={income} />

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="cgpa">
              Cumulative CGPA (on a 10.0 scale)
            </label>
            <div className="govuk-hint">
              As recorded on your most recent official grade sheet from the Programme Office.
            </div>
            <input
              id="cgpa"
              name="cgpa"
              type="number"
              step="0.01"
              min="0"
              max="10"
              className="govuk-input"
              defaultValue={cgpa}
              style={{ maxWidth: '200px' }}
              required
            />
          </div>

          <button type="submit" className="govuk-button">
            Check Your Answers
          </button>
        </form>
      </div>
    );
  }

  // STEP 4: "Check Your Answers" Summary List Page
  if (step === 'check') {
    const incNum = parseFloat(income) || 0;
    const cgpaNum = parseFloat(cgpa) || 0;

    return (
      <div>
        <a href={`/check-eligibility?step=3&programme=${programme}&income=${income}&cgpa=${cgpa}`} className="govuk-link" style={{ display: 'inline-block', marginBottom: '1rem' }}>
          ← Back
        </a>

        <span className="govuk-body-s" style={{ textTransform: 'uppercase', color: '#505a5f' }}>
          Step 4 of 4: Verification
        </span>
        <h1 className="govuk-heading-xl">Check your answers before evaluation</h1>

        <table className="govuk-summary-list">
          <tbody>
            <tr className="govuk-summary-list__row">
              <th className="govuk-summary-list__key">Enrolled Programme</th>
              <td className="govuk-summary-list__value">{programme}</td>
              <td className="govuk-summary-list__actions">
                <a href={`/check-eligibility?step=1&programme=${programme}&income=${income}&cgpa=${cgpa}`}>
                  Change
                </a>
              </td>
            </tr>
            <tr className="govuk-summary-list__row">
              <th className="govuk-summary-list__key">Annual Gross Family Income</th>
              <td className="govuk-summary-list__value">INR {incNum.toLocaleString('en-IN')}</td>
              <td className="govuk-summary-list__actions">
                <a href={`/check-eligibility?step=2&programme=${programme}&income=${income}&cgpa=${cgpa}`}>
                  Change
                </a>
              </td>
            </tr>
            <tr className="govuk-summary-list__row">
              <th className="govuk-summary-list__key">Current CGPA</th>
              <td className="govuk-summary-list__value">{cgpaNum.toFixed(2)} / 10.0</td>
              <td className="govuk-summary-list__actions">
                <a href={`/check-eligibility?step=3&programme=${programme}&income=${income}&cgpa=${cgpa}`}>
                  Change
                </a>
              </td>
            </tr>
          </tbody>
        </table>

        <form method="GET" action="/check-eligibility">
          <input type="hidden" name="step" value="results" />
          <input type="hidden" name="programme" value={programme} />
          <input type="hidden" name="income" value={income} />
          <input type="hidden" name="cgpa" value={cgpa} />

          <button type="submit" className="govuk-button">
            Calculate Aid Eligibility
          </button>
        </form>
      </div>
    );
  }

  // RESULTS PAGE: Evaluated schemes against rules engine
  const incNum = parseFloat(income) || 0;
  const cgpaNum = parseFloat(cgpa) || 0;
  const evaluations = await evaluateSchemes(programme, incNum, cgpaNum);
  const eligibleSchemes = evaluations.filter((e) => e.decision === 'eligible');

  return (
    <div>
      <a href="/check-eligibility?step=check" className="govuk-link" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        ← Back to answers
      </a>

      <h1 className="govuk-heading-xl">Your Financial Aid Eligibility Result</h1>

      {eligibleSchemes.length > 0 ? (
        <div style={{ backgroundColor: '#cce2d8', borderLeft: '4px solid #00703c', padding: '1.25rem', marginBottom: '2rem' }}>
          <h2 className="govuk-heading-m" style={{ color: '#005a30', marginTop: 0 }}>
            You may be eligible for {eligibleSchemes.length} aid scheme{eligibleSchemes.length > 1 ? 's' : ''}!
          </h2>
          <p className="govuk-body" style={{ margin: 0 }}>
            Based on the details provided, your profile satisfies the preliminary criteria under current IIM Bodh Gaya policy.
          </p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff7bf', borderLeft: '4px solid #594d00', padding: '1.25rem', marginBottom: '2rem' }}>
          <h2 className="govuk-heading-m" style={{ color: '#594d00', marginTop: 0 }}>
            No Standard Schemes Matched
          </h2>
          <p className="govuk-body" style={{ margin: 0 }}>
            Your declared income or CGPA falls outside standard automatic thresholds. If you are experiencing sudden family bereavement or medical crisis, you may still apply for the Emergency Hardship Fund.
          </p>
        </div>
      )}

      {/* Scheme Breakdown */}
      <h2 className="govuk-heading-l">Evaluated Schemes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        {evaluations.map((sch) => {
          const isEligible = sch.decision === 'eligible';
          return (
            <div
              key={sch.scheme_id}
              style={{
                border: '1px solid #b1b4b6',
                borderLeft: isEligible ? '4px solid #00703c' : '4px solid #b1b4b6',
                padding: '1.25rem',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 className="govuk-heading-m" style={{ margin: 0 }}>{sch.scheme_name}</h3>
                <span className={`govuk-tag ${isEligible ? 'govuk-tag--green' : 'govuk-tag--grey'}`}>
                  {isEligible ? 'PRELIMINARILY ELIGIBLE' : 'NOT ELIGIBLE'}
                </span>
              </div>

              <p className="govuk-body" style={{ fontWeight: 'bold', color: isEligible ? '#005a30' : '#505a5f' }}>
                Potential Assistance: {sch.coverage}
              </p>

              <div className="govuk-body-s">
                <strong>Evaluation Notes:</strong>
                <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
                  {sch.reasons.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="govuk-body-s" style={{ marginTop: '0.5rem' }}>
                <strong>Required Documents:</strong> {sch.required_documents.join(', ')}
              </div>

              <p className="govuk-body-s" style={{ marginTop: '0.5rem', color: '#505a5f' }}>
                Official Rule Citation: <em>{sch.citation}</em>
              </p>
            </div>
          );
        })}
      </div>

      <div className="govuk-button-group">
        <a href="/upload" className="govuk-button">
          Proceed to Document Submission
        </a>
        <a href="/check-eligibility?step=1" className="govuk-button govuk-button--secondary">
          Re-Check With Different Figures
        </a>
      </div>
    </div>
  );
}
