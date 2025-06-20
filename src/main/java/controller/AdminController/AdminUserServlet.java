package controller.AdminController;

import com.fasterxml.jackson.databind.ObjectMapper;
import dto.UserDTO;
import entity.User;
import exceptions.*;
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

@WebServlet("/api/admin/user")
public class AdminUserServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(AdminUserServlet.class);
    private UserService userService;
    private JwtUtil jwtUtil;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.userService = new UserService(dataSource);
        this.jwtUtil = new JwtUtil();
    }

    //Get a user
    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse resp){
        String authHeader = req.getHeader("Authorization");
        String userIdParam = req.getParameter("userId");
        try {
            this.jwtUtil.verifyAuthorizationHeader(authHeader);

            if(userIdParam == null) {
                logger.warn("Missing 'user_id' parameter in request");
                throw new InvalidUserIdException("Missing 'user_id' parameter");
            }

            int userId = Integer.parseInt(userIdParam);

            UserDTO user = this.userService.getUserData(userId);

            ObjectMapper objectMapper = new ObjectMapper();
            String json = objectMapper.writeValueAsString(user);

            resp.setContentType("application/json");
            resp.getWriter().write(json);
            resp.setStatus(HttpServletResponse.SC_OK);
        } catch (NotAuthorizedException e) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            logger.warn("", e);
        } catch (NumberFormatException | InvalidUserIdException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            logger.warn("", e);
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            logger.error("", e);
        }
    }

    //Create a new user
    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse resp){
        String authHeader = req.getHeader("Authorization");
        StringBuilder requestBody = new StringBuilder();

        try (BufferedReader reader = req.getReader()) {
            this.jwtUtil.verifyAuthorizationHeader(authHeader);

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
        } catch (NotAuthorizedException e) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            logger.warn("", e);
        } catch (Exception e) {
            logger.error("", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    //Update a user
    @Override
    public void doPut(HttpServletRequest req, HttpServletResponse resp){
        String authHeader = req.getHeader("Authorization");

        StringBuilder requestBody = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            this.jwtUtil.verifyAuthorizationHeader(authHeader);
            String line;
            while ((line = reader.readLine()) != null) {
                requestBody.append(line);
            }

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> bodyParams = objectMapper.readValue(requestBody.toString(), Map.class);

            String username = (String) bodyParams.get("username");
            String email = (String) bodyParams.get("email");
            String phoneNumber = (String) bodyParams.get("phone");
            String userIdAsString = (String) bodyParams.get("userId");

            int userId = Integer.parseInt(userIdAsString);

            User user = new User(userId, username, email, phoneNumber);
            this.userService.updateUserById(user);

            resp.setStatus(HttpServletResponse.SC_NO_CONTENT);

        } catch (NumberFormatException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            logger.warn("", e);
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

    //Delete a user
    @Override
    public void doDelete(HttpServletRequest req, HttpServletResponse resp){
        String authHeader = req.getHeader("Authorization");

        StringBuilder requestBody = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            this.jwtUtil.verifyAuthorizationHeader(authHeader);

            String line;
            while ((line = reader.readLine()) != null) {
                requestBody.append(line);
            }

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> bodyParams = objectMapper.readValue(requestBody.toString(), Map.class);

            String userIdAsString = (String) bodyParams.get("userId");

            int userId = Integer.parseInt(userIdAsString);

            this.userService.deleteUserById(userId);

            resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
            resp.setContentType("application/json");
        } catch (NumberFormatException | InvalidUserIdException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            logger.warn("", e);
        } catch (NotAuthorizedException e) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            logger.warn("", e);
        } catch (Exception e) {
            logger.error("", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
