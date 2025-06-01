package exceptions;

public class InvalidPropertyIdException extends RuntimeException {
    public InvalidPropertyIdException(String message) {
        super(message);
    }
}