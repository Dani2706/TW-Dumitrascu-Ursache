package controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

import com.fasterxml.jackson.databind.ObjectMapper;
import exceptions.InvalidPropertyIdException;
import exceptions.NotAuthorizedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import service.PropertyService;
import exceptions.PropertyDataException;
import util.HandleErrorUtil;
import util.JwtUtil;

@WebServlet("/delete-property")
public class DeletePropertyServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(DeletePropertyServlet.class);
    private PropertyService propertyService;
    private JwtUtil jwtUtil;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        this.propertyService = new PropertyService(dataSource);
        this.jwtUtil = new JwtUtil();
        logger.info("DeletePropertyServlet initialized with PropertyService");
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        logger.debug("Received request to delete property");

        String authHeader = request.getHeader("Authorization");

        StringBuilder requestBody = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String token = this.jwtUtil.verifyAuthorizationHeader(authHeader);

            String line;
            while ((line = reader.readLine()) != null) {
                requestBody.append(line);
            }

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> bodyParams = objectMapper.readValue(requestBody.toString(), Map.class);

            String propertyIdAsString = (String) bodyParams.get("propertyId");

            int propertyId = HandleErrorUtil.handleIntParsingError(propertyIdAsString);

            propertyService.deleteProperty(propertyId, token);

            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":true,\"message\":\"Property deleted successfully\"}");
            logger.debug("Property with ID {} deleted successfully", propertyId);

        } catch (InvalidPropertyIdException e) {
            logger.error("Invalid property ID: ", e);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            HandleErrorUtil.handleGetWriterError(response, e.getMessage(), logger);
        } catch (NotAuthorizedException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            logger.warn("", e);
        } catch (PropertyDataException | IOException e) {
            logger.error("Error deleting property: ", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            HandleErrorUtil.handleGetWriterError(response, e.getMessage(), logger);
        }
    }
}