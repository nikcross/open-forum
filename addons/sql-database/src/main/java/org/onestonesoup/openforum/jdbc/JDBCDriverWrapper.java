package org.onestonesoup.openforum.jdbc;

import java.sql.Connection;
import java.sql.Driver;
import java.sql.DriverPropertyInfo;
import java.sql.SQLException;
import java.sql.SQLFeatureNotSupportedException;
import java.util.Properties;
import java.util.logging.Logger;

public class JDBCDriverWrapper implements Driver{

	    private Driver driver;
	    public JDBCDriverWrapper(Driver d) {
	        this.driver = d;
	    }
	    public boolean acceptsURL(String u) throws SQLException {
	        return this.driver.acceptsURL(u);
	    }
	    public Connection connect(String u, Properties p) throws SQLException {
	        return this.driver.connect(u, p);
	    }
	    public int getMajorVersion() {
	        return this.driver.getMajorVersion();
	    }
	    public int getMinorVersion() {
	        return this.driver.getMinorVersion ();
	    }
	    public DriverPropertyInfo[] getPropertyInfo(String u, Properties p) throws SQLException {
	        return this.driver.getPropertyInfo(u, p);
	    }
	    public boolean jdbcCompliant() {
	        return this.driver.jdbcCompliant();
	    }
		public Logger getParentLogger() throws SQLFeatureNotSupportedException {
			throw new SQLFeatureNotSupportedException();
		}
}
