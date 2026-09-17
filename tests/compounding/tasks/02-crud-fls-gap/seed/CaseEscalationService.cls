public class CaseEscalationService {
    public void escalateStale(Integer thresholdDays) {
        Datetime cutoff = Datetime.now().addDays(-thresholdDays);
        List<Case> stale = [SELECT Id, Priority, IsEscalated FROM Case WHERE CreatedDate < :cutoff];
        List<Case> toUpdate = new List<Case>();
        for (Case c : stale) {
            if (c.Priority != 'High') {
                c.Priority = 'High';
                c.IsEscalated = true;
                toUpdate.add(c);
            }
        }
        update toUpdate;
    }
}
