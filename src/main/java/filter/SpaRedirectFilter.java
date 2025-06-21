package filter;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

@WebFilter("/*")
public class SpaRedirectFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void destroy() {}

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse,
                         FilterChain filterChain) throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        String path = request.getRequestURI();

        if (path.startsWith(request.getContextPath() + "/api") ||
                path.matches(".*\\.(js|html|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$")) {
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }
        
        RequestDispatcher dispatcher = request.getRequestDispatcher("/index.html");
        dispatcher.forward(servletRequest, servletResponse);
    }
}
