/**
 * Lint a skill `description` for step-count / workflow-shape language.
 *
 * A skill's `description` frontmatter powers auto-routing — it should enumerate
 * trigger phrases, not describe the skill's internal workflow shape ("5-step",
 * "3 phases", "checklist"). That shape drifts as the skill body changes, leaving
 * the description a stale, dangling promise. This check catches such phrasing
 * mechanically instead of relying on review vigilance.
 */

export interface DescriptionLintResult {
  skill: string;
  ok: boolean;
  violations: string[];
}

const SDO_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\b\d+-step\b/i, label: 'step-count phrasing ("N-step")' },
  { re: /\b\d+\s+steps\b/i, label: 'step-count phrasing ("N steps")' },
  { re: /\bchecklist\b/i, label: '"checklist"' },
  { re: /\b\d+\s+phases\b/i, label: 'phase-count phrasing ("N phases")' },
  { re: /\b\d+-phase\b/i, label: 'phase-count phrasing ("N-phase")' },
  { re: /\b\d+-question\b/i, label: 'question-count phrasing ("N-question")' },
  { re: /\b\d+-field\b/i, label: 'field-count phrasing ("N-field")' },
];

/**
 * Return step-count / workflow-shape violations for a single skill description.
 */
export function lintDescription(skill: string, description: string | undefined): DescriptionLintResult {
  const text = description ?? "";
  const violations: string[] = [];

  for (const { re, label } of SDO_PATTERNS) {
    const match = text.match(re);
    if (match) {
      violations.push(`${skill}: description contains ${label}: "${match[0]}"`);
    }
  }

  return { skill, ok: violations.length === 0, violations };
}
