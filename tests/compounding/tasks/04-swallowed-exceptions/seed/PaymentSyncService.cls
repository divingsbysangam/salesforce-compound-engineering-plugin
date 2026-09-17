public with sharing class PaymentSyncService {
    public void sync(List<Payment__c> payments) {
        try {
            Database.update(payments, AccessLevel.USER_MODE);
        } catch (DmlException e) {
        }
        try {
            postToLedger(payments);
        } catch (Exception e) {
            System.debug('ledger post failed: ' + e.getMessage());
        }
    }
    private void postToLedger(List<Payment__c> payments) { }
}
