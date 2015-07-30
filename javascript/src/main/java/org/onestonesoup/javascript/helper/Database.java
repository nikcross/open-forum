package org.onestonesoup.javascript.helper;

import java.io.File;
import java.net.URL;
import java.net.URLClassLoader;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.onestonesoup.core.data.EntityTree;

public class Database {

	private Map<String,Connection> connections = new HashMap<String,Connection>();
	private boolean debug = false;
		
	public void registerDriver(String driverName,String pageName,String jarFileName) throws Exception
	{
		URL jarURL = new File(jarFileName).toURI().toURL(); 
		
        try {
            URLClassLoader classLoader = new URLClassLoader( new URL[]{jarURL} );
            Driver driver = (Driver)classLoader.loadClass(driverName).newInstance();
            if(debug) {
	            System.out.println(driver);
	            System.out.println("v"+driver.getMajorVersion()+"."+driver.getMinorVersion());
	            System.out.println(driver.acceptsURL("jdbc:hsqldb:http://10.0.0.9/logger"));
            }
            
            driver = new JDBCDriverWrapper(driver);
            DriverManager.registerDriver (driver);
        }
        catch(Exception e)
        {
            e.printStackTrace();
        }    		
	}
	
	public void createAdminConnection(String url,String password) throws Exception
	{	
		Properties info = new java.util.Properties();
		info.put ("user", "sys");
		info.put ("password", password);
		info.put ("internal_logon","sysdba");		
		
        Connection connection = DriverManager.getConnection( url,info );
        connections.put( "admin",connection );
	}	
	
	public void createConnection(String alias,String url,String user,String password) throws Exception
	{
        Connection connection = DriverManager.getConnection( url,user,password );
        
        connections.put( alias,connection );
	}
	
	public EntityTree query(String alias,String query) throws Exception
	{
		Connection connection = getConnection(alias);
        PreparedStatement statement = null;
        ResultSet result = null;
        
		try{
	        statement = connection.prepareStatement(query);
	        result = statement.executeQuery();
	        
	        boolean hasMoreRows = result.next();
	        ResultSetMetaData metaData = result.getMetaData();
	        
	        int columns = metaData.getColumnCount();
	        
	        EntityTree table = new EntityTree("table");
	        EntityTree.TreeEntity columnsXml = table.addChild( "columns" );
	        for(int loop=0;loop<columns;loop++)
	        {
	        	EntityTree.TreeEntity column = columnsXml.addChild("column");
	        	column.setValue(metaData.getColumnName(loop+1));
	        	column.setAttribute("type",metaData.getColumnTypeName(loop+1));
	        }
	
	        int row = 0;
	         while(hasMoreRows)
	        {
	        	 EntityTree.TreeEntity rowXml = table.addChild("row"); 
	        	 for(int loopC=0;loopC<columns;loopC++)
	        	{
	        		rowXml.addChild("cell").setValue(result.getString(loopC+1));
	        	}
	        	
	    		hasMoreRows = result.next();
	        	row++;
	        }        
	        
	        table.setAttribute( "columns",""+columns );
	        table.setAttribute( "rows",""+row );

            if(debug) {
            	System.out.println("Database Processed Query "+query+" for schema alias "+alias);
            }
	        
	        return table;
		}
		finally
		{
			statement.close();
		}
	}
	
	public boolean execute(String alias,String executeStatement) throws Exception
	{
		Connection connection = getConnection(alias);
		Statement statement = connection.createStatement();
		
		try{
			boolean state = statement.execute(executeStatement);
	        
	        if(state==true)
	        {
	        	connection.commit();
	        }
	        

            if(debug) {
            	System.out.println("Database Executed "+executeStatement+" for schema alias "+alias);
            }
	        
	        return true;
		}
		finally
		{
			statement.close();
		}
	}
	
	protected Connection getConnection(String alias)
	{
		return (Connection)connections.get(alias);
	}
	
	public DatabaseMetaData getDatabaseMetaData(String alias) throws SQLException
	{
		return ((Connection)connections.get(alias)).getMetaData();
	}	
	
	public String[] getConnections()
	{
		return connections.keySet().toArray(new String[]{});
	}
	
	protected EntityTree getNextRow(ResultSet resultSet) throws SQLException
	{
	     ResultSetMetaData metaData = resultSet.getMetaData();   
	     int columns = metaData.getColumnCount();		
		
	     EntityTree rowXml = new EntityTree("row"); 
		 for(int loopC=0;loopC<columns;loopC++)
		{
			rowXml.addChild("cell").setValue(resultSet.getString(loopC+1));
		}
		 
		 return rowXml;
	}
	
	public EntityTree doPagedQuery( String alias,String selection,String from,int pageSize,int pageNumber ) throws Throwable
	{
		String rowsQuery = "SELECT COUNT(*) FROM "+from;
		EntityTree rowsResult = query( alias,rowsQuery );
		int rows = Integer.parseInt( rowsResult.getChild("row").getChild("cell").getValue() );
		
		int pagesAvailable = rows/pageSize;
		int startRow = pageNumber*pageSize;
		int endRow = (pageNumber+1)*pageSize;
		
		String query = "SELECT * FROM ( SELECT p.*, ROWNUM row# FROM ( SELECT "+selection+" FROM "+from+") p WHERE ROWNUM < "+endRow+" ) WHERE row# >= "+startRow;
		
		EntityTree result = query( alias,query );
		result.setAttribute("pagesAvailable",""+pagesAvailable);
		result.setAttribute("pageSize",""+pageSize);
		result.setAttribute("pageNumber",""+pageNumber);
		

        if(debug) {
        	System.out.println("Database Processed Paged Query "+selection+" for schema alias "+alias+" page "+pageNumber+" of "+pageSize);
        }
		
		return result;
	}

	public boolean isDebug() {
		return debug;
	}

	public void setDebug(boolean debug) {
		this.debug = debug;
	}
}
