package util;

import org.slf4j.Logger;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class HandleErrorUtil {
    private HandleErrorUtil() {}

    public static void handleError(HttpServletResponse response, String errorMessage, Logger logger) {
        try {
            response.getWriter().write(errorMessage);
        } catch (IOException e) {
            logger.error("", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
