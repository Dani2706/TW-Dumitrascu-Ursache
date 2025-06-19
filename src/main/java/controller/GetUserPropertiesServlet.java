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

import exceptions.DatabaseException;
import exceptions.NotAuthorizedException;
import exceptions.PropertyValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import entity.Property;
import service.PropertyService;
import exceptions.PropertyDataException;
import util.HandleErrorUtil;
import util.JwtUtil;

@WebServlet("/user-properties")
public class GetUserPropertiesServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(GetUserPropertiesServlet.class);
    private PropertyService propertyService;
    private JwtUtil jwtUtil;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.propertyService = new PropertyService(dataSource);
        this.jwtUtil = new JwtUtil();
        logger.info("GetUserPropertiesServlet initialized with PropertyService");
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        logger.debug("Received request for user properties");
        String authHeader = request.getHeader("Authorization");
        try {
            String token = this.jwtUtil.verifyAuthorizationHeader(authHeader);
            List<Property> properties = propertyService.getUserProperties(token);

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            PrintWriter out = response.getWriter();

            StringBuilder json = new StringBuilder("[");
            for (int i = 0; i < properties.size(); i++) {
                Property property = properties.get(i);
                json.append("{");
                json.append("\"id\":").append(property.getPropertyId()).append(",");
                json.append("\"title\":\"").append(property.getTitle()).append("\",");
                json.append("\"creationDate\":\"").append(property.getCreatedAt()).append("\"");
                json.append("}");
                if (i < properties.size() - 1) {
                    json.append(",");
                }
            }
            json.append("]");

            out.write(json.toString());
        } catch (NumberFormatException | PropertyValidationException e) {
            logger.warn("Invalid userId parameter: ", e);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            HandleErrorUtil.handleGetWriterError(response, "Invalid userId parameter", logger);
        } catch (NotAuthorizedException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            logger.warn("", e);
        } catch (PropertyDataException | DatabaseException | IOException e) {
            logger.error("Error retrieving user properties: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            HandleErrorUtil.handleGetWriterError(response, e.getMessage(), logger);
        }
    }
}