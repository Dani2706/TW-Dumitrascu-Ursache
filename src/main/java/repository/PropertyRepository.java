package repository;

import entity.Property;
import entity.PropertyForAllListings;
import entity.TopProperty;
import exceptions.DatabaseException;
import exceptions.NoListingsForThisCategoryException;
import exceptions.PropertyNotFoundException;
import exceptions.PropertyValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PropertyRepository {
    private static final Logger logger = LoggerFactory.getLogger(PropertyRepository.class);
    private final DataSource dataSource;

    public PropertyRepository(DataSource dataSource) {
        this.dataSource = dataSource;
        logger.info("PropertyRepository initialized with datasource");
    }

    public Property findById(int id) throws PropertyNotFoundException, DatabaseException, PropertyValidationException {
        logger.debug("Attempting to find property with ID: {}", id);
        Property property = null;

        try (Connection conn = dataSource.getConnection()) {
            String sql = "SELECT * FROM properties WHERE property_id = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                property = new Property(
                        rs.getInt("property_id"),
                        rs.getString("title"),
                        rs.getString("description"),
                        rs.getString("property_type"),
                        rs.getString("transaction_type"),
                        rs.getInt("price"),
                        rs.getInt("surface_area"),
                        rs.getInt("rooms"),
                        rs.getInt("bathrooms"),
                        rs.getInt("floor"),
                        rs.getInt("total_floors"),
                        rs.getInt("year_built"),
                        rs.getDate("created_at"),
                        rs.getString("address"),
                        rs.getString("country"),
                        rs.getString("city"),
                        rs.getString("state"),
                        rs.getDouble("latitude"),
                        rs.getDouble("longitude"),
                        rs.getString("contact_name"),
                        rs.getString("contact_phone"),
                        rs.getString("contact_email"),
                        rs.getInt("user_id")
                );
                logger.debug("Property found: ID={}, Title={}", property.getPropertyId(), property.getTitle());
            } else {
                logger.warn("No property found with ID: {}", id);
                throw new PropertyNotFoundException("Property with ID " + id + " not found");
            }
        } catch (SQLException e) {
            throw new DatabaseException("Error retrieving property: " + e.getMessage());
        }

        return property;
    }

    public List<Property> findPropertiesByUserId(int userId) throws DatabaseException, PropertyValidationException {
        logger.debug("Retrieving properties for user with ID: {}", userId);
        List<Property> properties = new ArrayList<>();

        try (Connection conn = dataSource.getConnection()) {
            String sql = "SELECT * FROM properties WHERE user_id = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                Property property = new Property(
                        rs.getInt("property_id"),
                        rs.getString("title"),
                        rs.getString("description"),
                        rs.getString("property_type"),
                        rs.getString("transaction_type"),
                        rs.getInt("price"),
                        rs.getInt("surface_area"),
                        rs.getInt("rooms"),
                        rs.getInt("bathrooms"),
                        rs.getInt("floor"),
                        rs.getInt("total_floors"),
                        rs.getInt("year_built"),
                        rs.getDate("created_at"),
                        rs.getString("address"),
                        rs.getString("country"),
                        rs.getString("city"),
                        rs.getString("state"),
                        rs.getDouble("latitude"),
                        rs.getDouble("longitude"),
                        rs.getString("contact_name"),
                        rs.getString("contact_phone"),
                        rs.getString("contact_email"),
                        rs.getInt("user_id")
                );
                properties.add(property);
            }

            logger.debug("Found {} properties for user ID: {}", properties.size(), userId);
        } catch (SQLException e) {
            logger.error("Database error when retrieving properties for user ID: {}", userId, e);
            throw new DatabaseException("Error retrieving user properties: " + e.getMessage(), e);
        }

        return properties;
    }

    public int addProperty(Property property) throws DatabaseException {
        logger.debug("Adding new property: {}", property.getTitle());

        try (Connection conn = dataSource.getConnection()) {
            String sql = "INSERT INTO properties (title, description, property_type, transaction_type, "
                    + "price, surface_area, rooms, bathrooms, floor, total_floors, year_built, "
                    + "created_at, address, country, city, state, latitude, longitude, contact_name, contact_phone, contact_email, user_id) "
                    + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            PreparedStatement stmt = conn.prepareStatement(sql, new String[]{"property_id"});
            stmt.setString(1, property.getTitle());
            stmt.setString(2, property.getDescription());
            stmt.setString(3, property.getPropertyType());
            stmt.setString(4, property.getTransactionType());
            stmt.setInt(5, property.getPrice());
            stmt.setInt(6, property.getSurface());
            stmt.setInt(7, property.getRooms());
            stmt.setInt(8, property.getBathrooms());
            stmt.setInt(9, property.getFloor());
            stmt.setInt(10, property.getTotalFloors());
            stmt.setInt(11, property.getYearBuilt());
            stmt.setDate(12, property.getCreatedAt());
            stmt.setString(13, property.getAddress());
            stmt.setString(14, property.getCountry());
            stmt.setString(15, property.getCity());
            stmt.setString(16, property.getState());
            stmt.setDouble(17, property.getLatitude());
            stmt.setDouble(18, property.getLongitude());
            stmt.setString(19, property.getContactName());
            stmt.setString(20, property.getContactPhone());
            stmt.setString(21, property.getContactEmail());
            stmt.setInt(22, property.getUserId());

            int affectedRows = stmt.executeUpdate();

            if (affectedRows == 0) {
                logger.error("Creating property failed, no rows affected");
                throw new DatabaseException("Failed to create property, no rows affected");
            }

            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    int id = generatedKeys.getInt(1);
                    logger.info("Added new property with ID: {}", id);
                    return id;
                } else {
                    logger.error("Creating property failed, no ID obtained");
                    throw new DatabaseException("Failed to create property, no ID obtained");
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("Error adding property: " + e.getMessage());
        }
    }

    public void updateProperty(int propertyId, int userId, Property property) throws DatabaseException, PropertyNotFoundException {
        logger.debug("Attempting to update property with ID: {} for user ID: {}", propertyId, userId);

        try (Connection conn = dataSource.getConnection()) {
            String checkSql = "SELECT property_id FROM properties WHERE property_id = ? AND user_id = ?";
            try (PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
                checkStmt.setInt(1, propertyId);
                checkStmt.setInt(2, userId);
                ResultSet rs = checkStmt.executeQuery();

                if (!rs.next()) {
                    logger.warn("Property with ID {} not found or doesn't belong to user ID {}", propertyId, userId);
                    throw new PropertyNotFoundException("Property not found or doesn't belong to this user");
                }
            }

            String sql = "UPDATE properties SET " +
                    "title = ?, description = ?, property_type = ?, transaction_type = ?, " +
                    "price = ?, surface_area = ?, rooms = ?, bathrooms = ?, " +
                    "floor = ?, total_floors = ?, year_built = ?, " +
                    "address = ?, country = ?, city = ?, state = ?, latitude = ?, longitude = ?, " +
                    "contact_name = ?, contact_phone = ?, contact_email = ? " +
                    "WHERE property_id = ? AND user_id = ?";

            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, property.getTitle());
                stmt.setString(2, property.getDescription());
                stmt.setString(3, property.getPropertyType());
                stmt.setString(4, property.getTransactionType());
                stmt.setInt(5, property.getPrice());
                stmt.setInt(6, property.getSurface());
                stmt.setInt(7, property.getRooms());
                stmt.setInt(8, property.getBathrooms());
                stmt.setInt(9, property.getFloor());
                stmt.setInt(10, property.getTotalFloors());
                stmt.setInt(11, property.getYearBuilt());
                stmt.setString(12, property.getAddress());
                stmt.setString(13, property.getCountry());
                stmt.setString(14, property.getCity());
                stmt.setString(15, property.getState());
                stmt.setDouble(16, property.getLatitude());
                stmt.setDouble(17, property.getLongitude());
                stmt.setString(18, property.getContactName());
                stmt.setString(19, property.getContactPhone());
                stmt.setString(20, property.getContactEmail());
                stmt.setInt(21, propertyId);
                stmt.setInt(22, userId);

                int rowsAffected = stmt.executeUpdate();

                if (rowsAffected == 0) {
                    logger.error("No rows affected when updating property {}", propertyId);
                    throw new DatabaseException("Failed to update property, no rows affected");
                }

                logger.info("Successfully updated property with ID: {}", propertyId);
            }
        } catch (SQLException e) {
            throw new DatabaseException("Error updating property: " + e.getMessage());
        }
    }

    public void deleteProperty(int propertyId, int userId) throws DatabaseException, PropertyNotFoundException {
        logger.debug("Attempting to delete property with ID: {} for user ID: {}", propertyId, userId);

        try (Connection conn = dataSource.getConnection()) {

            String checkSql = "SELECT property_id FROM properties WHERE property_id = ? AND user_id = ?";
            PreparedStatement checkStmt = conn.prepareStatement(checkSql);
            checkStmt.setInt(1, propertyId);
            checkStmt.setInt(2, userId);
            ResultSet rs = checkStmt.executeQuery();

            if (!rs.next()) {
                logger.warn("Property with ID {} not found or doesn't belong to user ID {}", propertyId, userId);
                throw new PropertyNotFoundException("Property not found or doesn't belong to this user");
            }

            String sql = "DELETE FROM properties WHERE property_id = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, propertyId);
            int rowsAffected = stmt.executeUpdate();

            if (rowsAffected == 0) {
                logger.error("No rows affected when deleting property {}", propertyId);
                throw new DatabaseException("Failed to delete property, no rows affected");
            }

            logger.info("Successfully deleted property with ID: {}", propertyId);
        } catch (SQLException e) {
            throw new DatabaseException("Error deleting property: " + e.getMessage());
        }
    }

    public List<TopProperty> findTopProperties() throws DatabaseException {
        logger.debug("Retrieving top properties");
        List<TopProperty> topProperties = new ArrayList<>();

        try (Connection conn = dataSource.getConnection()) {
            String sql = "SELECT tp.property_id, p.title, p.price " +
                    "FROM top_properties tp " +
                    "JOIN properties p ON tp.property_id = p.property_id ";

            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                TopProperty property = new TopProperty(
                        rs.getInt("property_id"),
                        rs.getString("title"),
                        rs.getInt("price")
                );
                topProperties.add(property);
            }

            logger.debug("Found {} top properties", topProperties.size());

            if (topProperties.isEmpty()) {
                logger.warn("No top properties found in database");
            }

        } catch (SQLException e) {
            throw new DatabaseException("Error retrieving top properties: " + e.getMessage());
        }

        return topProperties;
    }

    public int testAddPropertyAsObject(Property property) throws DatabaseException, PropertyValidationException {
        String testAddPropertyAsObject = "{call test_add(?)}";
        try(Connection connection = this.dataSource.getConnection();
        CallableStatement stmt = connection.prepareCall(testAddPropertyAsObject)){
            Object[] obj = property.mapPropertyClassToDbPropertyType();
            Struct propertyStruct = connection.createStruct("PROPERTY", obj);

            stmt.setObject(1, propertyStruct);
            stmt.execute();
            return 1;
        }
        catch (SQLException e) {
            if (e.getErrorCode() == 20003) {
                throw new PropertyValidationException(e.getMessage());
            }
            throw new DatabaseException(e.getMessage());
        }
    }

    public List<PropertyForAllListings> getAllPropertiesWithBothFilters(String propertyType, String transactionType)
            throws DatabaseException, NoListingsForThisCategoryException {

        String sql = "SELECT property_id, title, rooms, floor, year_built, bathrooms, surface_area, " +
                "city, state, country, latitude, longitude, price, transaction_type " +
                "FROM properties WHERE 1=1";

        List<Object> params = new ArrayList<>();

        if (propertyType != null && !propertyType.isEmpty()) {
            sql += " AND property_type = ?";
            params.add(propertyType);
        }

        if (transactionType != null && !transactionType.isEmpty()) {
            sql += " AND transaction_type = ?";
            params.add(transactionType);
        }

        try (Connection connection = this.dataSource.getConnection();
             PreparedStatement stmt = connection.prepareStatement(sql)) {

            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            ResultSet result = stmt.executeQuery();
            List<PropertyForAllListings> properties = new ArrayList<>();

            if (!result.isBeforeFirst()) {
                // No results found
                String filterInfo = propertyType + (transactionType != null ? " with transaction type " + transactionType : "");
                throw new NoListingsForThisCategoryException("There are no listings for: " + filterInfo);
            }

            while (result.next()) {
                properties.add(new PropertyForAllListings(
                        result.getInt("property_id"),
                        result.getString("title"),
                        result.getInt("rooms"),
                        result.getInt("floor"),
                        result.getInt("year_built"),
                        result.getInt("bathrooms"),
                        result.getInt("surface_area"),
                        result.getString("city"),
                        result.getString("state"),
                        result.getString("country"),
                        result.getDouble("latitude"),
                        result.getDouble("longitude"),
                        result.getInt("price"),
                        result.getString("transaction_type")
                ));
            }

            logger.debug("Found {} properties matching the filter criteria", properties.size());
            return properties;

        } catch (SQLException e) {
            logger.error("Database error when retrieving filtered properties", e);
            throw new DatabaseException("Error retrieving properties: " + e.getMessage(), e);
        }
    }

        public List<PropertyForAllListings> getAllPropertiesWithCriteria(String filterCriteria) throws DatabaseException, NoListingsForThisCategoryException {
            String stmtAsString = "SELECT property_id, title, rooms, floor, year_built, bathrooms, surface_area, city, state, country, latitude, longitude, price, transaction_type FROM properties WHERE property_type = ?";
            try(Connection connection = this.dataSource.getConnection();
                PreparedStatement stmt = connection.prepareStatement(stmtAsString)) {
                stmt.setString(1, filterCriteria);
                ResultSet result = stmt.executeQuery();
                List<PropertyForAllListings> properties = new ArrayList<>();
                if (!result.next()) {
                    throw new NoListingsForThisCategoryException("There are no listings for the category: " + filterCriteria);
                }
                else while (result.next()) {
                    properties.add(new PropertyForAllListings(
                            result.getInt("property_id"),
                            result.getString("title"),
                            result.getInt("rooms"),
                            result.getInt("floor"),
                            result.getInt("year_built"),
                            result.getInt("bathrooms"),
                            result.getInt("surface_area"),
                            result.getString("city"),
                            result.getString("state"),
                            result.getString("country"),
                            result.getDouble("latitude"),
                            result.getDouble("longitude"),
                            result.getInt("price"),
                            result.getString("transaction_type")
                        ));
                }
                return properties;
            } catch (SQLException e) {
                throw new DatabaseException(e.getMessage());
            }
        }

    public List<String> findFilteredCities(int minPrice, int maxPrice, int minArea, int maxArea,
                                           int minBedrooms, int maxBedrooms, float minBathrooms, float maxBathrooms,
                                           int minFloor, int maxFloor, int minYearBuilt, int maxYearBuilt) throws DatabaseException {
        logger.debug("Finding cities with filters: price({}-{}), area({}-{}), bedrooms({}-{}), bathrooms({}-{}), floor({}-{}), yearBuilt({}-{})",
                minPrice, maxPrice, minArea, maxArea, minBedrooms, maxBedrooms, minBathrooms, maxBathrooms, minFloor, maxFloor, minYearBuilt, maxYearBuilt);

        List<String> cities = new ArrayList<>();

        String sql = "SELECT DISTINCT city FROM properties WHERE " +
                "price >= ? AND price <= ? AND " +
                "surface_area >= ? AND surface_area <= ? AND " +
                "rooms >= ? AND rooms <= ? AND " +
                "bathrooms >= ? AND bathrooms <= ? AND " +
                "floor >= ? AND floor <= ? AND " +
                "year_built >= ? AND year_built <= ? " +
                "ORDER BY city";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, minPrice);
            stmt.setInt(2, maxPrice);
            stmt.setInt(3, minArea);
            stmt.setInt(4, maxArea);
            stmt.setInt(5, minBedrooms);
            stmt.setInt(6, maxBedrooms);
            stmt.setFloat(7, minBathrooms);
            stmt.setFloat(8, maxBathrooms);
            stmt.setInt(9, minFloor);
            stmt.setInt(10, maxFloor);
            stmt.setInt(11, minYearBuilt);
            stmt.setInt(12, maxYearBuilt);

            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                String city = rs.getString("city");
                if (city != null && !city.isEmpty()) {
                    cities.add(city);
                }
            }

            logger.debug("Found {} cities matching the filter criteria", cities.size());
            return cities;

        } catch (SQLException e) {
            logger.error("Database error when retrieving filtered cities", e);
            throw new DatabaseException("Error retrieving filtered cities: " + e.getMessage(), e);
        }
    }

    public List<String> findFilteredStates(int minPrice, int maxPrice, int minArea, int maxArea,
                                           int minBedrooms, int maxBedrooms, float minBathrooms, float maxBathrooms,
                                           int minFloor, int maxFloor, int minYearBuilt, int maxYearBuilt) throws DatabaseException {
        logger.debug("Finding states with filters: price({}-{}), area({}-{}), bedrooms({}-{}), bathrooms({}-{}), floor({}-{}), yearBuilt({}-{})",
                minPrice, maxPrice, minArea, maxArea, minBedrooms, maxBedrooms, minBathrooms, maxBathrooms, minFloor, maxFloor, minYearBuilt, maxYearBuilt);

        List<String> states = new ArrayList<>();

        String sql = "SELECT DISTINCT state FROM properties WHERE " +
                "price >= ? AND price <= ? AND " +
                "surface_area >= ? AND surface_area <= ? AND " +
                "rooms >= ? AND rooms <= ? AND " +
                "bathrooms >= ? AND bathrooms <= ? AND " +
                "floor >= ? AND floor <= ? AND " +
                "year_built >= ? AND year_built <= ? " +
                "ORDER BY state";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, minPrice);
            stmt.setInt(2, maxPrice);
            stmt.setInt(3, minArea);
            stmt.setInt(4, maxArea);
            stmt.setInt(5, minBedrooms);
            stmt.setInt(6, maxBedrooms);
            stmt.setFloat(7, minBathrooms);
            stmt.setFloat(8, maxBathrooms);
            stmt.setInt(9, minFloor);
            stmt.setInt(10, maxFloor);
            stmt.setInt(11, minYearBuilt);
            stmt.setInt(12, maxYearBuilt);

            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                String state = rs.getString("state");
                if (state != null && !state.isEmpty()) {
                    states.add(state);
                }
            }

            logger.debug("Found {} states matching the filter criteria", states.size());
            return states;

        } catch (SQLException e) {
            logger.error("Database error when retrieving filtered states", e);
            throw new DatabaseException("Error retrieving filtered states: " + e.getMessage(), e);
        }
    }
}