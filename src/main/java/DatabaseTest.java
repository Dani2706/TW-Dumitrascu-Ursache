import oracle.jdbc.internal.OracleTypes;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.CallableStatement;
import java.sql.Connection;



@WebServlet("/test-db")
public class DatabaseTest extends HttpServlet {
    private final String functionName = "{? = call initializeDB}";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException{
        DataSource dataSource = (DataSource) req.getServletContext().getAttribute("dataSource");

        try (Connection connection = dataSource.getConnection();
             CallableStatement stmt = connection.prepareCall(functionName)) {

             stmt.registerOutParameter(1, OracleTypes.VARCHAR);

             stmt.execute();

             String result = stmt.getString(1);
             PrintWriter out = resp.getWriter();
             resp.setContentType("text/plain");
             out.println(result);

        } catch (Exception e) {
            e.printStackTrace();
            resp.getWriter().println("Database connection failed: " + e.getMessage());
        }
    }
}
