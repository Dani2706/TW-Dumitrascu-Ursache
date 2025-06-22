package config;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

@WebListener
public class ConfigLoader implements ServletContextListener {
    private final static Properties properties = new Properties();

    private void init(){
        try (InputStream input = ConfigLoader.class.getClassLoader().getResourceAsStream("config.properties")) {
            if (input == null) {
                throw new RuntimeException("config.properties not found in resources folder");
            }
            properties.load(input);
        } catch (IOException ex) {
            throw new RuntimeException("Failed to load config.properties", ex);
        }
    }

    public static String get(String key) {
        return properties.getProperty(key);
    }

    @Override
    public void contextInitialized(ServletContextEvent sce){
        init();
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce){}
}

