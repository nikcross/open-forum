package org.onestonesoup.openforum.jdbc;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

/*
 * OFS (TT-B-011): DatabaseAPI used to keep a single Connection per alias, shared by every request
 * on the server. A JDBC connection runs one statement at a time, so every query from every page
 * and every user queued behind the others, and a dropped connection broke the alias until the
 * server restarted. This keeps up to maxSize connections per alias: a statement borrows one, runs
 * on it alone and gives it back. A connection that has been idle for a while is checked before it
 * is lent and replaced if it no longer works.
 */
public class ConnectionPool {

	public interface ConnectionFactory {
		Connection open() throws Exception;
	}

	private final String alias;
	private final ConnectionFactory factory;
	private final int maxSize;
	private final long borrowWaitMillis;
	private final long checkAfterIdleMillis;
	private final int checkTimeoutSeconds;

	private final Semaphore permits;
	private final LinkedBlockingDeque<Connection> idle = new LinkedBlockingDeque<Connection>();
	private final Map<Connection, Long> lastReturned = new ConcurrentHashMap<Connection, Long>();
	private volatile boolean closed = false;

	public ConnectionPool(String alias, ConnectionFactory factory, int maxSize, long borrowWaitMillis,
			long checkAfterIdleMillis, int checkTimeoutSeconds) {
		this.alias = alias;
		this.factory = factory;
		this.maxSize = Math.max(1, maxSize);
		this.borrowWaitMillis = borrowWaitMillis;
		this.checkAfterIdleMillis = checkAfterIdleMillis;
		this.checkTimeoutSeconds = checkTimeoutSeconds;
		this.permits = new Semaphore(this.maxSize, true);
	}

	// Opens the first connection now, so a bad url or password fails at start-up as it always has.
	public void start() throws Exception {
		Connection connection = factory.open();
		lastReturned.put(connection, System.currentTimeMillis());
		idle.offerFirst(connection);
	}

	public Connection borrow() throws Exception {
		if (closed) throw new SQLException("Database connections for alias " + alias + " are closed.");
		if (!permits.tryAcquire(borrowWaitMillis, TimeUnit.MILLISECONDS)) {
			throw new SQLException("No database connection free for alias " + alias + " after " + borrowWaitMillis + " ms ("
					+ maxSize + " in use).");
		}
		try {
			Connection connection;
			while ((connection = idle.pollFirst()) != null) {
				Long returnedAt = lastReturned.remove(connection);
				if (isUsable(connection, returnedAt)) return connection;
				closeQuietly(connection);
			}
			return factory.open();
		} catch (Exception e) {
			permits.release();
			throw e;
		}
	}

	// Gives a borrowed connection back. One that is closed or failed is dropped, not reused.
	public void release(Connection connection) {
		try {
			if (connection == null) return;
			boolean usable;
			try {
				usable = !connection.isClosed();
			} catch (SQLException e) {
				usable = false;
			}
			if (usable && !closed) {
				lastReturned.put(connection, System.currentTimeMillis());
				idle.offerFirst(connection);
			} else {
				closeQuietly(connection);
			}
		} finally {
			permits.release();
		}
	}

	// Gives a connection back after a statement on it failed: kept only if it still works, so a
	// dropped connection (e.g. after a database restart) is replaced rather than lent out again.
	public void releaseAfterError(Connection connection) {
		boolean works;
		try {
			works = connection != null && !connection.isClosed() && connection.isValid(checkTimeoutSeconds);
		} catch (Throwable t) {
			works = false;
		}
		if (works) release(connection);
		else discard(connection);
	}

	// Drops a borrowed connection that is known to be broken.
	public void discard(Connection connection) {
		try {
			closeQuietly(connection);
		} finally {
			permits.release();
		}
	}

	public void close() {
		closed = true;
		Connection connection;
		while ((connection = idle.pollFirst()) != null) {
			lastReturned.remove(connection);
			closeQuietly(connection);
		}
	}

	public int getIdleCount() {
		return idle.size();
	}

	public int getInUseCount() {
		return maxSize - permits.availablePermits();
	}

	public int getMaxSize() {
		return maxSize;
	}

	private boolean isUsable(Connection connection, Long returnedAt) {
		try {
			if (connection.isClosed()) return false;
			if (returnedAt != null && System.currentTimeMillis() - returnedAt < checkAfterIdleMillis) return true;
			return connection.isValid(checkTimeoutSeconds);
		} catch (Throwable t) {
			return false;
		}
	}

	private static void closeQuietly(Connection connection) {
		if (connection == null) return;
		try {
			connection.close();
		} catch (Throwable t) {
		}
	}
}
