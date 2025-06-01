package repository;

import entity.Property;
import entity.TopProperty;
import exceptions.DatabaseException;
import exceptions.PropertyNotFoundException;
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
}