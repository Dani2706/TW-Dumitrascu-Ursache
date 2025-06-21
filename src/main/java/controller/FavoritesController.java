package controller;

import exceptions.DatabaseException;
import exceptions.NotAuthorizedException;
import exceptions.PropertyDataException;
import exceptions.PropertyValidationException;
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

@WebServlet("/api/favorites/*")
public class FavoritesController extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(FavoritesController.class);
    private PropertyService propertyService;
    private JwtUtil jwtUtil;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.propertyService = new PropertyService(dataSource);
        this.jwtUtil = new JwtUtil();
        logger.info("FavoritesController initialized with FavoriteService");
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        logger.debug("Received request for user favorite properties");
        String authHeader = request.getHeader("Authorization");
        try {
            String token = this.jwtUtil.verifyAuthorizationHeader(authHeader);

            String jsonString = propertyService.getUserFavorites(token);

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(jsonString);
            response.setStatus(HttpServletResponse.SC_OK);

        } catch (NumberFormatException | PropertyValidationException e) {
            logger.warn("Invalid parameter: ", e);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            HandleErrorUtil.handleGetWriterError(response, "Invalid parameter", logger);
        } catch (NotAuthorizedException e) {
            logger.warn("Unauthorized access: ", e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        } catch (PropertyDataException | DatabaseException | IOException e) {
            logger.error("Error retrieving favorite properties: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            HandleErrorUtil.handleGetWriterError(response, e.getMessage(), logger);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        logger.debug("Received request to add property to favorites");

        String authHeader = request.getHeader("Authorization");
        try {
            String token = this.jwtUtil.verifyAuthorizationHeader(authHeader);

            String pathInfo = request.getPathInfo();
            if (pathInfo == null || pathInfo.length() <= 1) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            String propertyIdStr = pathInfo.substring(1); // Remove leading slash
            int propertyId = Integer.parseInt(propertyIdStr);

            logger.info("Adding property ID {} to user's favorites", propertyId);

            propertyService.addFavorite(propertyId, token);

            response.setStatus(HttpServletResponse.SC_CREATED);

        } catch (NumberFormatException e) {
            logger.warn("Invalid property ID parameter: ", e);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        } catch (NotAuthorizedException e) {
            logger.warn("Unauthorized access attempt: ", e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        } catch (DatabaseException e) {
            logger.error("Error adding favorite: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        } catch (PropertyDataException e) {
            logger.warn("Property data error: ", e);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) {
        logger.debug("Received request to remove favorite listing");

        String authHeader = request.getHeader("Authorization");
        try {
            String token = this.jwtUtil.verifyAuthorizationHeader(authHeader);

            String pathInfo = request.getPathInfo();
            if (pathInfo == null || pathInfo.length() <= 1) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            String propertyIdStr = pathInfo.substring(1); // Remove leading slash
            int propertyId = Integer.parseInt(propertyIdStr);

            logger.info("Removing property ID {} from user's favorites", propertyId);

            propertyService.removeFavorite(propertyId, token);

            response.setStatus(HttpServletResponse.SC_NO_CONTENT);

        } catch (NumberFormatException e) {
            logger.warn("Invalid property ID parameter: ", e);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        } catch (NotAuthorizedException e) {
            logger.warn("Unauthorized access attempt: ", e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        } catch (DatabaseException e) {
            logger.error("Error removing favorite: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        } catch (PropertyDataException e) {
            throw new RuntimeException(e);
        }
    }
}