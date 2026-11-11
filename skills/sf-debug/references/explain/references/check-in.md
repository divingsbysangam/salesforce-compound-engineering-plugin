# Check-in

The check-in is a `Check yourself` section at the end of the explainer. The reader answers first and reads the answers after. It is static text in the document. The run does not offer a quiz, does not ask for a prediction, and does not wait on an exercise in chat. A reader who leaves does not come back to a blocked question.

## Include or omit

The request wins in both directions. An explicit ask for a check-in, quiz, or exercises includes the section. An explicit "no quiz" omits it. When the request is silent, include the section when retention is the point: a hard or unfamiliar Salesforce mechanism (order of execution, mixed DML, sharing recalculation), a consequential diff, or a dense recap with decisions worth recalling. Omit it when the point is comprehension and retention is incidental: a routine recap before a meeting, a small mechanical diff, a topic the user only needs to skim. Do not announce the choice.

An explainer written for another reader uses the same test. The section exercises whoever reads the document.

## Shape

- One section headed `Check yourself`, placed last, after the explanation.
- Two to four numbered questions, then the answers under an `Answers` label, numbered to match, so a reader can attempt every question before any answer is in view.
- Each answer states what a correct response contains and names the gap a plausible wrong answer exposes. One correction per question.
- Static only: no forms, scripts, click handlers, or widgets that hide the answers.

## Question kinds

Design questions to expose understanding, not recall of the artifact's wording.

- **Explain-back:** restate the mechanism. The answer names the pieces a complete restatement carries (for example, which trigger context runs, and what the bulk path does at 200 records).
- **Predict:** what happens under a named input. The answer names the outcome and the limit or sharing rule that produces it.
- **Change (diff mode):** what the change does and why. The answer names the intent, not a line-by-line reading of the hunks.
