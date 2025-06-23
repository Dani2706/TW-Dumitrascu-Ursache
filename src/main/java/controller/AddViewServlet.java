package controller;

import exceptions.DatabaseException;
import exceptions.NotAuthorizedException;
import exceptions.PropertyDataException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import service.PropertyService;
import util.JwtUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

@WebServlet("/api/views/*")
public class AddViewServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(AddViewServlet.class);
    private PropertyService propertyService;
    private JwtUtil jwtUtil;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.propertyService = new PropertyService(dataSource);
        this.jwtUtil = new JwtUtil();
        logger.info("AddViewServlet initialized with PropertyService");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        logger.debug("Received request to record a property view");

        String authHeader = request.getHeader("Authorization");
        try {
            String token = null;
            // Token is optional - anonymous views are also recorded
            if (authHeader != null && !authHeader.isEmpty()) {
                token = this.jwtUtil.verifyAuthorizationHeader(authHeader);
            }

            String pathInfo = request.getPathInfo();
            if (pathInfo == null || pathInfo.length() <= 1) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            String propertyIdStr = pathInfo.substring(1);
            int propertyId = Integer.parseInt(propertyIdStr);

            logger.info("Recording view for property ID {}", propertyId);

            propertyService.addPropertyView(propertyId, token);

            response.setStatus(HttpServletResponse.SC_CREATED);

        } catch (NumberFormatException e) {
            logger.warn("Invalid property ID parameter: ", e);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        } catch (NotAuthorizedException e) {
            logger.warn("Unauthorized access attempt: ", e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        } catch (DatabaseException e) {
            logger.error("Error recording property view: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        } catch (PropertyDataException e) {
            logger.warn("Property data error: ", e);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }
}