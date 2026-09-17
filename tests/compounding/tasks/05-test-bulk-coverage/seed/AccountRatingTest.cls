@isTest(SeeAllData=true)
public class AccountRatingTest {
    @isTest
    static void testRate() {
        Account a = [SELECT Id, AnnualRevenue FROM Account LIMIT 1];
        String r = AccountRating.rate(a.AnnualRevenue);
        System.debug(r);
    }
}
