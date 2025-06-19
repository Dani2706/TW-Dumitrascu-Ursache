package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dto.UserDTO;
import entity.User;
import exceptions.EmailAlreadyInUseException;
import exceptions.NotAuthorizedException;
import exceptions.PhoneNumberAlreadyInUseException;
import exceptions.UsernameAlreadyInUseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import service.UserService;
import util.HandleErrorUtil;
import util.JwtUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.BufferedReader;
import java.util.Map;

@WebServlet("/api/user/profile")
public class UserController extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private UserService userService;
    private JwtUtil jwtUtil;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.userService = new UserService(dataSource);
        this.jwtUtil = new JwtUtil();
    }

    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse resp){
        String authHeader = req.getHeader("Authorization");
        try {
            String token = this.jwtUtil.verifyAuthorizationHeader(authHeader);
            UserDTO user = this.userService.getUserData(token);

            ObjectMapper objectMapper = new ObjectMapper();
            String json = objectMapper.writeValueAsString(user);

            resp.setContentType("application/json");
            resp.getWriter().write(json);
            resp.setStatus(HttpServletResponse.SC_OK);
        } catch (NotAuthorizedException e) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            logger.warn("", e);
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            logger.error("", e);
        }
    }

    @Override
    public void doPut(HttpServletRequest req, HttpServletResponse resp){
        String authHeader = req.getHeader("Authorization");
        StringBuilder requestBody = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String token = this.jwtUtil.verifyAuthorizationHeader(authHeader);

            String line;
            while ((line = reader.readLine()) != null) {
                requestBody.append(line);
            }

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> bodyParams = objectMapper.readValue(requestBody.toString(), Map.class);

            String username = (String) bodyParams.get("username");
            String email = (String) bodyParams.get("email");
            String phoneNumber = (String) bodyParams.get("phone");

            User user = new User(username, email, phoneNumber);
            this.userService.updateUserById(user, token);

            resp.setStatus(HttpServletResponse.SC_NO_CONTENT);

        } catch (NotAuthorizedException e) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            logger.warn("", e);
        } catch (UsernameAlreadyInUseException | EmailAlreadyInUseException | PhoneNumberAlreadyInUseException e) {
            logger.warn("", e);
            resp.setStatus(HttpServletResponse.SC_CONFLICT);
            HandleErrorUtil.handleGetWriterError(resp, e.getClass().getSimpleName(), logger);
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            logger.error("", e);
        }
    }
}
