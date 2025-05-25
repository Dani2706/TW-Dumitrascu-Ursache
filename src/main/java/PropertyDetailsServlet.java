import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;

@WebServlet("/property")
public class PropertyDetailsServlet extends HttpServlet {

    private final String DB_URL = "jdbc:postgresql://localhost:5432/postgres";
    private final String DB_USER = "postgres";
    private final String DB_PASSWORD = "password";

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        System.out.println("Received request for property details");
        String idParam = request.getParameter("id");
        System.out.println("ID parameter: " + idParam);

        if(idParam == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Missing 'id' parameter");
            return;
        }

        int id;
        try {
            id = Integer.parseInt(idParam);
        } catch(NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Invalid 'id' parameter");
            return;
        }

        Property property = getPropertyById(id);

        if (property == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.getWriter().println("Property not found");
            return;
        }

        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String json = "{" +
                "\"id\":" + property.getId() + "," +
                "\"title\":\"" + property.getTitle() + "\"," +
                "\"price\":" + property.getPrice() + "," +
                "\"surface\":" + property.getSurface() + "," +
                "\"rooms\":" + property.getRooms() + "," +
                "\"floor\":" + property.getFloor() + "," +
                "\"yearBuilt\":" + property.getYearBuilt() + "," +
                "\"type\":\"" + property.getType() + "\"," +
                "\"description\":\"" + property.getDescription() + "\"," +
                "\"address\":\"" + property.getAddress() + "\"," +
                "\"city\":\"" + property.getCity() + "\"," +
                "\"state\":\"" + property.getState() + "\"," +
                "\"contactName\":\"" + property.getContactName() + "\"," +
                "\"contactPhone\":\"" + property.getContactPhone() + "\"," +
                "\"contactEmail\":\"" + property.getContactEmail() + "\"," +
                "\"imageUrl\":\"" + property.getImageUrl() + "\"" +
                "}";

        out.write(json);
    }

    private Property getPropertyById(int id) {
        System.out.println("Attempting to get property with ID: " + id);
        Property property = null;

        try {
            Class.forName("org.postgresql.Driver");
            System.out.println("PostgreSQL driver loaded successfully");


            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
                System.out.println("Database connection established");

                String sql = "SELECT * FROM properties WHERE id = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, id);
                ResultSet rs = stmt.executeQuery();
                if (rs.next()) {
                    property = new Property(
                            rs.getInt("id"),
                            rs.getString("title"),
                            rs.getInt("price"),
                            rs.getInt("surface"),
                            rs.getInt("rooms"),
                            rs.getInt("floor"),
                            rs.getInt("year_built"),
                            rs.getString("type"),
                            rs.getString("description"),
                            rs.getString("address"),
                            rs.getString("city"),
                            rs.getString("state"),
                            rs.getString("contact_name"),
                            rs.getString("contact_phone"),
                            rs.getString("contact_email"),
                            rs.getString("image_url")
                    );
                }
            }
        } catch(Exception e) {
            System.err.println("Error in getPropertyById: " + e.getMessage());
            e.printStackTrace();
        }

        return property;
    }

}
