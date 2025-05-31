package database;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

@WebListener
public class ConnectionPoolInitializer implements ServletContextListener {
    private static HikariDataSource dataSource;

    public ConnectionPoolInitializer() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:oracle:thin:@localhost:1521:xe");
        config.setUsername("tw");
        config.setPassword("TW123");
        config.setDriverClassName("oracle.jdbc.OracleDriver");
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setIdleTimeout(30000);
        config.setMaxLifetime(1800000);
        config.setAutoCommit(true);

        dataSource = new HikariDataSource(config);
    }

    @Override
    public void contextInitialized(ServletContextEvent sce){
        sce.getServletContext().setAttribute("dataSource", dataSource);
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce){
        dataSource.close();
    }
}
