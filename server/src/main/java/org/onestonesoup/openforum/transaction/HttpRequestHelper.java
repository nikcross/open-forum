package org.onestonesoup.openforum.transaction;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.text.ParseException;
import java.text.SimpleDateFormat;

import org.onestonesoup.core.StringHelper;
import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.KeyValuePair;
import org.onestonesoup.openforum.router.ProgressListener;
import org.onestonesoup.openforum.security.AuthenticationException;

public class HttpRequestHelper {

	private static final int MAX_HEADER_SIZE=10000;
	
	public static EntityTree parseHttpHeader(InputStream iStream) throws IOException
	{
		EntityTree header = new EntityTree("header");
		header.setAttribute("_time",""+System.currentTimeMillis());
		
		int in = iStream.read();
		StringBuffer headerData = new StringBuffer();
		
		char inA='?';
		char inB='?';
		int count = 0;
		
		while(in!=-1)
		{
			count++;
			if(count>MAX_HEADER_SIZE)
			{
				throw new IOException("Http header exceeded maximum size of "+MAX_HEADER_SIZE+" bytes");
			}
			
			if(in=='\r')
			{
				in = iStream.read();
				continue;
			}
			
			inB = inA;
			inA = (char)in;
			if( inA=='\n' && inB=='\n' )
			{
				break;
			}
			else
			{
				headerData.append( inA );
			}
			
			in = iStream.read();
		}
		
		String[] lines = headerData.toString().split("\n");
		if(lines.length==0)
		{
			return null;
		}
		
		String[] parts = lines[0].split(" ");
		String method = parts[0].toLowerCase();
		String path = StringHelper.arrayToString(parts," ",1,parts.length-1);
		String request = URLDecoder.decode( path );
		String version = parts[parts.length-1];
		version = version.substring(5);
		
		header.addChild("method").setValue(method);
		header.addChild("request").setValue(request);
		header.addChild("version").setValue(version);
		
		for(int loop=1;loop<lines.length;loop++)
		{
			String key = lines[loop];
			if(key.indexOf(": ")<1)
			{
				throw new IOException("Illegal HTTP header attribute "+key);
			}
			
			KeyValuePair entity = KeyValuePair.parseKeyAndValue(key,": ");
			
			header.addChild(entity.getKey().toLowerCase()).setValue(entity.getValue());
		}
		
		return header;
	}
	
	public static void setHttpRequestParameters(EntityTree header,EntityTree params)
	{
		String request = header.getChild("request").getValue();
		if(request.indexOf('?')!=-1)
		{
			request = request.substring(0,request.indexOf('?'));
		}

		for(int loop=0;loop<params.getChildren().size();loop++)
		{
			if(loop==0)
			{
				request+="?";
			}
			else
			{
				request+="&";
			}
			EntityTree.TreeEntity param = params.getChildren().get(loop);
			request+=param.getName()+"="+URLEncoder.encode(param.getValue());
		}
		header.getChild("request").setValue(request);
	}	
	
	public static EntityTree parseHttpCookieParameters(EntityTree header)
	{
		EntityTree params = new EntityTree("parameters");
		EntityTree.TreeEntity cookie = header.getChild("cookie");
		if(cookie==null)
		{
			return params;
		}
		
		String cookies = cookie.getValue();
		
		String[] values = cookies.split(";");
		for(int loop=0;loop<values.length;loop++)
		{
			KeyValuePair entity = KeyValuePair.parseKeyAndValue(values[loop],"=");
			params.addChild(entity.getKey().trim()).setValue( URLDecoder.decode(entity.getValue()) );
		}
		
		return params;
	}	
	
	public static EntityTree parseHttpRawPostData(EntityTree header,InputStream inputStream) throws IOException
	{
		long dataSize = 0;
		if(header.getChild("content-length")!=null)
		{
			dataSize = Long.parseLong( header.getChild("content-length").getValue() ); //allow for %nnn characters
		}
		if(dataSize==0)
		{
			return new EntityTree("data");
		}
		
		HttpPostInputStreamBuffer iStream = null;
		if(inputStream instanceof HttpPostInputStreamBuffer)
		{
			iStream = (HttpPostInputStreamBuffer)inputStream;
		}
		else
		{
			iStream = new HttpPostInputStreamBuffer(inputStream);
		}
				
		int in = iStream.read();
		long read = 0;
		StringBuffer buffer = new StringBuffer();
		
		while(in!=-1)
		{
			buffer.append( (char)in );
			read++;

			if(read>=dataSize)
			{
				//throw new IOException("Http POST data exceeded double stated Content-length of "+dataSize+" bytes");
				break;
			}
			
			in = iStream.read();
		}
		
		EntityTree data = new EntityTree("data");
		data.addChild("data").setValue( buffer.toString() );
		
		return data;
	}	
	
	public static EntityTree parseHttpPostData(EntityTree header,InputStream inputStream) throws IOException
	{
		long dataSize = 0;
		if(header.getChild("content-length")!=null)
		{
			dataSize = Long.parseLong( header.getChild("content-length").getValue() ); //allow for %nnn characters
		}
		if(dataSize==0)
		{
			return new EntityTree("data");
		}
		
		HttpPostInputStreamBuffer iStream = null;
		if(inputStream instanceof HttpPostInputStreamBuffer)
		{
			iStream = (HttpPostInputStreamBuffer)inputStream;
		}
		else
		{
			iStream = new HttpPostInputStreamBuffer(inputStream);
		}
				
		int in = iStream.read();
		long read = 0;
		StringBuffer buffer = new StringBuffer();
		
		while(in!=-1)
		{
			buffer.append( (char)in );
			read++;

			if(read>=dataSize)
			{
				//throw new IOException("Http POST data exceeded double stated Content-length of "+dataSize+" bytes");
				break;
			}
			
			in = iStream.read();
		}
		
		EntityTree data = new EntityTree("data");
		String[] values = buffer.toString().split("&");
		for(int loop=0;loop<values.length;loop++)
		{
			String key = values[loop];
			if(key.length()==0) {
				continue;
			}
			if(key.indexOf("=")<1)
			{
				throw new IOException("Illegal HTTP data value "+key);
			}
			KeyValuePair entity = KeyValuePair.parseKeyAndValue(key,"=");
			
			data.addChild(entity.getKey()).setValue( URLDecoder.decode(entity.getValue()) );
		}		
		return data;
	}

	public static long parseHttpPutFileData(EntityTree header,InputStream iStream,HttpPostStreamHandler streamHandler) throws IOException,AuthenticationException
	{
		long size = streamHandler.handlePostStream(header,null,iStream);
		
		return size;
	}
	
	public static EntityTree parseHttpPostFileData(EntityTree header,InputStream inputStream,HttpPostStreamHandler streamHandler,ProgressListener progressListener) throws IOException,AuthenticationException
	{
		HttpPostInputStreamBuffer iStream = null;
		if(inputStream instanceof HttpPostInputStreamBuffer)
		{
			iStream = (HttpPostInputStreamBuffer)inputStream;
		}
		else
		{
			iStream = new HttpPostInputStreamBuffer(inputStream);
		}		
		
		//long dataSize = Long.parseLong( header.getChild("content-length").getValue() );
		
		EntityTree.TreeEntity xContentType = header.getChild("content-type");
		if(xContentType==null)
		{
			throw new IOException("Content-Type missing in Http header");
		}
		String contentType = xContentType.getValue();
		if(contentType.indexOf("boundary")==-1)
		{
			throw new IOException("Content-Type boundary missing in Http header");			
		}
		String[] parts = contentType.split(";");
		contentType = parts[0].trim();
		if( !contentType.equals("multipart/form-data") )
		{
			throw new IOException("Content-Type not multipart/form-data in Http header");						
		}
		
		KeyValuePair entity = KeyValuePair.parseKeyAndValue(parts[1],"=");
		String boundary = entity.getValue();
		
		readToBoundary(boundary,iStream,progressListener);
		EntityTree tempHeader = parseHttpPostedFileHeader(iStream);

		parts = tempHeader.getChild("content-disposition").getValue().split(";");
		
		EntityTree postData = new EntityTree("postData");
		while(parts.length==2)
		{
			String name = parts[1];
			String value = new String(HttpRequestHelper.readToBoundary(boundary,iStream,progressListener)).trim();			
			postData.addChild(name).setValue(value);
			
			tempHeader = parseHttpPostedFileHeader(iStream);
			parts = tempHeader.getChild("content-disposition").getValue().split(";");
		}

		String disposition = parts[0];
		String name = KeyValuePair.parseKeyAndValue(parts[1],"=").getValue();
		String fileName = KeyValuePair.parseKeyAndValue(parts[2],"=").getValue();
		name = StringHelper.between(name,"\"","\"");
		fileName = StringHelper.between(fileName,"\"","\"");
		fileName = new File(fileName).getName();
		
		EntityTree fileHeader = new EntityTree("file");
		fileHeader.addChild(tempHeader.getChild("content-type"));
		fileHeader.addChild("content-disposition").setValue(disposition);
		fileHeader.addChild("name").setValue(name);
		fileHeader.addChild("fileName").setValue(fileName);
		fileHeader.addChild("boundary").setValue("--"+boundary);
		
		long length = streamHandler.handlePostStream(header,fileHeader,iStream);
		
		fileHeader.addChild("length").setValue(""+length);
		
		// dump trailing \n
		iStream.read();
		
		//mixed http posts not yet implemented
		return fileHeader;
	}

	public static byte[] readToBoundary(String boundary,InputStream iStream,ProgressListener progressListener) throws IOException
	{
		ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
		readToBoundary(boundary,iStream,byteStream,progressListener);
		return byteStream.toByteArray();
	}
	
	public static long readToBoundary(String boundary,InputStream inputStream,OutputStream out,ProgressListener progressListener) throws IOException
	{		
		boundary = "--"+boundary;
		
		HttpPostInputStreamBuffer iStream = null;
		if (inputStream instanceof HttpPostInputStreamBuffer) {
			iStream = (HttpPostInputStreamBuffer)inputStream;
		} else {
			iStream = new HttpPostInputStreamBuffer(inputStream);
		}
		
		long count = 1;
		StringBuffer test=new StringBuffer();
		int in = iStream.read();
		test.append((char)in);
		byte[] store = new byte[boundary.length()];
		
		while(in!=-1) {
			if(in==boundary.charAt(0))
			{
				store[0]=(byte)in;
				int cursor = 1;
				
				in = iStream.read();
				test.append((char)in);
				count++;
				
				while(in!=-1 && cursor<boundary.length() && boundary.charAt(cursor)==(char)in)
				{
					store[cursor]=(byte)in;
					cursor++;
					
					in = iStream.read();
					test.append((char)in);
					count++;
				}
				
				if(cursor>=boundary.length())
				{	
					return count;
				}
				else
				{
					out.write(store,0,cursor);
					if(in!=-1)
					{
						//out.write(in);
						continue;
					}
				}
			}
			else
			{
				out.write(in);
			}
			
			in = iStream.read();
			test.append((char)in);
			count++;
			
			if(progressListener!=null && count%1000 == 0)
			{
				progressListener.progress(count,0);
			}
		}
		
		out.flush();
		
		return count;
	}
	
	public static EntityTree parseHttpPostedFileHeader(InputStream iStream) throws IOException {
		EntityTree header = new EntityTree("header");
		
		int in = iStream.read();
		StringBuffer headerData = new StringBuffer();
		
		char inA='?';
		char inB='?';
		int count = 0;
		
		while(in!=-1)
		{
			count++;
			if(count>MAX_HEADER_SIZE)
			{
				throw new IOException("Http header exceeded maximum size of "+MAX_HEADER_SIZE+" bytes");
			}
			
			if(in=='\r')
			{
				in = iStream.read();
				continue;
			}
			
			inB = inA;
			inA = (char)in;
			if( inA=='\n' && inB=='\n' )
			{
				break;
			}
			else
			{
				headerData.append( inA );
			}
			
			in = iStream.read();
		}
		
		String[] lines = headerData.toString().split("\n");
		
		for(int loop=0;loop<lines.length;loop++)
		{
			if(lines[loop].length()==0)
			{
				continue;
			}
			String key = lines[loop];
			if(key.indexOf(": ")<1)
			{
				throw new IOException("Illegal HTTP header attribute "+key);
			}
			
			KeyValuePair entity = KeyValuePair.parseKeyAndValue(key,": ");
			
			header.addChild(entity.getKey().toLowerCase()).setValue(entity.getValue());
		}
		
		return header;
	}
	
	public static long writeHeader(EntityTree header,OutputStream oStream) throws IOException {
		long size=0;
		
		String line = header.getChild("method").getValue().toUpperCase()+" "+
						header.getChild("request").getValue()+" "+
						"HTTP/"+header.getChild("version").getValue()+"\r\n";
		oStream.write(line.getBytes());
		size+= line.length();
		
		
		for(int loop=0;loop<header.getChildren().size();loop++) {
			
			EntityTree.TreeEntity xParameter = header.getChildren().get(loop);
			String parameterName = xParameter.getName();
			
			if(
					parameterName.equals("method") ||
					parameterName.equals("request") ||
					parameterName.equals("version")
				)
			{
				continue;
			}
			String parameter = parameterToString(xParameter);
			
			line = parameter+"\r\n";
			oStream.write(line.getBytes());
			size+=line.length();
		}
		oStream.write("\r\n".getBytes());
		size+=2;
		oStream.flush();
		
		return size;
	}
	
	public static String parameterToString(EntityTree.TreeEntity headerParamter) {

		String value = headerParamter.getName();
		
		String[] parts = value.split("-");

		value = parts[0].substring(0,1).toUpperCase()+parts[0].substring(1);

		for(int loop=1;loop<parts.length;loop++)
		{
			value += "-"+parts[loop].substring(0,1).toUpperCase()+parts[loop].substring(1);
		}
		value +=": "+headerParamter.getValue();
		
		return value;
	}
	
	public static String getHttpDate(long time)
	{
		return new java.text.SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z").format(new java.util.Date(time));
	}
	
	public static long parseHttpDate(String date)
	{
/*		String[] parts = date,' ');
		
		String dayName = parts[0].substring(0,parts[0].length()-1);
		int dayOfMonthNumber = Integer.parseInt( parts[1] );
		
		String[] months = DateField.SHORT_MONTH_NAME;
		
		String monthName = parts[2];
		int year = Integer.parseInt(parts[3]);
		String time = parts[4];
		String[] timeParts = time,':');
		       
		int hours = Integer.parseInt(timeParts[0]);
		int minutes = Integer.parseInt(timeParts[0]);
		int seconds = Integer.parseInt(timeParts[0]);
				
		String timeZone = parts[5];*/
		
		try{
			return new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z").parse(date).getTime();
		}
		catch(ParseException pe)
		{
			return -1;
		}
	}
}