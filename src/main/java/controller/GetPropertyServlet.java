package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.HashMap;
import java.util.Map;

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

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> jsonMap = new HashMap<>();

            jsonMap.put("id", property.getPropertyId());
            jsonMap.put("title", property.getTitle());
            jsonMap.put("description", property.getDescription());
            jsonMap.put("propertyType", property.getPropertyType());
            jsonMap.put("transactionType", property.getTransactionType());
            jsonMap.put("price", property.getPrice());
            jsonMap.put("surface", property.getSurface());
            jsonMap.put("rooms", property.getRooms());
            jsonMap.put("bathrooms", property.getBathrooms());
            jsonMap.put("floor", property.getFloor());
            jsonMap.put("totalFloors", property.getTotalFloors());
            jsonMap.put("yearBuilt", property.getYearBuilt());
            jsonMap.put("createdAt", property.getCreatedAt());
            jsonMap.put("address", property.getAddress());
            jsonMap.put("country", property.getCountry());
            jsonMap.put("city", property.getCity());
            jsonMap.put("state", property.getState());
            jsonMap.put("latitude", property.getLatitude());
            jsonMap.put("longitude", property.getLongitude());
            jsonMap.put("contactName", property.getContactName());
            jsonMap.put("contactPhone", property.getContactPhone());
            jsonMap.put("contactEmail", property.getContactEmail());
            jsonMap.put("mainPhoto", propertyMainImage.getData());

            if (propertyExtraImages != null) {
                jsonMap.put("extraPhotos", propertyExtraImages.getData());
            } else {
                jsonMap.put("extraPhotos", null);
            }

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            PrintWriter out = response.getWriter();
            out.write(objectMapper.writeValueAsString(jsonMap));
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