package controller;

import entity.Property;
import service.PropertyService;
import exceptions.PropertyNotFoundException;
import exceptions.InvalidPropertyIdException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import service.PropertyService;
import util.HandleErrorUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/property")
public class GetPropertyServlet extends HttpServlet {

    private static final Logger logger = LoggerFactory.getLogger(GetPropertyServlet.class);
    private PropertyService propertyService;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.propertyService = new PropertyService(dataSource);
        logger.info("GetPropertyServlet initialized with PropertyService");
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        logger.debug("Received request for property details");
        String idParam = request.getParameter("id");
        logger.debug("ID parameter: {}", idParam);

        try {
            if(idParam == null) {
                logger.warn("Missing 'id' parameter in request");
                throw new InvalidPropertyIdException("Missing 'id' parameter");
            }

            int id;
            try {
                id = Integer.parseInt(idParam);
            } catch(NumberFormatException e) {
                logger.warn("Invalid 'id' parameter: {}", idParam);
                throw new InvalidPropertyIdException("Invalid 'id' parameter: must be a number");
            }

            Property property = propertyService.getPropertyById(id);
            if (property == null) {
                throw new PropertyNotFoundException("No property found with ID: " + id);
            }

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            PrintWriter out = response.getWriter();

            String json = "{" +
                    "\"id\":" + property.getPropertyId() + "," +
                    "\"title\":\"" + property.getTitle() + "\"," +
                    "\"description\":\"" + property.getDescription() + "\"," +
                    "\"propertyType\":\"" + property.getPropertyType() + "\"," +
                    "\"transactionType\":\"" + property.getTransactionType() + "\"," +
                    "\"price\":" + property.getPrice() + "," +
                    "\"surface\":" + property.getSurface() + "," +
                    "\"rooms\":" + property.getRooms() + "," +
                    "\"bathrooms\":" + property.getBathrooms() + "," +
                    "\"floor\":" + property.getFloor() + "," +
                    "\"totalFloors\":" + property.getTotalFloors() + "," +
                    "\"yearBuilt\":" + property.getYearBuilt() + "," +
                    "\"createdAt\":\"" + property.getCreatedAt() + "\"," +
                    "\"address\":\"" + property.getAddress() + "\"," +
                    "\"city\":\"" + property.getCity() + "\"," +
                    "\"state\":\"" + property.getState() + "\"," +
                    "\"contactName\":\"" + property.getContactName() + "\"," +
                    "\"contactPhone\":\"" + property.getContactPhone() + "\"," +
                    "\"contactEmail\":\"" + property.getContactEmail() + "\"" +
                    "}";

            out.write(json);
            logger.debug("Successfully returned property data for ID: {}", id);

        } catch (InvalidPropertyIdException e) {
            logger.error("Invalid property ID: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            HandleErrorUtil.handleError(response, e.getMessage(), logger);
        } catch (PropertyNotFoundException e) {
            logger.error("Property not found: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            HandleErrorUtil.handleError(response, e.getMessage(), logger);
        } catch (Exception e) {
            logger.error("Internal server error when fetching property", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            HandleErrorUtil.handleError(response, "Internal server error", logger);
        }
    }
}