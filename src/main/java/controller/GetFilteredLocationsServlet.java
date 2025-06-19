package controller;

import com.google.gson.Gson;
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
import java.util.List;
import java.util.ArrayList;

@WebServlet("/api/getFilteredLocations")
public class GetFilteredLocationsServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(GetFilteredLocationsServlet.class);
    private PropertyService propertyService;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.propertyService = new PropertyService(dataSource);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String type = req.getParameter("type"); // "city" / "state"

            int minPrice = parseIntParam(req.getParameter("minPrice"), 0);
            int maxPrice = parseIntParam(req.getParameter("maxPrice"), Integer.MAX_VALUE);

            int minArea = parseIntParam(req.getParameter("minArea"), 0);
            int maxArea = parseIntParam(req.getParameter("maxArea"), Integer.MAX_VALUE);

            int minBedrooms = parseIntParam(req.getParameter("minBedrooms"), 0);
            int maxBedrooms = parseIntParam(req.getParameter("maxBedrooms"), Integer.MAX_VALUE);

            float minBathrooms = parseIntParam(req.getParameter("minBathrooms"), 0);
            float maxBathrooms = parseIntParam(req.getParameter("maxBathrooms"), Integer.MAX_VALUE);

            int minFloor = parseIntParam(req.getParameter("minFloor"), 0);
            int maxFloor = parseIntParam(req.getParameter("maxFloor"), Integer.MAX_VALUE);

            int minYearBuilt = parseIntParam(req.getParameter("minYearBuilt"), 0);
            int maxYearBuilt = parseIntParam(req.getParameter("maxYearBuilt"), Integer.MAX_VALUE);


            List<String> locations;
            if ("city".equalsIgnoreCase(type)) {
                locations = propertyService.getFilteredCities(minPrice, maxPrice, minArea, maxArea,
                        minBedrooms, maxBedrooms, minBathrooms, maxBathrooms,
                        minFloor, maxFloor, minYearBuilt, maxYearBuilt);
                logger.info("Retrieved {} filtered cities", locations.size());
            } else if ("state".equalsIgnoreCase(type)) {
                locations = propertyService.getFilteredStates(minPrice, maxPrice, minArea, maxArea,
                        minBedrooms, maxBedrooms, minBathrooms, maxBathrooms,
                        minFloor, maxFloor, minYearBuilt, maxYearBuilt);
                logger.info("Retrieved {} filtered states", locations.size());
            } else {
                logger.warn("Invalid location type requested: {}", type);
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\": \"Invalid location type. Use 'city' or 'state'.\"}");
                return;
            }

            String json = new Gson().toJson(locations);
            resp.setContentType("application/json");
            resp.setCharacterEncoding("UTF-8");
            resp.getWriter().write(json);

        } catch (Exception e) {
            logger.error("Error processing filtered locations request", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\": \"An error occurred while processing your request.\"}");
        }
    }

    private int parseIntParam(String param, int defaultValue) {
        if (param == null || param.trim().isEmpty()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(param);
        } catch (NumberFormatException e) {
            logger.warn("Failed to parse parameter: {}. Using default value: {}", param, defaultValue);
            return defaultValue;
        }
    }
}