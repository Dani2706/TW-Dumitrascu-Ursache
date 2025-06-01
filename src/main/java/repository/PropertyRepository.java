package repository;

import entity.Property;

import javax.sql.DataSource;
import java.sql.*;

public class PropertyRepository {
    private DataSource dataSource;

    public PropertyRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Property findById(int id) {
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
            }
        } catch (SQLException e) {
            System.err.println("Error in PropertyRepository.findById: " + e.getMessage());
            e.printStackTrace();
        }

        return property;
    }
}