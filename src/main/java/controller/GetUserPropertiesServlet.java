package controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import entity.Property;
import service.PropertyService;
import exceptions.PropertyDataException;
import util.HandleErrorUtil;

@WebServlet("/user-properties")
public class GetUserPropertiesServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(GetUserPropertiesServlet.class);
    private PropertyService propertyService;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.propertyService = new PropertyService(dataSource);
        logger.info("GetUserPropertiesServlet initialized with PropertyService");
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        logger.debug("Received request for user properties");

        // hardcoded for demo
        String userIdParam = request.getParameter("userId");

        try {
            if(userIdParam == null) {
                logger.warn("Missing 'userId' parameter in request");
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                HandleErrorUtil.handleError(response, "Missing userId parameter", logger);
                return;
            }

            int userId = Integer.parseInt(userIdParam);
            List<Property> properties = propertyService.getUserProperties(userId);

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            PrintWriter out = response.getWriter();

            StringBuilder json = new StringBuilder("[");
            for (int i = 0; i < properties.size(); i++) {
                Property property = properties.get(i);
                json.append("{");
                json.append("\"id\":").append(property.getPropertyId()).append(",");
                json.append("\"title\":\"").append(property.getTitle()).append("\"");
                json.append("}");
                if (i < properties.size() - 1) {
                    json.append(",");
                }
            }
            json.append("]");

            out.write(json.toString());
            logger.debug("Successfully returned {} properties for user ID: {}",
                    properties.size(), userId);

        } catch (NumberFormatException e) {
            logger.warn("Invalid userId parameter: {}", userIdParam);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            HandleErrorUtil.handleError(response, "Invalid userId parameter", logger);
        } catch (PropertyDataException e) {
            logger.error("Error retrieving user properties: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            HandleErrorUtil.handleError(response, e.getMessage(), logger);
        }
    }
}