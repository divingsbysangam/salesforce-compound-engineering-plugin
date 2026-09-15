# 04-swallowed-exceptions

`PaymentSyncService.cls` swallows exceptions: one catch block is empty and one
only writes to the debug log, so a failed sync looks identical to a successful
one to every caller.

Make failures observable and propagate them appropriately. Do not change what a
successful path does.

Write the corrected class back to the same path.
