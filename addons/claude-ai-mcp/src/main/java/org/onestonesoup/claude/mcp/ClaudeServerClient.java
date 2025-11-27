package org.onestonesoup.claude.mcp;

import org.onestonesoup.client.OpenForumClient;

import java.io.IOException;
import java.util.Map;

/**
 * Small abstraction that allows {@link ClaudeOpenForumProxy} to talk to
 * OpenForum without being tightly coupled to the concrete client. Tests can
 * supply lightweight fakes to avoid real HTTP calls.
 */
interface ClaudeServerClient {
    String doPost(String pageName, Map<String, String> params) throws IOException;

    void downloadFile(String pageName, String fileName, String localFileName) throws IOException;

    String uploadFile(String pageName, String fileName, String localFileName) throws IOException;

    String doGet(String pageName) throws IOException;
}

final class OpenForumClientAdapter implements ClaudeServerClient {
    private final OpenForumClient delegate;

    OpenForumClientAdapter(OpenForumClient delegate) {
        this.delegate = delegate;
    }

    @Override
    public String doPost(String pageName, Map<String, String> params) throws IOException {
        return delegate.doPost(pageName, params);
    }

    @Override
    public void downloadFile(String pageName, String fileName, String localFileName) throws IOException {
        delegate.downloadFile(pageName, fileName, localFileName);
    }

    @Override
    public String uploadFile(String pageName, String fileName, String localFileName) throws IOException {
        return delegate.uploadFile(pageName, fileName, localFileName);
    }

    @Override
    public String doGet(String pageName) throws IOException {
        return delegate.doGet(pageName);
    }
}
