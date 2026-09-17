# 02-crud-fls-gap

`CaseEscalationService.cls` reads and writes Case data on behalf of the running
user but enforces no object or field permissions, and declares no sharing model.

Make it enforce the running user's access. Keep the escalation logic identical:
Cases older than the threshold with Priority not already 'High' get Priority
'High' and `IsEscalated` true.

Write the corrected class back to the same path.
