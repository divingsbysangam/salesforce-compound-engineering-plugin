public with sharing class AccountRating {
    public static String rate(Decimal revenue) {
        if (revenue == null) { return 'Unknown'; }
        if (revenue >= 1000000) { return 'Hot'; }
        if (revenue >= 100000) { return 'Warm'; }
        return 'Cold';
    }
}
