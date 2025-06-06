package repository;

import entity.Property;
import entity.PropertyForAllListings;
import entity.TopProperty;
import exceptions.DatabaseException;
import exceptions.NoListingsForThisCategoryException;
import exceptions.PropertyNotFoundException;
import exceptions.PropertyValidationException;
import oracle.sql.STRUCT;
import oracle.sql.StructDescriptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;
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

    public Property findById(int id) throws PropertyNotFoundException, DatabaseException {
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
                        rs.getString("city"),
                        rs.getString("state"),
                        rs.getString("contact_name"),
                        rs.getString("contact_phone"),
                        rs.getString("contact_email")
                );
                logger.debug("Property found: ID={}, Title={}", property.getPropertyId(), property.getTitle());
            } else {
                logger.warn("No property found with ID: {}", id);
                throw new PropertyNotFoundException("Property with ID " + id + " not found");
            }
        } catch (SQLException e) {
            logger.error("Database error when finding property by ID: {}", id, e);
            throw new DatabaseException("Error retrieving property: " + e.getMessage(), e);
        }

        return property;
    }

    public List<Property> findPropertiesByUserId(int userId) throws DatabaseException {
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
                        rs.getString("city"),
                        rs.getString("state"),
                        rs.getString("contact_name"),
                        rs.getString("contact_phone"),
                        rs.getString("contact_email")
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
                    + "created_at, address, city, state, contact_name, contact_phone, contact_email, user_id) "
                    + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

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
            stmt.setString(14, property.getCity());
            stmt.setString(15, property.getState());
            stmt.setString(16, property.getContactName());
            stmt.setString(17, property.getContactPhone());
            stmt.setString(18, property.getContactEmail());
            stmt.setInt(19, 1); // hardcoded for demo

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
            logger.error("Database error when adding property: {}", e.getMessage(), e);
            throw new DatabaseException("Error adding property: " + e.getMessage(), e);
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
                    "address = ?, city = ?, state = ?, " +
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
                stmt.setString(13, property.getCity());
                stmt.setString(14, property.getState());
                stmt.setString(15, property.getContactName());
                stmt.setString(16, property.getContactPhone());
                stmt.setString(17, property.getContactEmail());
                stmt.setInt(18, propertyId);
                stmt.setInt(19, userId);

                int rowsAffected = stmt.executeUpdate();

                if (rowsAffected == 0) {
                    logger.error("No rows affected when updating property {}", propertyId);
                    throw new DatabaseException("Failed to update property, no rows affected");
                }

                logger.info("Successfully updated property with ID: {}", propertyId);
            }
        } catch (SQLException e) {
            logger.error("Database error when updating property ID: {}", propertyId, e);
            throw new DatabaseException("Error updating property: " + e.getMessage(), e);
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
            logger.error("Database error when deleting property ID: {}", propertyId, e);
            throw new DatabaseException("Error deleting property: " + e.getMessage(), e);
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
            logger.error("Database error when retrieving top properties", e);
            throw new DatabaseException("Error retrieving top properties: " + e.getMessage(), e);
        }

        return topProperties;
    }

    public int test_add_property_as_object(Property property) throws DatabaseException, PropertyValidationException {
        String test_add_property_as_object = "{call test_add(?)}";
        try(Connection connection = this.dataSource.getConnection();
        CallableStatement stmt = connection.prepareCall(test_add_property_as_object)){
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

//    public String getAllPropertiesWithCriteria(String filterCriteria) throws DatabaseException {
//        String stmtAsString = "SELECT * FROM properties WHERE property_type = ?";
//        try(Connection connection = this.dataSource.getConnection();
//            PreparedStatement stmt = connection.prepareStatement(stmtAsString)){
//            stmt.setString(1, filterCriteria);
//            ResultSet result = stmt.executeQuery();
//            List<Property> properties = new ArrayList<>();
//            if (!result.next()) {
//                throw new NoListingsForThisCategory("There are no listings for the category: " + filterCriteria);
//            }
//            else while(result.next()){
//                Clob desc = result.getClob("description");
//                if (desc != null) {
//                    StringBuilder stringBuilder = new StringBuilder();
//                    try (Reader reader = desc.getCharacterStream();
//                         BufferedReader bufferedReader = new BufferedReader(reader)) {
//                        String line;
//                        while ((line = bufferedReader.readLine()) != null) {
//                            stringBuilder.append(line);
//                        }
//                    }
//                }
//                properties.add(new Property(
//                        result.getInt("property_id"),
//                        result.getInt("user_id"),
//                        result.getString("title"),
//                        result.getClob("description"),
//                        result.getString("property_type"),
//                        result.getString("transaction_type"),
//                        result.getInt("price"),
//                        result.getInt("surface_area"),
//                        result.getInt("rooms"),
//                        result.getInt("bathrooms"),
//                        result.getInt("floor"),
//                        result.getInt("total_floors"),
//                        result.getInt("year_built"),
//                        result.getDate("created_at"),
//                        result.getDate("updated_at"),
//                        result.getString("country"),
//                        result.getString("city"),
//                        result.getString("state"),
//                        result.getString("address"),
//                        result.getInt("latitude"),
//                        result.getInt("longitude"),
//                        result.getString("contact_name"),
//                        result.getString("contact_phone"),
//                        result.getString("contact_email")
//                ));
//            }
//        } catch (SQLException e) {
//            throw new DatabaseException(e.getMessage());
//        } catch (IOException e){
//
//        }
//    }

        public List<PropertyForAllListings> getAllPropertiesWithCriteria(String filterCriteria) throws DatabaseException, NoListingsForThisCategoryException {
            String stmtAsString = "SELECT property_id, title, rooms, bathrooms, surface_area, city, country, price, transaction_type FROM properties WHERE property_type = ?";
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
                            result.getInt("bathrooms"),
                            result.getInt("surface_area"),
                            result.getString("city"),
                            result.getString("country"),
                            result.getInt("price"),
                            result.getString("transaction_type")
                        ));
                }
                return properties;
            } catch (SQLException e) {
                throw new DatabaseException(e.getMessage());
            }
        }
}