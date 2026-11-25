package org.onestonesoup.client;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.onestonesoup.core.FileHelper;
import org.onestonesoup.core.StringHelper;

import java.io.*;
import java.net.HttpURLConnection;
import java.math.BigInteger;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;

/**
 * OF Client
 *
 */
public class OpenForumClient  {

	private final String userId;
	private final String password;

	private boolean hashedPassword = false;

	public static void main( String[] args ) throws Exception {
        OpenForumClient client = new OpenForumClient( "https://open-forum.onestonesoup.org",args[0],args[1],false );
        //String result = client.uploadFile("/TheLab/Uploads","uploaded.jpg",
		//		"/home/nik/Pictures/Background Images/P5060033.JPG");

		String queue = "/TheLab/WebSiteProjects/RoboTRAX";
		long since = System.currentTimeMillis()-10000;
		String result = client.doGet("OpenForum/MessageQueue?action=pull&queue=" + queue + "&since=" + since);

        System.out.println(result);
    }

    private final String host;
	private String sessionCookie;

    public OpenForumClient(String host, String userId,String password, boolean hashedPassword) throws Exception {
    	this.host = normalizeHost(host);
    	this.userId = userId;
    	this.password = password;
		this.hashedPassword = hashedPassword;

    	signIn(userId,password,hashedPassword);
	}

	OpenForumClient(String host, String sessionCookie) {
		this.host = normalizeHost(host);
		this.userId = "";
		this.password = "";
		this.sessionCookie = sessionCookie;
	}

	public String getUserId() {
    	return userId;
	}

	public void reSignIn() {
		try {
			signIn(userId,password,hashedPassword);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private void signIn(String userId, String password, boolean hashed) throws IOException, NoSuchAlgorithmException {

		String hashedPassword = password;
		if(hashed) {
			String hash = getPasswordHash();
			hashedPassword = toMD5(password+hash);
		}

		URLConnection connection = new URL(host + "/OpenForum/Access/SignIn/Process").openConnection();

		String parameters = "userId=" + URLEncoder.encode(userId, "UTF-8") + "&password=" + URLEncoder.encode(hashedPassword, "UTF-8") + "&flavour=json";

		connection.setDoOutput(true);

		OutputStreamWriter out = new OutputStreamWriter(
				connection.getOutputStream());
		out.write(parameters);
		out.close();

		BufferedReader in = new BufferedReader(
				new InputStreamReader(
						connection.getInputStream()));
		String decodedString;
		String result = "";
		while ((decodedString = in.readLine()) != null) {
			result += decodedString;
		}
		in.close();

		if(result.equals("{result:\"ok\"}") == false) {
			throw new IOException("Login failed: "+result);
		}

		sessionCookie = connection.getHeaderField("Set-Cookie");
		sessionCookie = sessionCookie.substring(0,sessionCookie.indexOf(";"));
	}

	public String doGet(String pageName) throws IOException {
		String url = buildUrl(pageName);
		URLConnection connection = new URL(url).openConnection();
		connection.setRequestProperty("Cookie",sessionCookie);

		BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
		String inputLine;
		String data = "";
		while ((inputLine = in.readLine()) != null)
			data += inputLine + "\n";
		in.close();
		return data;
	}

	public String doPost(String pageName,Map<String,String> postData)  throws IOException {
		String url = buildUrl(pageName);
		URLConnection connection = new URL(url).openConnection();

		connection.setDoOutput(true);
		connection.setRequestProperty("Cookie",sessionCookie);
		connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");

		StringBuilder parameters = new StringBuilder();
		for(String name: postData.keySet()) {
			if(parameters.length() > 0) parameters.append("&");
			parameters.append(URLEncoder.encode(name, "UTF-8"))
					.append("=")
					.append(URLEncoder.encode(postData.get(name), "UTF-8"));
		}

		try (OutputStreamWriter out = new OutputStreamWriter(connection.getOutputStream(), "UTF-8")) {
			out.write(parameters.toString());
		}

		StringBuilder result = new StringBuilder();
		try (BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream(), "UTF-8"))) {
			String decodedString;
			while ((decodedString = in.readLine()) != null) {
				result.append(decodedString);
			}
		}

		return result.toString();
	}

	public String getFile(String pageName, String fileName) throws IOException {
    	return doGet(combinePageAndFile(pageName,fileName));
	}


	public void downloadFile(String pageName, String fileName, String localFileName) throws IOException {
		String url = buildUrl(combinePageAndFile(pageName,fileName));
		System.out.println("Downloading OpenForum file: " + url + " -> " + localFileName);
		HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
		if(sessionCookie != null) {
			connection.setRequestProperty("Cookie",sessionCookie);
		}

		File target = new File(localFileName);
		File parent = target.getParentFile();
		if(parent != null && parent.exists() == false) {
			Files.createDirectories(parent.toPath());
		}

		File tempFile = File.createTempFile(tempFilePrefix(target), ".download", parent);
		boolean success = false;
		try {
			int status = connection.getResponseCode();
			if(status < 200 || status >= 300) {
				throw new IOException("Download failed with HTTP " + status + " for " + url + ": " + readResponseSnippet(connection));
			}

			FileHelper.copyInputStreamToFile( connection.getInputStream(), tempFile );
			String errorMarker = getOpenForumErrorMarker(tempFile);
			if(errorMarker != null) {
				throw new IOException("Download returned OpenForum error marker for " + url + ": " + errorMarker);
			}

			moveDownloadedFile(tempFile, target);
			success = true;
		} finally {
			connection.disconnect();
			if(success == false && tempFile.exists()) {
				tempFile.delete();
			}
		}
	}

	private void moveDownloadedFile(File source, File target) throws IOException {
		try {
			Files.move(source.toPath(), target.toPath(), StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
		} catch (AtomicMoveNotSupportedException e) {
			Files.move(source.toPath(), target.toPath(), StandardCopyOption.REPLACE_EXISTING);
		}
	}

	private String tempFilePrefix(File target) {
		String prefix = target.getName();
		while(prefix.length() < 3) {
			prefix += "_";
		}
		return prefix;
	}

	private String readResponseSnippet(HttpURLConnection connection) throws IOException {
		InputStream stream = connection.getErrorStream();
		if(stream == null) {
			stream = connection.getInputStream();
		}
		if(stream == null) {
			return "";
		}
		return readSnippet(stream, 2048);
	}

	private String getOpenForumErrorMarker(File file) throws IOException {
		String snippet;
		try (InputStream stream = new FileInputStream(file)) {
			snippet = readSnippet(stream, 2048).trim();
		}
		if(snippet.matches("^/OpenForum/ErrorPages/\\d+.*")) {
			return snippet;
		}
		return null;
	}

	private String readSnippet(InputStream stream, int maxBytes) throws IOException {
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		byte[] buffer = new byte[Math.min(1024, maxBytes)];
		int total = 0;
		int read;
		while(total < maxBytes && (read = stream.read(buffer, 0, Math.min(buffer.length, maxBytes - total))) != -1) {
			output.write(buffer, 0, read);
			total += read;
		}
		return output.toString("UTF-8");
	}

	public String uploadFile(String pageName, String fileName, String  localFileName) throws IOException {
		String normalizedPage = ensureAbsolutePath(pageName);
		String url = host + "/OpenForum/Actions/Attach?page=" + normalizedPage + "&fileName=" + fileName;

		CloseableHttpClient httpClient = HttpClients.createDefault();
		HttpPost uploadFile = new HttpPost(url);
		uploadFile.addHeader("Cookie",sessionCookie);

		MultipartEntityBuilder builder = MultipartEntityBuilder.create();
		builder.addTextBody("fileName", fileName, ContentType.TEXT_PLAIN);
		builder.addBinaryBody("file", new File(localFileName), ContentType.APPLICATION_OCTET_STREAM, fileName);
		HttpEntity multipart = builder.build();

		uploadFile.setEntity(multipart);

		CloseableHttpResponse response = httpClient.execute(uploadFile);
		String data = FileHelper.loadFileAsString(response.getEntity().getContent());
		System.out.println(data);
		return data;
	}

	private String getPasswordHash() throws IOException {
		URLConnection connection = new URL(host + "/OpenForum/Authentication/authentication.hash.a").openConnection();

		BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
		String inputLine;
		String data = "";
		while ((inputLine = in.readLine()) != null)
			data += inputLine;
		in.close();
		return data;
	}

	private String toMD5(String data) throws NoSuchAlgorithmException {
		MessageDigest messageDigest = MessageDigest.getInstance("MD5");
		messageDigest.reset();
		messageDigest.update(data.getBytes());
		byte[] digest = messageDigest.digest();
		BigInteger bigInt = new BigInteger(1,digest);
		String hashtext = bigInt.toString(16);
		// Now we need to zero pad it if you actually want the full 32 chars.
		while(hashtext.length() < 32 ){
			hashtext = "0"+hashtext;
		}
		return hashtext;
	}

	private String normalizeHost(String rawHost) {
		if(rawHost == null) {
			throw new IllegalArgumentException("host is required");
		}
		String normalized = rawHost.trim();
		if(normalized.isEmpty()) {
			throw new IllegalArgumentException("host is required");
		}
		while(normalized.endsWith("/")) {
			normalized = normalized.substring(0, normalized.length()-1);
		}
		return normalized;
	}

	private String buildUrl(String relativePath) {
		if(relativePath == null || relativePath.trim().isEmpty()) {
			return host + "/";
		}
		if(relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
			return relativePath;
		}
		return host + ensureAbsolutePath(relativePath);
	}

	private String ensureAbsolutePath(String rawPath) {
		if(rawPath == null || rawPath.trim().isEmpty()) {
			return "/";
		}
		String trimmed = rawPath.trim().replace('\\','/');
		if(trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
			return trimmed;
		}
		String path = trimmed;
		String query = "";
		int queryIndex = trimmed.indexOf('?');
		if(queryIndex >= 0) {
			path = trimmed.substring(0, queryIndex);
			query = trimmed.substring(queryIndex);
		}
		while(path.startsWith("/")) {
			path = path.substring(1);
		}
		if(path.isEmpty()) {
			return "/" + query;
		}
		return "/" + path + query;
	}

	private String combinePageAndFile(String pageName, String fileName) {
		String base = ensureAbsolutePath(pageName);
		if(fileName == null || fileName.trim().isEmpty()) {
			return base;
		}
		String child = fileName.trim().replace('\\','/');
		while(child.startsWith("/")) {
			child = child.substring(1);
		}
		if(base.endsWith("/")) {
			return base + child;
		}
		return base + "/" + child;
	}
}
