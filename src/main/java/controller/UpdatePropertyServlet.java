package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import exceptions.*;
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
import java.io.BufferedReader;
import java.io.IOException;

@WebServlet("/update-property")
public class UpdatePropertyServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(UpdatePropertyServlet.class);
    private PropertyService propertyService;
    private JwtUtil jwtUtil;
    private final Gson gson = new Gson();
    private static final String SUCCESS = "success";
    private static final String MESSAGE = "message";

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.propertyService = new PropertyService(dataSource);
        this.jwtUtil = new JwtUtil();
        logger.info("UpdatePropertyServlet initialized with PropertyService");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        logger.debug("Received request to update property");
        response.setContentType("application/json");
        String authHeader = request.getHeader("Authorization");

        try {
            String token = this.jwtUtil.verifyAuthorizationHeader(authHeader);
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
            String country = propertyJson.get("country").getAsString();
            String city = propertyJson.get("city").getAsString();
            String state = propertyJson.get("state").getAsString();
            String contactName = propertyJson.get("contactName").getAsString();
            String contactPhone = propertyJson.get("contactPhone").getAsString();
            String contactEmail = propertyJson.get("contactEmail").getAsString();

            propertyService.updateProperty(
                    propertyId, title, description, propertyType, transactionType,
                    price, surface, rooms, bathrooms, floor, totalFloors, yearBuilt,
                    address, country, city, state, contactName, contactPhone, contactEmail, token
            );

            response.setStatus(HttpServletResponse.SC_OK);
            JsonObject successJson = new JsonObject();
            successJson.addProperty(SUCCESS, true);
            successJson.addProperty(MESSAGE, "Property updated successfully");
            response.getWriter().write(successJson.toString());
            logger.info("Successfully updated property with ID: {}", propertyId);

        } catch (PropertyDataException e) {
            logger.error("Error updating property: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);

            JsonObject errorJson = new JsonObject();
            errorJson.addProperty(SUCCESS, false);
            errorJson.addProperty(MESSAGE, e.getMessage());
            HandleErrorUtil.handleGetWriterError(response, errorJson.toString(), logger);
        } catch (NotAuthorizedException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            logger.warn("", e);
        } catch (PropertyNotFoundException | DatabaseException | PropertyValidationException | IOException e) {
            logger.error("Unexpected error updating property", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);

            JsonObject errorJson = new JsonObject();
            errorJson.addProperty(SUCCESS, false);
            errorJson.addProperty(MESSAGE, "Internal server error");
            HandleErrorUtil.handleGetWriterError(response, errorJson.toString(), logger);
        }
    }
}