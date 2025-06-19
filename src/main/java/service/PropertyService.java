package service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import entity.Property;
import entity.PropertyForAllListings;
import entity.TopProperty;
import exceptions.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import repository.PropertyRepository;
import util.JwtUtil;

import javax.sql.DataSource;
import java.util.List;
import java.sql.Date;

public class PropertyService {
    private static final Logger logger = LoggerFactory.getLogger(PropertyService.class);
    private PropertyRepository propertyRepository;
    private JwtUtil jwtUtil;

    public PropertyService(DataSource dataSource) {
        this.propertyRepository = new PropertyRepository(dataSource);
        this.jwtUtil = new JwtUtil();
        logger.info("PropertyService initialized with PropertyRepository");
    }

    public Property getPropertyById(int id) throws PropertyNotFoundException, DatabaseException, PropertyDataException, PropertyValidationException {
        if (id <= 0) {
            logger.warn("Attempt to get property with invalid ID: {}", id);
            throw new PropertyDataException("Property ID must be positive");
        }

        logger.debug("Fetching property with ID: {}", id);
        Property property = propertyRepository.findById(id);

        logger.debug("Successfully retrieved property with ID: {}", id);
        return property;
    }

    public List<Property> getUserProperties(String token) throws PropertyDataException, DatabaseException, PropertyValidationException {
        int userId = jwtUtil.getUserId(token);
        if (userId <= 0) {
            logger.warn("Attempt to get properties with invalid user ID: {}", userId);
            throw new PropertyDataException("User ID must be positive");
        }

        logger.debug("Fetching properties for user ID: {}", userId);
        List<Property> properties = propertyRepository.findPropertiesByUserId(userId);
        logger.debug("Successfully retrieved {} properties for user ID: {}", properties.size(), userId);
        return properties;
    }

    public int addProperty(String title, String description, String propertyType,
                           String transactionType, int price, int surface, int rooms,
                           int bathrooms, int floor, int totalFloors, int yearBuilt,
                           Date createdAt, String address, String country, String city, String state,
                           String contactName, String contactPhone, String contactEmail, String token) throws PropertyValidationException, DatabaseException {

        int userId = jwtUtil.getUserId(token);

        logger.debug("Adding new property: {}", title);

        Property property = new Property(
                1, title, description, propertyType, transactionType,
                price, surface, rooms, bathrooms, floor, totalFloors,
                yearBuilt, createdAt, address, country, city, state,
                contactName, contactPhone, contactEmail, userId
        );
        int propertyId = propertyRepository.addProperty(property);
        //int propertyId = propertyRepository.testAddPropertyAsObject(property);
        logger.debug("Successfully added property with ID: {}", propertyId);
        return propertyId;
    }

    public void updateProperty(int propertyId, String title, String description,
                               String propertyType, String transactionType, int price,
                               int surface, int rooms, int bathrooms, int floor,
                               int totalFloors, int yearBuilt, String address, String country,
                               String city, String state, String contactName,
                               String contactPhone, String contactEmail, String token) throws PropertyNotFoundException, DatabaseException, PropertyValidationException, PropertyDataException {

        int userId = jwtUtil.getUserId(token);

        if (propertyId <= 0) {
            logger.warn("Attempt to update property with invalid ID: {}", propertyId);
            throw new PropertyDataException("Property ID must be positive");
        }

        if (userId <= 0) {
            logger.warn("Attempt to update property with invalid user ID: {}", userId);
            throw new PropertyDataException("User ID must be positive");
        }

        logger.debug("Updating property with ID: {}", propertyId);
        Property property = new Property(
                propertyId, title, description, propertyType, transactionType,
                price, surface, rooms, bathrooms, floor, totalFloors,
                yearBuilt, new Date(System.currentTimeMillis()), address, country, city, state,
                contactName, contactPhone, contactEmail, userId
        );
        propertyRepository.updateProperty(propertyId, userId, property);
        logger.info("Successfully updated property with ID: {}", propertyId);
    }

    public void deleteProperty(int propertyId, String token) throws PropertyDataException {
        int userId = jwtUtil.getUserId(token);
        if (propertyId <= 0) {
            logger.warn("Attempt to delete property with invalid ID: {}", propertyId);
            throw new PropertyDataException("Property ID must be positive");
        }

        if (userId <= 0) {
            logger.warn("Attempt to delete property with invalid user ID: {}", userId);
            throw new PropertyDataException("User ID must be positive");
        }

        try {
            logger.debug("Deleting property with ID: {} for user ID: {}", propertyId, userId);
            propertyRepository.deleteProperty(propertyId, userId);
            logger.info("Successfully deleted property with ID: {} for user ID: {}", propertyId, userId);
        } catch (PropertyNotFoundException e) {
            logger.warn("Property not found or doesn't belong to user - ID: {}, User ID: {}", propertyId, userId);
            throw new PropertyDataException(e.getMessage(), e);
        } catch (DatabaseException e) {
            logger.error("Database error when deleting property with ID: {} for user ID: {}", propertyId, userId, e);
            throw new PropertyDataException("Error deleting property: " + e.getMessage(), e);
        }
    }

    public List<TopProperty> getTopProperties() throws DatabaseException {
        logger.debug("Fetching top properties");
        List<TopProperty> topProperties = propertyRepository.findTopProperties();
        logger.debug("Retrieved {} top properties", topProperties.size());
        return topProperties;
    }

    public String getAllPropertiesWithCriteria(String filterCriteria) throws DatabaseException, NoListingsForThisCategoryException, JsonProcessingException {
        List<PropertyForAllListings> properties = propertyRepository.getAllPropertiesWithCriteria(filterCriteria);
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.writeValueAsString(properties);

    }
}