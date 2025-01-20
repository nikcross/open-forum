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
import java.math.BigInteger;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
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

    private String host;
	private String sessionCookie;

    public OpenForumClient(String host, String userId,String password, boolean hashedPassword) throws Exception {
    	this.host = host;
    	this.userId = userId;
    	this.password = password;
		this.hashedPassword = hashedPassword;

    	signIn(userId,password,hashedPassword);
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
		String url = host + "/" + pageName;
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
		String url = host + "/" + pageName;
		URLConnection connection = new URL(url).openConnection();

		connection.setDoOutput(true);
		connection.setRequestProperty("Cookie",sessionCookie);

		String urlParameters = "";
		for(String name: postData.keySet()) {
			if(urlParameters.length()>0) urlParameters += "&";
			urlParameters += name + "=" + postData.get(name);
		}

		DataOutputStream oStream = new DataOutputStream(connection.getOutputStream());
		oStream.writeBytes(urlParameters);
		oStream.flush();
		oStream.close();

		BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
		String inputLine;
		String data = "";
		while ((inputLine = in.readLine()) != null)
			data += inputLine + "\n";
		in.close();
		return data;
	}

	public String getFile(String pageName, String fileName) throws IOException {
    	return doGet(pageName + "/" + fileName );
	}


	public void downloadFile(String pageName, String fileName, String localFileName) throws IOException {
		String url = host + "/" + pageName + "/" + fileName;
		URLConnection connection = new URL(url).openConnection();
		connection.setRequestProperty("Cookie",sessionCookie);

		FileHelper.copyInputStreamToFile( connection.getInputStream(),new File(localFileName) );
	}

	public String uploadFile(String pageName, String fileName, String  localFileName) throws IOException {
		String url = host + "/OpenForum/Actions/Attach?page=" + pageName + "&fileName=" + fileName;

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
}