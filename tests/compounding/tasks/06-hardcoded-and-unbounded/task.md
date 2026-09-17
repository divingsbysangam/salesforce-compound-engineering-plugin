# 06-hardcoded-and-unbounded

`OnboardingAssigner.cls` hardcodes a User id and queries Contacts with neither
a WHERE clause nor a LIMIT. Both make it unsafe to deploy to any org other than
the one it was written in.

Remove the environment coupling and bound the query. Keep the assignment
behaviour: every Contact without an owner is assigned to the onboarding queue
owner.

Write the corrected class back to the same path.
