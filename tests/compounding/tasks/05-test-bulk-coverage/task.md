# 05-test-bulk-coverage

`AccountRatingTest.cls` is a test in name only: it uses `SeeAllData=true`,
exercises a single record, and makes no assertion.

Rewrite it as a real test of `AccountRating.cls`: no org data dependency,
assertions that would fail if the rating logic broke, and bulk coverage at
trigger scale.

Write the corrected test class back to the same path.
