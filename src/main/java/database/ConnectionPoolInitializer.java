package database;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import config.ConfigLoader;

@WebListener
public class ConnectionPoolInitializer{

    public static HikariDataSource initPool() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(ConfigLoader.get("jdbcUrl"));
        config.setUsername(ConfigLoader.get("dbUsername"));
        config.setPassword(ConfigLoader.get("dbPassword"));
        config.setDriverClassName(ConfigLoader.get("dbDriver"));
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setIdleTimeout(30000);
        config.setMaxLifetime(1800000);
        config.setAutoCommit(true);

        return new HikariDataSource(config);
    }
}
