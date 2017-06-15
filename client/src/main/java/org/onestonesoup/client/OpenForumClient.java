package org.onestonesoup.client;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.math.BigInteger;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * OF Client
 *
 */
public class OpenForumClient 
{

	private final String userId;

	public static void main( String[] args ) throws Exception {
        OpenForumClient client = new OpenForumClient( "https://open-forum.onestonesoup.org",args[0],args[1] );
    }

    private String host;
	private String sessionCookie;

    public OpenForumClient(String host, String userId,String password) throws Exception {
    	this.host = host;
    	this.userId = userId;

    	signIn(userId,password);
	}

	public String getUserId() {
    	return userId;
	}

	private void signIn(String userId, String password) throws IOException, NoSuchAlgorithmException {

		String hash = getPasswordHash();
		String hashedPassword = toMD5(password+hash);

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

	public String getFile(String pageName, String fileName) throws IOException {
    	String url = host + "/" + pageName + "/" + fileName;
		URLConnection connection = new URL(url).openConnection();
		connection.setRequestProperty("Cookie",sessionCookie);

		BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
		String inputLine;
		String data = "";
		while ((inputLine = in.readLine()) != null)
			data += inputLine;
		in.close();
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