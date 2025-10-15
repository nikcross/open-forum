package org.onestonesoup.openforum.javatrail.sample.domain;

public class DomainService {

    public void handleRequest(String reference) {
        DomainRepository repository = new DomainRepository();
        repository.fetchRecord(reference);
        repository.persistRecord(reference);
    }
}
