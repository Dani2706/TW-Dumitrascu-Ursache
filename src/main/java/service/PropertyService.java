package service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import entity.Property;
import entity.PropertyForAllListings;
import entity.TopProperty;
import exceptions.DatabaseException;
import exceptions.NoListingsForThisCategoryException;
import exceptions.PropertyDataException;
import exceptions.PropertyNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import repository.PropertyRepository;

import javax.sql.DataSource;
import java.sql.Clob;
import java.util.List;
import java.sql.Date;

public class PropertyService {
    private static final Logger logger = LoggerFactory.getLogger(PropertyService.class);
    private PropertyRepository propertyRepository;

    public PropertyService(DataSource dataSource) {
        this.propertyRepository = new PropertyRepository(dataSource);
        logger.info("PropertyService initialized with PropertyRepository");
    }

    public Property getPropertyById(int id) throws PropertyDataException {
        if (id <= 0) {
            logger.warn("Attempt to get property with invalid ID: {}", id);
            throw new PropertyDataException("Property ID must be positive");
        }

        try {
            logger.debug("Fetching property with ID: {}", id);
            Property property = propertyRepository.findById(id);
            logger.debug("Successfully retrieved property with ID: {}", id);
            return property;
        } catch (PropertyNotFoundException e) {
            logger.warn("Property not found with ID: {}", id);
            throw new PropertyDataException("Property with ID " + id + " not found", e);
        } catch (DatabaseException e) {
            logger.error("Database error when retrieving property with ID: {}", id, e);
            throw new PropertyDataException("Error retrieving property: " + e.getMessage(), e);
        }
    }

    public List<Property> getUserProperties(int userId) throws PropertyDataException {
        if (userId <= 0) {
            logger.warn("Attempt to get properties with invalid user ID: {}", userId);
            throw new PropertyDataException("User ID must be positive");
        }

        try {
            logger.debug("Fetching properties for user ID: {}", userId);
            List<Property> properties = propertyRepository.findPropertiesByUserId(userId);
            logger.debug("Successfully retrieved {} properties for user ID: {}", properties.size(), userId);
            return properties;
        } catch (DatabaseException e) {
            logger.error("Database error when retrieving properties for user ID: {}", userId, e);
            throw new PropertyDataException("Error retrieving user properties: " + e.getMessage(), e);
        }
    }

    public int addProperty(String title, String description, String propertyType,
                           String transactionType, int price, int surface, int rooms,
                           int bathrooms, int floor, int totalFloors, int yearBuilt,
                           Date createdAt, String address, String city, String state,
                           String contactName, String contactPhone, String contactEmail) throws PropertyDataException {

        logger.debug("Adding new property: {}", title);

        try {
            Property property = new Property(
                    title, description, propertyType, transactionType,
                    price, surface, rooms, bathrooms, floor, totalFloors,
                    yearBuilt, createdAt, address, city, state,
                    contactName, contactPhone, contactEmail
            );

            //int propertyId = propertyRepository.addProperty(property);
            int propertyId = propertyRepository.test_add_property_as_object(property);
            logger.debug("Successfully added property with ID: {}", propertyId);
            return propertyId;
        } catch (Exception e) {
            logger.error("Error adding property: {}", e.getMessage());
            throw new PropertyDataException("Error adding property: " + e.getMessage(), e);
        }
    }

    public void updateProperty(int propertyId, int userId, String title, String description,
                               String propertyType, String transactionType, int price,
                               int surface, int rooms, int bathrooms, int floor,
                               int totalFloors, int yearBuilt, String address,
                               String city, String state, String contactName,
                               String contactPhone, String contactEmail) throws PropertyDataException {

        if (propertyId <= 0) {
            logger.warn("Attempt to update property with invalid ID: {}", propertyId);
            throw new PropertyDataException("Property ID must be positive");
        }

        if (userId <= 0) {
            logger.warn("Attempt to update property with invalid user ID: {}", userId);
            throw new PropertyDataException("User ID must be positive");
        }

        try {
            logger.debug("Updating property with ID: {}", propertyId);

            Property property = new Property(
                    title, description, propertyType, transactionType,
                    price, surface, rooms, bathrooms, floor, totalFloors,
                    yearBuilt, new Date(System.currentTimeMillis()), address, city, state,
                    contactName, contactPhone, contactEmail
            );

            propertyRepository.updateProperty(propertyId, userId, property);
            logger.info("Successfully updated property with ID: {}", propertyId);
        } catch (PropertyNotFoundException e) {
            logger.warn("Property not found or doesn't belong to user - ID: {}, User ID: {}", propertyId, userId);
            throw new PropertyDataException(e.getMessage(), e);
        } catch (DatabaseException e) {
            logger.error("Database error when updating property with ID: {}", propertyId, e);
            throw new PropertyDataException("Error updating property: " + e.getMessage(), e);
        }
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

    public List<TopProperty> getTopProperties() throws PropertyDataException {
        try {
            logger.debug("Fetching top properties");
            List<TopProperty> topProperties = propertyRepository.findTopProperties();

            logger.debug("Retrieved {} top properties", topProperties.size());
            return topProperties;
        } catch (DatabaseException e) {
            logger.error("Database error when retrieving top properties", e);
            throw new PropertyDataException("Error retrieving top properties: " + e.getMessage(), e);
        }
    }

    public String getAllPropertiesWithCriteria(String filterCriteria) throws DatabaseException, NoListingsForThisCategoryException, JsonProcessingException {
        List<PropertyForAllListings> properties = propertyRepository.getAllPropertiesWithCriteria(filterCriteria);
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.writeValueAsString(properties);

    }
}