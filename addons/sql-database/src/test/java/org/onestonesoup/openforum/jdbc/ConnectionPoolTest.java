package org.onestonesoup.openforum.jdbc;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.sql.Connection;
import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.DriverPropertyInfo;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.SQLFeatureNotSupportedException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Logger;

import junit.framework.TestCase;

/*
 * OFS (TT-B-011): the per-alias connection pool, with fake JDBC objects (no database needed).
 */
public class ConnectionPoolTest extends TestCase {

	// A fake connection: valid until broken, counts how many statements run on it at once.
	static class FakeConnection implements InvocationHandler {
		volatile boolean closed = false;
		volatile boolean valid = true;
		final AtomicInteger running = new AtomicInteger();
		final AtomicInteger maxRunning;
		final long queryMillis;

		FakeConnection(AtomicInteger maxRunning, long queryMillis) {
			this.maxRunning = maxRunning;
			this.queryMillis = queryMillis;
		}

		Connection proxy() {
			return (Connection) Proxy.newProxyInstance(getClass().getClassLoader(), new Class[] { Connection.class }, this);
		}

		public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
			String name = method.getName();
			if (name.equals("isClosed")) return closed;
			if (name.equals("close")) { closed = true; return null; }
			if (name.equals("isValid")) return valid && !closed;
			if (name.equals("commit")) return null;
			if (name.equals("prepareStatement") || name.equals("createStatement")) return statement();
			if (name.equals("hashCode")) return System.identityHashCode(proxy);
			if (name.equals("equals")) return proxy == args[0];
			if (name.equals("toString")) return "FakeConnection";
			throw new UnsupportedOperationException(name);
		}

		private Object statement() {
			return Proxy.newProxyInstance(getClass().getClassLoader(), new Class[] { PreparedStatement.class },
					new InvocationHandler() {
						public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
							String name = method.getName();
							if (name.equals("close")) return null;
							if (name.equals("executeQuery") || name.equals("execute")) {
								if (!valid) throw new SQLException("Connection lost");
								int now = running.incrementAndGet();
								synchronized (maxRunning) { if (now > maxRunning.get()) maxRunning.set(now); }
								try { Thread.sleep(queryMillis); } finally { running.decrementAndGet(); }
								return name.equals("execute") ? (Object) Boolean.FALSE : resultSet();
							}
							if (name.equals("hashCode")) return System.identityHashCode(proxy);
							throw new UnsupportedOperationException(name);
						}
					});
		}

		private ResultSet resultSet() {
			final int[] row = { 0 };
			final ResultSetMetaData meta = (ResultSetMetaData) Proxy.newProxyInstance(getClass().getClassLoader(),
					new Class[] { ResultSetMetaData.class }, new InvocationHandler() {
						public Object invoke(Object proxy, Method method, Object[] args) {
							String name = method.getName();
							if (name.equals("getColumnCount")) return 1;
							if (name.equals("getColumnName")) return "v";
							if (name.equals("getColumnTypeName")) return "text";
							throw new UnsupportedOperationException(name);
						}
					});
			return (ResultSet) Proxy.newProxyInstance(getClass().getClassLoader(), new Class[] { ResultSet.class },
					new InvocationHandler() {
						public Object invoke(Object proxy, Method method, Object[] args) {
							String name = method.getName();
							if (name.equals("next")) return row[0]++ < 1;
							if (name.equals("getMetaData")) return meta;
							if (name.equals("getString")) return "one";
							if (name.equals("close")) return null;
							throw new UnsupportedOperationException(name);
						}
					});
		}
	}

	static class Factory implements ConnectionPool.ConnectionFactory {
		final List<FakeConnection> opened = new ArrayList<FakeConnection>();
		final AtomicInteger maxRunning = new AtomicInteger();
		final long queryMillis;
		volatile boolean fail = false;

		Factory(long queryMillis) { this.queryMillis = queryMillis; }

		public synchronized Connection open() throws Exception {
			if (fail) throw new SQLException("Cannot connect");
			FakeConnection connection = new FakeConnection(maxRunning, queryMillis);
			opened.add(connection);
			return connection.proxy();
		}
	}

	private ConnectionPool pool(Factory factory, int size, long waitMillis, long checkAfterIdleMillis) throws Exception {
		ConnectionPool pool = new ConnectionPool("test", factory, size, waitMillis, checkAfterIdleMillis, 1);
		pool.start();
		return pool;
	}

	public void testStartOpensOneAndFailsLikeBefore() throws Exception {
		Factory factory = new Factory(0);
		ConnectionPool pool = pool(factory, 4, 1000, 30000);
		assertEquals(1, factory.opened.size());
		assertEquals(1, pool.getIdleCount());

		Factory broken = new Factory(0);
		broken.fail = true;
		try {
			pool(broken, 4, 1000, 30000);
			fail("A bad connection must fail at start-up");
		} catch (SQLException e) {
			assertEquals("Cannot connect", e.getMessage());
		}
	}

	public void testConnectionIsReused() throws Exception {
		Factory factory = new Factory(0);
		ConnectionPool pool = pool(factory, 4, 1000, 30000);
		for (int i = 0; i < 20; i++) {
			Connection connection = pool.borrow();
			pool.release(connection);
		}
		assertEquals(1, factory.opened.size());
		assertEquals(0, pool.getInUseCount());
	}

	public void testNeverMoreThanMaxSizeAndWaitTimesOut() throws Exception {
		Factory factory = new Factory(0);
		ConnectionPool pool = pool(factory, 2, 200, 30000);
		Connection a = pool.borrow();
		Connection b = pool.borrow();
		long start = System.currentTimeMillis();
		try {
			pool.borrow();
			fail("A third connection must not be lent");
		} catch (SQLException e) {
			assertTrue(e.getMessage(), e.getMessage().indexOf("No database connection free") != -1);
		}
		assertTrue(System.currentTimeMillis() - start >= 150);
		pool.release(a);
		Connection c = pool.borrow();
		assertSame(a, c);
		pool.release(b);
		pool.release(c);
		assertEquals(0, pool.getInUseCount());
		assertEquals(2, factory.opened.size());
	}

	public void testClosedConnectionIsNotReused() throws Exception {
		Factory factory = new Factory(0);
		ConnectionPool pool = pool(factory, 2, 1000, 30000);
		Connection a = pool.borrow();
		a.close();
		pool.release(a);
		Connection b = pool.borrow();
		assertNotSame(a, b);
		assertEquals(2, factory.opened.size());
		pool.release(b);
	}

	public void testBrokenConnectionAfterErrorIsReplaced() throws Exception {
		Factory factory = new Factory(0);
		ConnectionPool pool = pool(factory, 2, 1000, 30000);
		Connection a = pool.borrow();
		factory.opened.get(0).valid = false;
		pool.releaseAfterError(a);
		assertTrue(factory.opened.get(0).closed);
		Connection b = pool.borrow();
		assertNotSame(a, b);
		pool.release(b);
		assertEquals(0, pool.getInUseCount());
	}

	public void testWorkingConnectionAfterErrorIsKept() throws Exception {
		Factory factory = new Factory(0);
		ConnectionPool pool = pool(factory, 2, 1000, 30000);
		Connection a = pool.borrow();
		pool.releaseAfterError(a);
		assertSame(a, pool.borrow());
	}

	public void testIdleConnectionIsCheckedBeforeLending() throws Exception {
		Factory factory = new Factory(0);
		ConnectionPool pool = pool(factory, 2, 1000, 50);
		Thread.sleep(100);
		factory.opened.get(0).valid = false; // e.g. the database restarted while it was idle
		Connection b = pool.borrow();
		assertEquals(2, factory.opened.size());
		assertTrue(factory.opened.get(0).closed);
		pool.release(b);
	}

	public void testManyThreads() throws Exception {
		final Factory factory = new Factory(1);
		final ConnectionPool pool = pool(factory, 4, 10000, 30000);
		final AtomicInteger failures = new AtomicInteger();
		List<Thread> threads = new ArrayList<Thread>();
		for (int t = 0; t < 16; t++) {
			Thread thread = new Thread(new Runnable() {
				public void run() {
					for (int i = 0; i < 50; i++) {
						try {
							Connection connection = pool.borrow();
							try {
								connection.prepareStatement("select 1").executeQuery();
							} finally {
								pool.release(connection);
							}
						} catch (Exception e) {
							failures.incrementAndGet();
						}
					}
				}
			});
			threads.add(thread);
			thread.start();
		}
		for (Thread thread : threads) thread.join();
		assertEquals(0, failures.get());
		assertTrue(factory.opened.size() <= 4);
		assertEquals(0, pool.getInUseCount());
		for (FakeConnection connection : factory.opened) assertTrue(connection.maxRunning.get() <= 4);
	}

	// The real DatabaseAPI over a fake driver: answers are unchanged, and queries from several
	// threads now run at the same time instead of one after another.
	public void testDatabaseApiRunsQueriesTogether() throws Throwable {
		final Factory factory = new Factory(200);
		Driver driver = new Driver() {
			public Connection connect(String url, Properties info) throws SQLException {
				if (!acceptsURL(url)) return null;
				try { return factory.open(); } catch (Exception e) { throw new SQLException(e); }
			}
			public boolean acceptsURL(String url) { return url.startsWith("jdbc:ofs-fake:"); }
			public DriverPropertyInfo[] getPropertyInfo(String url, Properties info) { return new DriverPropertyInfo[0]; }
			public int getMajorVersion() { return 1; }
			public int getMinorVersion() { return 0; }
			public boolean jdbcCompliant() { return false; }
			public Logger getParentLogger() throws SQLFeatureNotSupportedException { throw new SQLFeatureNotSupportedException(); }
		};
		DriverManager.registerDriver(driver);
		try {
			final DatabaseAPI api = new DatabaseAPI();
			api.createConnection("fake", "jdbc:ofs-fake:db", "user", "password");

			String json = api.query("fake", "select 'one' as v");
			assertTrue(json, json.indexOf("columnName: \"v\"") != -1);
			assertTrue(json, json.indexOf("cell0: \"one\"") != -1);
			assertTrue(json, json.indexOf("rowCount: \"1\"") != -1);
			assertTrue(api.execute("fake", "update t set v = 1"));

			final AtomicInteger failures = new AtomicInteger();
			List<Thread> threads = new ArrayList<Thread>();
			long start = System.currentTimeMillis();
			for (int t = 0; t < 4; t++) {
				Thread thread = new Thread(new Runnable() {
					public void run() {
						try { api.query("fake", "select 'one' as v"); } catch (Exception e) { failures.incrementAndGet(); }
					}
				});
				threads.add(thread);
				thread.start();
			}
			for (Thread thread : threads) thread.join();
			long took = System.currentTimeMillis() - start;
			System.out.println("ConnectionPoolTest: 4 queries of 200 ms from 4 threads took " + took + " ms");
			assertEquals(0, failures.get());
			assertTrue("Took " + took + " ms, so they ran one after another", took < 600);
		} finally {
			DriverManager.deregisterDriver(driver);
		}
	}
}
