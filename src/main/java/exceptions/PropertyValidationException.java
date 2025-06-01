package exceptions;

public class PropertyValidationException extends RuntimeException {
    public PropertyValidationException(String message) {
        super(message);
    }
}
