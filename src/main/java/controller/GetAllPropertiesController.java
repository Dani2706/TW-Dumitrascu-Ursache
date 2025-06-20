package controller;

import exceptions.DatabaseException;
import exceptions.NoListingsForThisCategoryException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import service.PropertyService;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.IOException;


@WebServlet("/api/properties")
public class GetAllPropertiesController extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(GetAllPropertiesController.class);
    private PropertyService propertyService;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.propertyService = new PropertyService(dataSource);
    }

    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse resp) {
        try {
            String propertyType = req.getParameter("propertyType");
            String transactionType = req.getParameter("transactionType");

            logger.info("Fetching properties with propertyType: {} and transactionType: {}", propertyType, transactionType);

            String jsonString = this.propertyService.getAllPropertiesWithFilters(propertyType, transactionType);
            resp.setContentType("application/json");
            resp.setCharacterEncoding("UTF-8");
            resp.getWriter().write(jsonString);
            resp.setStatus(HttpServletResponse.SC_OK);
        } catch (NoListingsForThisCategoryException e) {
            logger.warn("No listings found for the specified criteria", e);
            try {
                resp.getWriter().write("[]");
                resp.setContentType("application/json");
            } catch (IOException ex) {
                logger.error("Error writing empty response", ex);
            }
            resp.setStatus(HttpServletResponse.SC_OK);
        } catch (IOException | DatabaseException e) {
            logger.error("Error processing request", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}