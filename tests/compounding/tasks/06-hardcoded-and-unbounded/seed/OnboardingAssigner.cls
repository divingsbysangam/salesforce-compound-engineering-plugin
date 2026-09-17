public class OnboardingAssigner {
    public void assignUnowned() {
        List<Contact> all = [SELECT Id, OwnerId FROM Contact];
        List<Contact> toUpdate = new List<Contact>();
        for (Contact c : all) {
            if (c.OwnerId == null) {
                c.OwnerId = '005000000000AAABBB';
                toUpdate.add(c);
            }
        }
        update toUpdate;
    }
}
