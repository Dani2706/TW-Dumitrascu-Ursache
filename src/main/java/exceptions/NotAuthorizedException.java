package exceptions;

public class NotAuthorizedException extends Exception {
    public NotAuthorizedException(String message) {
        super(message);
    }
}
