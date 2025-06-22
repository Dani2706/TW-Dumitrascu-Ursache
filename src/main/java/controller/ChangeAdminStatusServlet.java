package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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

@WebServlet("/api/admin")
public class ChangeAdminStatusServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(ChangeAdminStatusServlet.class);
    private UserService userService;
    private JwtUtil jwtUtil;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.userService = new UserService(dataSource);
        this.jwtUtil = new JwtUtil();
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
        String authHeader = req.getHeader("Authorization");
        StringBuilder requestBody = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String token = this.jwtUtil.verifyAuthorizationHeader(authHeader);
            if (!this.jwtUtil.isAdmin(token)) {
                throw new NotAuthorizedException("User is not an admin");
            }

            String line;
            while ((line = reader.readLine()) != null) {
                requestBody.append(line);
            }

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> bodyParams = objectMapper.readValue(requestBody.toString(), Map.class);

            String adminStatusAsString = (String) bodyParams.get("adminStatus");
            String userIdAsString = (String) bodyParams.get("userId");

            int adminStatus = Integer.parseInt(adminStatusAsString);
            int userId = Integer.parseInt(userIdAsString);


            this.userService.changeAdminStatusOfUser(adminStatus, userId);

            resp.setStatus(HttpServletResponse.SC_OK);
        } catch (NumberFormatException | InvalidUserIdException e) {
            logger.warn("", e);
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        } catch (NotAuthorizedException e) {
            logger.warn("", e);
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        } catch (Exception e) {
            logger.error("", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
