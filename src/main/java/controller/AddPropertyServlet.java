package controller;

import exceptions.DatabaseException;
import exceptions.PropertyValidationException;
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
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Date;
import java.time.LocalDate;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

@WebServlet("/api/add-property")
public class AddPropertyServlet extends HttpServlet {

    private static final Logger logger = LoggerFactory.getLogger(AddPropertyServlet.class);
    private PropertyService propertyService;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.propertyService = new PropertyService(dataSource);
        logger.info("AddPropertyServlet initialized with PropertyService");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        logger.debug("Received request to add new property");

        try {
            BufferedReader reader = request.getReader();
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }

            Gson gson = new Gson();
            JsonObject propertyData = gson.fromJson(sb.toString(), JsonObject.class);

            String title = propertyData.get("title").getAsString();
            String description = propertyData.get("description").getAsString();
            String propertyType = propertyData.get("propertyType").getAsString();
            String transactionType = propertyData.get("transactionType").getAsString();
            int price = propertyData.get("price").getAsInt();
            int surface = propertyData.get("surfaceArea").getAsInt();
            int rooms = propertyData.get("rooms").getAsInt();
            int bathrooms = propertyData.get("bathrooms").getAsInt();
            int floor = propertyData.has("floor") ? propertyData.get("floor").getAsInt() : 0;
            int totalFloors = propertyData.has("totalFloors") ? propertyData.get("totalFloors").getAsInt() : 0;
            int yearBuilt = propertyData.has("yearBuilt") ? propertyData.get("yearBuilt").getAsInt() : 0;
            Date createdAt = Date.valueOf(LocalDate.now());
            String address = propertyData.get("address").getAsString();
            String city = propertyData.get("city").getAsString();
            String state = propertyData.get("state").getAsString();
            Double latitude = propertyData.has("latitude") ? propertyData.get("latitude").getAsDouble() : null;
            Double longitude = propertyData.has("longitude") ? propertyData.get("longitude").getAsDouble() : null;
            String contactName = propertyData.get("contactName").getAsString();
            String contactPhone = propertyData.get("contactPhone").getAsString();
            String contactEmail = propertyData.get("contactEmail").getAsString();

            int propertyId = propertyService.addProperty(title, description, propertyType,
                    transactionType, price, surface, rooms, bathrooms, floor, totalFloors,
                    yearBuilt, createdAt, address, city, state, latitude, longitude, contactName, contactPhone, contactEmail);

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.setStatus(HttpServletResponse.SC_CREATED);
            response.getWriter().write("{\"success\":true,\"propertyId\":" + propertyId + "}");
            logger.info("Successfully added new property with ID: {}", propertyId);

        } catch (PropertyValidationException e) {
            logger.error("Error adding property: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            HandleErrorUtil.handleGetWriterError(response, e.getMessage(), logger);
        } catch (DatabaseException | IOException e) {
            logger.error("Internal server error when adding property", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            HandleErrorUtil.handleGetWriterError(response, "Internal server error", logger);
        }
    }
}