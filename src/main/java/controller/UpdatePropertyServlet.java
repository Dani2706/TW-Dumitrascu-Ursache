package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import exceptions.PropertyDataException;
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
import java.io.BufferedReader;

@WebServlet("/update-property")
public class UpdatePropertyServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(UpdatePropertyServlet.class);
    private PropertyService propertyService;
    private Gson gson = new Gson();

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.propertyService = new PropertyService(dataSource);
        logger.info("UpdatePropertyServlet initialized with PropertyService");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        logger.debug("Received request to update property");
        response.setContentType("application/json");

        try {
            BufferedReader reader = request.getReader();
            StringBuilder jsonBuilder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                jsonBuilder.append(line);
            }

            JsonObject propertyJson = gson.fromJson(jsonBuilder.toString(), JsonObject.class);

            int propertyId = propertyJson.get("propertyId").getAsInt();
            String title = propertyJson.get("title").getAsString();
            String description = propertyJson.get("description").getAsString();
            String propertyType = propertyJson.get("propertyType").getAsString();
            String transactionType = propertyJson.get("transactionType").getAsString();
            int price = propertyJson.get("price").getAsInt();
            int surface = propertyJson.get("surfaceArea").getAsInt();
            int rooms = propertyJson.get("rooms").getAsInt();
            int bathrooms = propertyJson.get("bathrooms").getAsInt();
            int floor = propertyJson.get("floor").getAsInt();
            int totalFloors = propertyJson.get("totalFloors").getAsInt();
            int yearBuilt = propertyJson.get("yearBuilt").getAsInt();
            String address = propertyJson.get("address").getAsString();
            String city = propertyJson.get("city").getAsString();
            String state = propertyJson.get("state").getAsString();
            String contactName = propertyJson.get("contactName").getAsString();
            String contactPhone = propertyJson.get("contactPhone").getAsString();
            String contactEmail = propertyJson.get("contactEmail").getAsString();

            int userId = 1;

            propertyService.updateProperty(
                    propertyId, userId, title, description, propertyType, transactionType,
                    price, surface, rooms, bathrooms, floor, totalFloors, yearBuilt,
                    address, city, state, contactName, contactPhone, contactEmail
            );

            response.setStatus(HttpServletResponse.SC_OK);
            JsonObject successJson = new JsonObject();
            successJson.addProperty("success", true);
            successJson.addProperty("message", "Property updated successfully");
            response.getWriter().write(successJson.toString());
            logger.info("Successfully updated property with ID: {}", propertyId);

        } catch (PropertyDataException e) {
            logger.error("Error updating property: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);

            JsonObject errorJson = new JsonObject();
            errorJson.addProperty("success", false);
            errorJson.addProperty("message", e.getMessage());
            response.getWriter().write(errorJson.toString());

        } catch (Exception e) {
            logger.error("Unexpected error updating property", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);

            JsonObject errorJson = new JsonObject();
            errorJson.addProperty("success", false);
            errorJson.addProperty("message", "Internal server error");
            response.getWriter().write(errorJson.toString());
        }
    }
}