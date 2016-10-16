package org.onestonesoup.openforum.paypal;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import org.onestonesoup.core.StringHelper;
import org.onestonesoup.openforum.plugin.SystemAPI;

public class PayPal extends SystemAPI {

	private static String PAYPAL_URL = "https://api.sandbox.paypal.com/v1/payments/payment";

	public String sendPaymentRequest(String accessToken,String data) throws Exception {
		URL url = new URL(PAYPAL_URL);
		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setDoOutput(true);
		conn.setRequestMethod("POST");

		conn.setRequestProperty ("Content-Type","application/json");
		conn.setRequestProperty ("Authorization", " Bearer "+accessToken);

		OutputStreamWriter writer = new OutputStreamWriter(conn.getOutputStream());

		writer.write(data);
		writer.flush();
		String line;
		String outputData = "";
		BufferedReader reader = new BufferedReader(new
				InputStreamReader(conn.getInputStream()));
		while ((line = reader.readLine()) != null) {
			outputData += line;
		}
		writer.close();
		reader.close();

		return outputData;
	}

	public String getAuthToken(String userId,String password) throws Exception {
		String code = StringHelper.encodeBase64(userId+":"+password).replace("\n","");

		URL url = new URL("https://api.sandbox.paypal.com/v1/oauth2/token");
		URLConnection conn = url.openConnection();
		conn.setDoOutput(true);
		conn.setRequestProperty("Authorization", "Basic " + code);

		OutputStreamWriter writer = new OutputStreamWriter(conn.getOutputStream());

		writer.write("grant_type=client_credentials");
		writer.flush();
		String line;
		BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));

		String response = "";
		while ((line = reader.readLine()) != null) {
			response += line+"\n";
		}
		writer.close();
		reader.close();

		return response;
	}
}
