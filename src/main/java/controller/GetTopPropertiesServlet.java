package controller;

import entity.TopProperty;
import exceptions.DatabaseException;
import exceptions.PropertyDataException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import service.PropertyService;
import util.HandleErrorUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/api/properties/top")
public class GetTopPropertiesServlet extends HttpServlet {

    private static final Logger logger = LoggerFactory.getLogger(GetTopPropertiesServlet.class);
    private PropertyService propertyService;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.propertyService = new PropertyService(dataSource);
        logger.info("GetTopPropertiesServlet initialized with PropertyService");
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        logger.debug("Received request for top properties");

        try {
            List<TopProperty> topProperties = propertyService.getTopProperties();

            if (topProperties == null || topProperties.isEmpty()) {
                logger.warn("No top properties found");
                throw new PropertyDataException("No top properties available");
            }

            logger.debug("Retrieved {} top properties", topProperties.size());

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            PrintWriter out = response.getWriter();

            out.print("[");

            for (int i = 0; i < topProperties.size(); i++) {
                TopProperty property = topProperties.get(i);

                String json = "{" +
                        "\"id\":" + property.getPropertyId() + "," +
                        "\"title\":\"" + escapeJsonString(property.getTitle()) + "\"," +
                        "\"price\":" + property.getPrice() +
                        "}";

                out.print(json);

                if (i < topProperties.size() - 1) {
                    out.print(",");
                }
            }

            out.print("]");
            out.flush();
            logger.debug("Successfully returned top properties data");

        } catch (PropertyDataException e) {
            logger.error("Property data exception: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            HandleErrorUtil.handleGetWriterError(response, e.getMessage(), logger);
        } catch (DatabaseException | IOException e) {
            logger.error("Error fetching top properties: ", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            HandleErrorUtil.handleGetWriterError(response, "Error fetching top properties", logger);
        }
    }

    private String escapeJsonString(String input) {
        if (input == null) {
            return "";
        }
        return input.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}