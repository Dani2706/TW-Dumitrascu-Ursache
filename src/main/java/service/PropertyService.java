package service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dto.AdminPropertyDTO;
import dto.GetUserPropertyDTO;
import entity.*;
import exceptions.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import repository.PropertyRepository;
import util.Base64Util;
import util.JwtUtil;

import javax.sql.DataSource;
import java.util.ArrayList;
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

    public List<GetUserPropertyDTO> getUserProperties(String token) throws PropertyDataException, DatabaseException, PropertyValidationException {
        int userId = jwtUtil.getUserId(token);
        if (userId <= 0) {
            logger.warn("Attempt to get properties with invalid user ID: {}", userId);
            throw new PropertyDataException("User ID must be positive");
        }

        logger.debug("Fetching properties for user ID: {}", userId);
        List<GetUserPropertyDTO> properties = propertyRepository.findPropertiesByUserId(userId);
        logger.debug("Successfully retrieved {} properties for user ID: {}", properties.size(), userId);
        return properties;
    }

    public String getUserFavorites(String token) throws PropertyDataException, DatabaseException, PropertyValidationException {
        int userId = jwtUtil.getUserId(token);
        if (userId <= 0) {
            logger.warn("Attempt to get favorites with invalid user ID: {}", userId);
            throw new PropertyDataException("User ID must be positive");
        }

        logger.debug("Fetching favorite properties for user ID: {}", userId);
        try {
            List<PropertyForAllListings> favoriteProperties = propertyRepository.findFavoritePropertiesByUserId(userId);
            logger.debug("Successfully retrieved {} favorite properties for user ID: {}", favoriteProperties.size(), userId);

            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.writeValueAsString(favoriteProperties);
        } catch (JsonProcessingException e) {
            logger.error("Error converting favorite properties to JSON", e);
            throw new DatabaseException("Error processing favorite property data: " + e.getMessage(), e);
        }
    }

    public void removeFavorite(int propertyId, String token) throws PropertyDataException, DatabaseException {
        int userId = jwtUtil.getUserId(token);

        if (propertyId <= 0) {
            logger.warn("Attempt to remove favorite with invalid property ID: {}", propertyId);
            throw new PropertyDataException("Property ID must be positive");
        }

        if (userId <= 0) {
            logger.warn("Attempt to remove favorite with invalid user ID: {}", userId);
            throw new PropertyDataException("User ID must be positive");
        }

        try {
            logger.debug("Removing property ID: {} from favorites for user ID: {}", propertyId, userId);
            propertyRepository.removeFavoriteProperty(propertyId, userId);
            logger.info("Successfully removed property ID: {} from favorites for user ID: {}", propertyId, userId);
        } catch (DatabaseException e) {
            logger.error("Database error when removing property ID: {} from favorites for user ID: {}", propertyId, userId, e);
            throw new DatabaseException("Error removing property from favorites: " + e.getMessage(), e);
        }
    }

    public void addFavorite(int propertyId, String token) throws PropertyDataException, DatabaseException {
        int userId = jwtUtil.getUserId(token);

        if (propertyId <= 0) {
            logger.warn("Attempt to add favorite with invalid property ID: {}", propertyId);
            throw new PropertyDataException("Property ID must be positive");
        }

        if (userId <= 0) {
            logger.warn("Attempt to add favorite with invalid user ID: {}", userId);
            throw new PropertyDataException("User ID must be positive");
        }

        try {
            logger.debug("Adding property ID: {} to favorites for user ID: {}", propertyId, userId);
            propertyRepository.addFavoriteProperty(propertyId, userId);
            logger.info("Successfully added property ID: {} to favorites for user ID: {}", propertyId, userId);
        } catch (DatabaseException e) {
            logger.error("Database error when adding property ID: {} to favorites for user ID: {}", propertyId, userId, e);
            throw new DatabaseException("Error adding property to favorites: " + e.getMessage(), e);
        }
    }

    public int addProperty(String title, String description, String propertyType,
                           String transactionType, int price, int surface, int rooms,
                           int bathrooms, int floor, int totalFloors, int yearBuilt,
                           Date createdAt, String address, String country, String city, String state, double latitude, double longitude,
                           String contactName, String contactPhone, String contactEmail, String token, String mainPhoto, List<String> extraPhotos) throws PropertyValidationException, DatabaseException {

        int userId = jwtUtil.getUserId(token);
        logger.debug("Adding new property: {}", title);

        Property property = new Property(
                1, title, description, propertyType, transactionType,
                price, surface, rooms, bathrooms, floor, totalFloors,
                yearBuilt, createdAt, address, country, city, state, latitude, longitude,
                contactName, contactPhone, contactEmail, userId
        );

        byte[] mainPhotoBytes = Base64Util.decodeBase64(mainPhoto);
        List<byte[]> extraPhotosBytes = new ArrayList<>();
        for (String extraPhoto : extraPhotos){
            extraPhotosBytes.add(Base64Util.decodeBase64(extraPhoto));
        }

        int propertyId = propertyRepository.addProperty(property, mainPhotoBytes, extraPhotosBytes);
        //int propertyId = propertyRepository.testAddPropertyAsObject(property);
        logger.debug("Successfully added property with ID: {}", propertyId);
        return propertyId;
    }

    public void updateProperty(int propertyId, String title, String description,
                               String propertyType, String transactionType, int price,
                               int surface, int rooms, int bathrooms, int floor,
                               int totalFloors, int yearBuilt, String address, String country,
                               String city, String state, double latitude, double longitude, String contactName,
                               String contactPhone, String contactEmail, String token, String mainPhoto, List<String> extraPhotos) throws PropertyNotFoundException, DatabaseException, PropertyValidationException, PropertyDataException {
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
                yearBuilt, new Date(System.currentTimeMillis()), address, country, city, state, latitude, longitude,
                contactName, contactPhone, contactEmail, userId
        );

        byte[] mainPhotoBytes = Base64Util.decodeBase64(mainPhoto);
        List<byte[]> extraPhotosBytes = new ArrayList<>();
        for (String extraPhoto : extraPhotos){
            extraPhotosBytes.add(Base64Util.decodeBase64(extraPhoto));
        }

        propertyRepository.updateProperty(propertyId, userId, property, mainPhotoBytes, extraPhotosBytes);
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

    public String getTopProperties() throws DatabaseException, PropertyDataException {
        logger.debug("Fetching top properties");

        try {
            List<PropertyForAllListings> topProperties = propertyRepository.findTopProperties();
            logger.debug("Retrieved {} top properties", topProperties.size());

            if (topProperties.isEmpty()) {
                throw new PropertyDataException("No top properties found");
            }

            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.writeValueAsString(topProperties);
        } catch (JsonProcessingException e) {
            logger.error("Error converting top properties to JSON", e);
            throw new DatabaseException("Error processing property data: " + e.getMessage(), e);
        }
    }

    public String getAllPropertiesWithFilters(String propertyType, String transactionType)
            throws DatabaseException, NoListingsForThisCategoryException {
        logger.debug("Fetching properties with type: {} and transaction type: {}", propertyType, transactionType);

        try {
            List<PropertyForAllListings> properties;

            if (transactionType == null || transactionType.isEmpty()) {
                properties = propertyRepository.getAllPropertiesWithCriteria(propertyType);
            } else {
                properties = propertyRepository.getAllPropertiesWithBothFilters(propertyType, transactionType);
            }

            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.writeValueAsString(properties);
        } catch (JsonProcessingException e) {
            logger.error("Error converting properties to JSON", e);
            throw new DatabaseException("Error processing property data: " + e.getMessage(), e);
        }
    }

    public List<String> getFilteredCities(int minPrice, int maxPrice, int minArea, int maxArea,
                                          int minBedrooms, int maxBedrooms, float minBathrooms, float maxBathrooms,
                                          int minFloor, int maxFloor, int minYearBuilt, int maxYearBuilt)
            throws DatabaseException {

        logger.debug("Fetching filtered cities with criteria: price({}-{}), area({}-{}), bedrooms({}-{}), " +
                        "bathrooms({}-{}), floor({}-{}), yearBuilt({}-{})",
                minPrice, maxPrice, minArea, maxArea, minBedrooms, maxBedrooms,
                minBathrooms, maxBathrooms, minFloor, maxFloor, minYearBuilt, maxYearBuilt);

        List<String> cities = propertyRepository.findFilteredCities(minPrice, maxPrice, minArea, maxArea,
                minBedrooms, maxBedrooms, minBathrooms, maxBathrooms,
                minFloor, maxFloor, minYearBuilt, maxYearBuilt);

        logger.debug("Retrieved {} filtered cities", cities.size());
        return cities;
    }

    public List<String> getFilteredStates(int minPrice, int maxPrice, int minArea, int maxArea,
                                          int minBedrooms, int maxBedrooms, float minBathrooms, float maxBathrooms,
                                          int minFloor, int maxFloor, int minYearBuilt, int maxYearBuilt)
            throws DatabaseException {

        logger.debug("Fetching filtered states with criteria: price({}-{}), area({}-{}), bedrooms({}-{}), " +
                        "bathrooms({}-{}), floor({}-{}), yearBuilt({}-{})",
                minPrice, maxPrice, minArea, maxArea, minBedrooms, maxBedrooms,
                minBathrooms, maxBathrooms, minFloor, maxFloor, minYearBuilt, maxYearBuilt);

        List<String> states = propertyRepository.findFilteredStates(minPrice, maxPrice, minArea, maxArea,
                minBedrooms, maxBedrooms, minBathrooms, maxBathrooms,
                minFloor, maxFloor, minYearBuilt, maxYearBuilt);

        logger.debug("Retrieved {} filtered states", states.size());
        return states;
    }

    public String getUserListingsViewCount(String token) throws PropertyDataException, DatabaseException {
        int userId = jwtUtil.getUserId(token);
        if (userId <= 0) {
            logger.warn("Attempt to get view counts with invalid user ID: {}", userId);
            throw new PropertyDataException("User ID must be positive");
        }

        logger.debug("Fetching total view count for properties of user ID: {}", userId);
        try {
            int totalViewCount = propertyRepository.getTotalViewCountByUserId(userId);
            logger.debug("Successfully retrieved total view count for user ID: {}: {} views", userId, totalViewCount);

            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.writeValueAsString(new ViewCountResponse(totalViewCount));
        } catch (JsonProcessingException e) {
            logger.error("Error converting view count data to JSON", e);
            throw new DatabaseException("Error processing view count data: " + e.getMessage(), e);
        }
    }

    public String getUserListingsFavoritedCount(String token) throws PropertyDataException, DatabaseException {
        int userId = jwtUtil.getUserId(token);
        if (userId <= 0) {
            logger.warn("Attempt to get favorited counts with invalid user ID: {}", userId);
            throw new PropertyDataException("User ID must be positive");
        }

        logger.debug("Fetching total favorited count for properties of user ID: {}", userId);
        try {
            int totalFavoritedCount = propertyRepository.getTotalFavoritedCountByUserId(userId);
            logger.debug("Successfully retrieved total favorited count for user ID: {}: {} favorites", userId, totalFavoritedCount);

            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.writeValueAsString(new ViewCountResponse(totalFavoritedCount));
        } catch (JsonProcessingException e) {
            logger.error("Error converting favorited count data to JSON", e);
            throw new DatabaseException("Error processing favorited count data: " + e.getMessage(), e);
        }
    }
    
    public PropertyMainImage getPropertyMainImage(int propertyId) throws DatabaseException {
        byte[] mainImageBytes = this.propertyRepository.getPropertyMainImage(propertyId);
        String mainImageBase64String = Base64Util.encodeBase64(mainImageBytes);
        return new PropertyMainImage(propertyId, mainImageBase64String);
    }

    public PropertyExtraImages getPropertyExtraImages(int propertyId) throws DatabaseException {
        List<byte[]> extraPhotosBytes = this.propertyRepository.getPropertyExtraPhotos(propertyId);
        if (extraPhotosBytes != null) {
            List<String> extraPhotosBase64String = new ArrayList<>();
            for (byte[] extraPhotoBytes : extraPhotosBytes) {
                extraPhotosBase64String.add(Base64Util.encodeBase64(extraPhotoBytes));
            }
            return new PropertyExtraImages(propertyId, extraPhotosBase64String);
        }
        return null;
    }

    public String getAllProperties(int photosIncluded) throws DatabaseException, JsonProcessingException {
        List<AdminPropertyDTO> properties = this.propertyRepository.getAllProperties(photosIncluded);

        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.writeValueAsString(properties);
    }

    public void addPropertyView(int propertyId, String token) throws PropertyDataException, DatabaseException {
        if (propertyId <= 0) {
            logger.warn("Attempt to record view for invalid property ID: {}", propertyId);
            throw new PropertyDataException("Property ID must be positive");
        }

        int userId = 202; // Default for anonymous users

        if (token != null && !token.isEmpty()) {
            userId = jwtUtil.getUserId(token);
        }

        try {
            logger.debug("Recording view for property ID: {} by user ID: {}", propertyId, userId > 0 ? userId : "anonymous");
            propertyRepository.addPropertyView(propertyId, userId);
            logger.info("Successfully recorded view for property ID: {}", propertyId);
        } catch (DatabaseException e) {
            logger.error("Database error when recording view for property ID: {}", propertyId, e);
            throw new DatabaseException("Error recording property view: " + e.getMessage(), e);
        }
    }
}