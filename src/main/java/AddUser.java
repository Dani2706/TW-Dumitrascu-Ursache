import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

public class AddUser extends HttpServlet {
    private final UserService userService;

    public AddUser() {
        this.userService = new UserService();
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        DataSource dataSource = (DataSource) req.getServletContext().getAttribute("dataSource");

        // Read the request body
        StringBuilder requestBody = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                requestBody.append(line);
            }
        }

        // Parse JSON body
        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> bodyParams = objectMapper.readValue(requestBody.toString(), Map.class);

        try {
            int id = (int) bodyParams.get("id");
            String username = (String) bodyParams.get("username");
            String password = (String) bodyParams.get("password");
            String email = (String) bodyParams.get("email");

            this.userService.addUser(dataSource, id, username, email, password);
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("Invalid request body");
        }
    }
}
