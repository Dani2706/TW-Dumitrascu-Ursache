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

import javax.sql.DataSource;
import java.util.List;
import java.sql.Date;

public class PropertyService {
    private static final Logger logger = LoggerFactory.getLogger(PropertyService.class);
    private PropertyRepository propertyRepository;

    public PropertyService(DataSource dataSource) {
        this.propertyRepository = new PropertyRepository(dataSource);
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

    public List<Property> getUserProperties(int userId) throws PropertyDataException, DatabaseException, PropertyValidationException {
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
                           Date createdAt, String address, String city, String state, double latitude, double longitude,
                           String contactName, String contactPhone, String contactEmail) throws PropertyValidationException, DatabaseException {

        logger.debug("Adding new property: {}", title);

        Property property = new Property(
                title, description, propertyType, transactionType,
                price, surface, rooms, bathrooms, floor, totalFloors,
                yearBuilt, createdAt, address, city, state, latitude, longitude,
                contactName, contactPhone, contactEmail
        );
        //int propertyId = propertyRepository.addProperty(property);
        int propertyId = propertyRepository.testAddPropertyAsObject(property);
        logger.debug("Successfully added property with ID: {}", propertyId);
        return propertyId;
    }

    public void updateProperty(int propertyId, int userId, String title, String description,
                               String propertyType, String transactionType, int price,
                               int surface, int rooms, int bathrooms, int floor,
                               int totalFloors, int yearBuilt, String address,
                               String city, String state, double latitude, double longitude, String contactName,
                               String contactPhone, String contactEmail) throws PropertyNotFoundException, DatabaseException, PropertyValidationException, PropertyDataException {

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
                title, description, propertyType, transactionType,
                price, surface, rooms, bathrooms, floor, totalFloors,
                yearBuilt, new Date(System.currentTimeMillis()), address, city, state, latitude, longitude,
                contactName, contactPhone, contactEmail
        );
        propertyRepository.updateProperty(propertyId, userId, property);
        logger.info("Successfully updated property with ID: {}", propertyId);
    }

    public void deleteProperty(int propertyId, int userId) throws PropertyDataException {
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