package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import exceptions.InvalidResetTokenException;
import exceptions.NotAuthorizedException;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import service.UserService;
import util.JwtUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.BufferedReader;
import java.util.Map;

@WebServlet("/api/reset-password")
public class ResetPasswordServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(ResetPasswordServlet.class);
    private UserService userService;
    private JwtUtil jwtUtil;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.userService = new UserService(dataSource);
        this.jwtUtil = new JwtUtil();
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp){
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

            String password = (String) bodyParams.get("password");

            this.userService.resetPassword(token, password);

            resp.setStatus(HttpServletResponse.SC_OK);

        } catch (NotAuthorizedException | InvalidResetTokenException | NumberFormatException e){
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            logger.warn("", e);
        } catch (Exception e){
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            logger.error("", e);
        }
    }
}
