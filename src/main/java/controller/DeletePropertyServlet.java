package controller;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import service.PropertyService;
import exceptions.PropertyDataException;
import util.HandleErrorUtil;

@WebServlet("/delete-property")
public class DeletePropertyServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(DeletePropertyServlet.class);
    private PropertyService propertyService;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.propertyService = new PropertyService(dataSource);
        logger.info("DeletePropertyServlet initialized with PropertyService");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        logger.debug("Received request to delete property");

        String propertyIdParam = request.getParameter("propertyId");

        // hardcoded for demo
        int userId = 1;

        try {
            if (propertyIdParam == null || propertyIdParam.isEmpty()) {
                logger.warn("Missing propertyId parameter");
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                HandleErrorUtil.handleError(response, "Missing propertyId parameter", logger);
                return;
            }

            int propertyId = Integer.parseInt(propertyIdParam);
            propertyService.deleteProperty(propertyId, userId);

            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":true,\"message\":\"Property deleted successfully\"}");
            logger.debug("Property with ID {} deleted successfully", propertyId);

        } catch (NumberFormatException e) {
            logger.warn("Invalid propertyId parameter: {}", propertyIdParam);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            HandleErrorUtil.handleError(response, "Invalid propertyId parameter", logger);
        } catch (PropertyDataException e) {
            logger.error("Error deleting property: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            HandleErrorUtil.handleError(response, e.getMessage(), logger);
        }
    }
}