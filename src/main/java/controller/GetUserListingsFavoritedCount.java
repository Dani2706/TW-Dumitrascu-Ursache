package controller;

import exceptions.DatabaseException;
import exceptions.NotAuthorizedException;
import exceptions.PropertyDataException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import service.PropertyService;
import util.HandleErrorUtil;
import util.JwtUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.IOException;

@WebServlet("/api/user-listings-favorited-count")
public class GetUserListingsFavoritedCount extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(GetUserListingsFavoritedCount.class);
    private PropertyService propertyService;
    private JwtUtil jwtUtil;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.propertyService = new PropertyService(dataSource);
        this.jwtUtil = new JwtUtil();
        logger.info("GetUserListingsFavoritedCount controller initialized");
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        logger.debug("Received request for user listings favorited count");
        String authHeader = request.getHeader("Authorization");
        try {
            String token = this.jwtUtil.verifyAuthorizationHeader(authHeader);

            String jsonString = propertyService.getUserListingsFavoritedCount(token);

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(jsonString);
            response.setStatus(HttpServletResponse.SC_OK);

        } catch (NumberFormatException e) {
            logger.warn("Invalid parameter: ", e);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            HandleErrorUtil.handleGetWriterError(response, "Invalid parameter", logger);
        } catch (NotAuthorizedException e) {
            logger.warn("Unauthorized access: ", e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        } catch (PropertyDataException | DatabaseException | IOException e) {
            logger.error("Error retrieving user listings favorited count: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            HandleErrorUtil.handleGetWriterError(response, e.getMessage(), logger);
        }
    }
}