package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dto.AdminUserDTO;
import exceptions.NotAuthorizedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import service.UserService;
import util.JwtUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.util.List;

@WebServlet("/api/all-users")
public class AdminGetAllUsersServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(AdminGetAllUsersServlet.class);
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

            if (!this.jwtUtil.isAdmin(token)){
                throw new NotAuthorizedException("User is not an admin");
            }
            String usersAsJson = this.userService.getAllUsers();

            resp.setContentType("application/json");
            resp.getWriter().write(usersAsJson);
            resp.setStatus(HttpServletResponse.SC_OK);
        } catch (NotAuthorizedException e) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            logger.warn("", e);
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            logger.error("", e);
        }
    }
}
