package org.onestonesoup.openforum.jdbc;

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
import org.onestonesoup.core.data.EntityTree.TreeEntity;
import org.onestonesoup.openforum.plugin.SystemAPI;

public class DatabaseAPI extends SystemAPI {

	private Map<String, Connection> connections = new HashMap<String, Connection>();

	public void registerDriver(String driverName, String pageName,
			String jarFileName) throws Exception {
		URL jarURL = getController()
				.getFileManager()
				.getResourceStore(getController().getSystemLogin())
				.getResourceURL(
						getController()
								.getFileManager()
								.getResourceStore(
										getController().getSystemLogin())
								.getResource(pageName + "/" + jarFileName));

		URLClassLoader classLoader = null;
		try {
			classLoader = new URLClassLoader(new URL[] { jarURL });
			Driver driver = (Driver) classLoader.loadClass(driverName)
					.newInstance();

			driver = new JDBCDriverWrapper(driver);
			DriverManager.registerDriver(driver);
		} catch (Exception e) {
			e.printStackTrace();
		}/* finally {
			classLoader.close();
		}*/
	}

	public void createAdminConnection(String url, String password)
			throws Exception {
		Properties info = new java.util.Properties();
		info.put("user", "sys");
		info.put("password", password);
		info.put("internal_logon", "sysdba");

		Connection connection = DriverManager.getConnection(url, info);
		connections.put("admin", connection);
	}

	public void createConnection(String alias, String url, String user,
			String password) throws Exception {
		try{
		Connection connection = DriverManager
				.getConnection(url, user, password);

		connections.put(alias, connection);
		} catch(Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	public String query(String alias, String query) throws Exception {
		return JSONHelper.toJSON(queryAsEntityTree(alias, query));
	}

	private EntityTree queryAsEntityTree(String alias, String query)
			throws Exception {
		Connection connection = getConnection(alias);
		PreparedStatement statement = null;
		ResultSet result = null;

		try {
			statement = connection.prepareStatement(query);
			result = statement.executeQuery();

			boolean hasMoreRows = result.next();
			ResultSetMetaData metaData = result.getMetaData();

			int columns = metaData.getColumnCount();

			EntityTree table = new EntityTree("table");
			TreeEntity columnsEntity = table.addChild("columns");
			for (int loop = 0; loop < columns; loop++) {
				TreeEntity column = columnsEntity.addChild("column"+loop);
				column.setAttribute("columnName",
						metaData.getColumnName(loop + 1));
				column.setAttribute("type",
						metaData.getColumnTypeName(loop + 1));
			}

			int row = 0;
			TreeEntity rows = table.addChild("rows");
			while (hasMoreRows) {
				TreeEntity rowEntity = rows.addChild("row"+row);
				for (int loopC = 0; loopC < columns; loopC++) {
					rowEntity.addChild("cell"+loopC).setValue(
							result.getString(loopC + 1));
				}

				hasMoreRows = result.next();
				row++;
			}

			table.setAttribute("columnCount", "" + columns);
			table.setAttribute("rowCount", "" + row);

			System.out.println("Database Processed Query " + query
					+ " for schema alias " + alias);

			return table;
		} finally {
			statement.close();
		}
	}

	public boolean execute(String alias, String executeStatement)
			throws Exception {
		Connection connection = getConnection(alias);
		Statement statement = connection.createStatement();

		try {
			boolean state = statement.execute(executeStatement);

			if (state == true) {
				connection.commit();
			}

			System.out.println("Database Executed " + executeStatement
					+ " for schema alias " + alias);

			return true;
		} finally {
			statement.close();
		}
	}

	protected Connection getConnection(String alias) {
		return (Connection) connections.get(alias);
	}

	public DatabaseMetaData getDatabaseMetaData(String alias)
			throws SQLException {
		return ((Connection) connections.get(alias)).getMetaData();
	}

	public String[] getConnections() {
		return connections.keySet().toArray(new String[] {});
	}

	protected String getNextRow(ResultSet resultSet) throws SQLException {
		ResultSetMetaData metaData = resultSet.getMetaData();
		int columns = metaData.getColumnCount();

		EntityTree rowEntity = new EntityTree("row");
		for (int loopC = 0; loopC < columns; loopC++) {
			rowEntity.addChild("cell").setValue(resultSet.getString(loopC + 1));
		}

		return JSONHelper.toJSON(rowEntity);
	}

	public String doPagedQuery(String alias, String selection, String from,
			int pageSize, int pageNumber) throws Throwable {
		String rowsQuery = "SELECT COUNT(*) FROM " + from;
		EntityTree rowsResult = queryAsEntityTree(alias, rowsQuery);
		int rows = Integer.parseInt(rowsResult.getChild("rows").getChild("row0").getChild("cell0")
				.getValue());

		int pagesAvailable = rows / pageSize;
		int startRow = pageNumber * pageSize;
		int endRow = (pageNumber + 1) * pageSize;

		String query = "SELECT * FROM ( SELECT p.*, ROWNUM row# FROM ( SELECT "
				+ selection + " FROM " + from + ") p WHERE ROWNUM < " + endRow
				+ " ) WHERE row# >= " + startRow;

		EntityTree result = queryAsEntityTree(alias, query);
		result.setAttribute("pagesAvailable", "" + pagesAvailable);
		result.setAttribute("pageSize", "" + pageSize);
		result.setAttribute("pageNumber", "" + pageNumber);

		System.out.println("Database Processed Paged Query " + selection
				+ " for schema alias " + alias + " page " + pageNumber + " of "
				+ pageSize);

		return JSONHelper.toJSON(result);
	}

	/*
	 * Paginator
	 * 
	 * SELECT * FROM ( SELECT p.*, ROWNUM row# FROM (SELECT * FROM EMPLOYEES) p
	 * WHERE ROWNUM < 15 ) WHERE row# >= 5
	 */
}
