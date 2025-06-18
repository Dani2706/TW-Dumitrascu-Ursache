package controller;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.BufferedReader;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import exceptions.EmailAlreadyInUseException;
import exceptions.PhoneNumberAlreadyInUseException;
import exceptions.UsernameAlreadyInUseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import service.UserService;
import util.HandleErrorUtil;

@WebServlet("/api/register")
public class RegisterController extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(RegisterController.class);
    private UserService userService;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.userService = new UserService(dataSource);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) {

        StringBuilder requestBody = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                requestBody.append(line);
            }

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> bodyParams = objectMapper.readValue(requestBody.toString(), Map.class);

            String username = (String) bodyParams.get("username");
            String password = (String) bodyParams.get("password");
            String email = (String) bodyParams.get("email");
            String phoneNumber = (String) bodyParams.get("phone");

            this.userService.addUser(username, email, password, phoneNumber);

            resp.setStatus(HttpServletResponse.SC_CREATED);
        } catch (UsernameAlreadyInUseException | EmailAlreadyInUseException | PhoneNumberAlreadyInUseException e) {
            logger.warn("", e);
            resp.setStatus(HttpServletResponse.SC_CONFLICT);
            HandleErrorUtil.handleGetWriterError(resp, e.getClass().getSimpleName(), logger);
        } catch (Exception e) {
            logger.error("", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
