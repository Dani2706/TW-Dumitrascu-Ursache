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


@WebServlet("/api/all-properties")
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
            String filterCriteria = req.getParameter("filterCriteria");

            String jsonString = this.propertyService.getAllPropertiesWithCriteria(filterCriteria);
            resp.setContentType("application/json");
            resp.setCharacterEncoding("UTF-8");
            resp.getWriter().write(jsonString);
            resp.setStatus(HttpServletResponse.SC_OK);
        } catch (NoListingsForThisCategoryException e) {
            logger.warn("", e);
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
        } catch (IOException | DatabaseException e) {
            logger.error("Error processing request", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
