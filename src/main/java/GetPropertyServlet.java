
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/property")
public class GetPropertyServlet extends HttpServlet {

    private PropertyService propertyService;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.propertyService = new PropertyService(dataSource);
    }

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

        try {
            Property property = propertyService.getPropertyById(id);

            response.setContentType("application/json");
            PrintWriter out = response.getWriter();

            String json = "{" +
                    "\"id\":" + property.getPropertyId() + "," +
                    "\"title\":\"" + property.getTitle() + "\"," +
                    "\"description\":\"" + property.getDescription() + "\"," +
                    "\"propertyType\":\"" + property.getPropertyType() + "\"," +
                    "\"transactionType\":\"" + property.getTransactionType() + "\"," +
                    "\"price\":" + property.getPrice() + "," +
                    "\"surface\":" + property.getSurface() + "," +
                    "\"rooms\":" + property.getRooms() + "," +
                    "\"bathrooms\":" + property.getBathrooms() + "," +
                    "\"floor\":" + property.getFloor() + "," +
                    "\"totalFloors\":" + property.getTotalFloors() + "," +
                    "\"yearBuilt\":" + property.getYearBuilt() + "," +
                    "\"createdAt\":\"" + property.getCreatedAt() + "\"," +
                    "\"address\":\"" + property.getAddress() + "\"," +
                    "\"city\":\"" + property.getCity() + "\"," +
                    "\"state\":\"" + property.getState() + "\"," +
                    "\"contactName\":\"" + property.getContactName() + "\"," +
                    "\"contactPhone\":\"" + property.getContactPhone() + "\"," +
                    "\"contactEmail\":\"" + property.getContactEmail() + "\"" +
                    "}";

            out.write(json);

        } catch (IllegalArgumentException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Error: " + e.getMessage());
        } catch (RuntimeException e) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.getWriter().println("Error: " + e.getMessage());
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Internal server error");
            e.printStackTrace();
        }
    }
}