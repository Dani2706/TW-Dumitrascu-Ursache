package controller;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.BufferedReader;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import exceptions.EmailAlreadyInUse;
import exceptions.UsernameAlreadyInUse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import service.UserService;
import util.HandleErrorUtil;

@WebServlet("/api/register")
public class RegisterController extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(RegisterController.class);
    private final UserService userService;

    public RegisterController() {
        this.userService = new UserService();
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
        DataSource dataSource = (DataSource) req.getServletContext().getAttribute("dataSource");

        // Read the request body
        StringBuilder requestBody = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                requestBody.append(line);
            }

            // Parse JSON body
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> bodyParams = objectMapper.readValue(requestBody.toString(), Map.class);

            String username = (String) bodyParams.get("username");
            String password = (String) bodyParams.get("password");
            String email = (String) bodyParams.get("email");

            this.userService.addUser(dataSource, username, email, password);

            resp.setStatus(HttpServletResponse.SC_CREATED);
        } catch (UsernameAlreadyInUse | EmailAlreadyInUse e) {
            logger.error("", e);
            resp.setStatus(HttpServletResponse.SC_CONFLICT);
            HandleErrorUtil.handleError(resp, e.getClass().getSimpleName(), logger);
        } catch (Exception e) {
            logger.error("", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
