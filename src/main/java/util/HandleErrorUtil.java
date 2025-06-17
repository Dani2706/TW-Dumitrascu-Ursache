package util;

import exceptions.InvalidPropertyIdException;
import org.slf4j.Logger;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class HandleErrorUtil {
    private HandleErrorUtil() {}

    public static void handleGetWriterError(HttpServletResponse response, String errorMessage, Logger logger) {
        try {
            response.getWriter().write(errorMessage);
        } catch (IOException e) {
            logger.error("", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    public static int handleIntParsingError(String idParam) throws InvalidPropertyIdException {
        try{
            return Integer.parseInt(idParam);
        } catch(NumberFormatException e) {
            throw new InvalidPropertyIdException("Invalid 'id' parameter: must be a number" +  e.getMessage());
        }
    }
}
