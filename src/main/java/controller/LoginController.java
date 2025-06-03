package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import exceptions.InvalidPasswordException;
import exceptions.InvalidUsernameException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import service.UserService;
import util.HandleErrorUtil;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.BufferedReader;
import java.util.Map;

@WebServlet("/api/login")
public class LoginController extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(LoginController.class);
    private final UserService userService;

    public LoginController() {
        this.userService = new UserService();
    }

    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse resp){
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

            this.userService.validateCredentials(dataSource, username, password);

            String generatedToken = this.userService.generateJWT(username);
            String responseBody = "{\"token\":\"" + generatedToken + "\"}";
            resp.setStatus(HttpServletResponse.SC_OK);
            resp.setCharacterEncoding("UTF-8");
            resp.setContentType("application/json");
            resp.getWriter().write(responseBody);

        } catch (InvalidUsernameException | InvalidPasswordException e) {
            logger.error("", e);
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            HandleErrorUtil.handleError(resp, e.getClass().getSimpleName(), logger);
        } catch (Exception e) {
            logger.error("", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
