package service;

import entity.Property;
import entity.TopProperty;
import exceptions.DatabaseException;
import exceptions.PropertyDataException;
import exceptions.PropertyNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import repository.PropertyRepository;

import javax.sql.DataSource;
import java.util.List;

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
}