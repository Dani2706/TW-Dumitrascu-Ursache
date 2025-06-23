package config;

import com.zaxxer.hikari.HikariDataSource;
import database.ConnectionPoolInitializer;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;
import javax.sql.DataSource;
import java.util.Properties;

@WebListener
public class AppInitializer implements ServletContextListener {
    private HikariDataSource dataSource;

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        // Step 1: Load config
        ConfigLoader.init();

        // Step 2: Initialize connection pool after config is loaded
        HikariDataSource dataSource = ConnectionPoolInitializer.initPool();
        this.dataSource = dataSource;
        sce.getServletContext().setAttribute("dataSource", dataSource);
    }
    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        this.dataSource.close();
    }
}
