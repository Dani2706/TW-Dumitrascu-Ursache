package controller;
import com.fasterxml.jackson.databind.ObjectMapper;
import entity.User;
import exceptions.InvalidEmailException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import service.UserService;
import util.EmailUtil;
import util.JwtUtil;
import config.ConfigLoader;

import javax.mail.Authenticator;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.BufferedReader;
import java.util.Map;
import java.util.Properties;

@WebServlet("/api/email")
public class EmailServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(EmailServlet.class);
    private UserService userService;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.userService = new UserService(dataSource);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp){
        StringBuilder requestBody = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                requestBody.append(line);
            }

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> bodyParams = objectMapper.readValue(requestBody.toString(), Map.class);

            String toEmail = (String) bodyParams.get("email");

            final String fromEmail = ConfigLoader.get("email.form.username"); //requires valid gmail id
            final String password = ConfigLoader.get("email.from.password");; // correct password for gmail id

            System.out.println("TLSEmail Start");
            Properties props = new Properties();
            props.put("mail.smtp.host", ConfigLoader.get("smtp.host")); //SMTP Host
            props.put("mail.smtp.port", ConfigLoader.get("smtp.port")); //TLS Port
            props.put("mail.smtp.auth", "true"); //enable authentication
            props.put("mail.smtp.starttls.enable", "true"); //enable STARTTLS

            //create Authenticator object to pass in Session.getInstance argument
            Authenticator auth = new Authenticator() {
                //override the getPasswordAuthentication method
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(fromEmail, password);
                }
            };
            Session session = Session.getInstance(props, auth);

            String resetToken = this.userService.generateResetToken(toEmail);

            String scheme = req.getScheme();
            String serverName = req.getServerName();
            int serverPort = req.getServerPort();
            String contextPath = req.getContextPath();

            String baseUrl = scheme + "://" + serverName + ":" + serverPort + contextPath;

            String body = baseUrl +
                    "/reset-password" +
                    "/" + resetToken;

            EmailUtil.sendEmail(session, toEmail, "REM - Reset password", body);
            resp.setStatus(HttpServletResponse.SC_OK);
        } catch (InvalidEmailException e){
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            logger.warn("", e);
        } catch (Exception e){
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            logger.error("", e);
        }
    }
}

