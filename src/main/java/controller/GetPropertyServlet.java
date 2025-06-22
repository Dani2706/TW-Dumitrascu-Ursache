package controller;

import entity.Property;
import entity.PropertyExtraImages;
import entity.PropertyMainImage;
import service.PropertyService;
import exceptions.PropertyNotFoundException;
import exceptions.InvalidPropertyIdException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import util.HandleErrorUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/api/property")
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
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        logger.debug("Received request for property details");
        String idParam = request.getParameter("id");
        logger.debug("ID parameter: {}", idParam);

        try {
            if (idParam == null) {
                logger.warn("Missing 'id' parameter in request");
                throw new InvalidPropertyIdException("Missing 'id' parameter");
            }

            int propertyId = Integer.parseInt(idParam);

            Property property = propertyService.getPropertyById(propertyId);
            PropertyMainImage propertyMainImage = propertyService.getPropertyMainImage(propertyId);
            PropertyExtraImages propertyExtraImages = propertyService.getPropertyExtraImages(propertyId);

            StringBuilder extraPhotosAsJson = new StringBuilder();
            if (propertyExtraImages != null) {
                extraPhotosAsJson.append("[");
                System.out.println("[");
                boolean first = true;
                for (String extraPhoto : propertyExtraImages.getData()){
                    if (!first) {
                        extraPhotosAsJson.append(",");
                        System.out.println(",");
                    }
                    first = false;
                    extraPhotosAsJson.append("\"").append(extraPhoto).append("\"");
                    System.out.println("img");
                }
                extraPhotosAsJson.append("]");
                System.out.println("]");
            }
            else {
                extraPhotosAsJson.append("null");
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
                    "\"country\":\"" + property.getCountry() + "\"," +
                    "\"city\":\"" + property.getCity() + "\"," +
                    "\"state\":\"" + property.getState() + "\"," +
                    "\"latitude\":" + property.getLatitude() + "," +
                    "\"longitude\":" + property.getLongitude() + "," +
                    "\"contactName\":\"" + property.getContactName() + "\"," +
                    "\"contactPhone\":\"" + property.getContactPhone() + "\"," +
                    "\"contactEmail\":\"" + property.getContactEmail() + "\"," +
                    "\"mainPhoto\":\"" + propertyMainImage.getData() + "\"," +
                    "\"extraPhotos\":" + extraPhotosAsJson +
                    "}";

            out.write(json);
            logger.debug("Successfully returned property data for ID: {}", propertyId);

        } catch (NumberFormatException e) {
            logger.error("Invalid property ID: ", e);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            HandleErrorUtil.handleGetWriterError(response, e.getMessage(), logger);
        } catch (PropertyNotFoundException e) {
            logger.error("Property not found: ", e);
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            HandleErrorUtil.handleGetWriterError(response, e.getMessage(), logger);
        } catch (Exception e) {
            logger.error("Internal server error when fetching property", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            HandleErrorUtil.handleGetWriterError(response, "Internal server error", logger);
        }
    }
}