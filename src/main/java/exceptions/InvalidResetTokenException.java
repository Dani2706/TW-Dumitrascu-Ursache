package exceptions;

public class InvalidResetTokenException extends Exception {
    public InvalidResetTokenException(String message) {
        super(message);
    }

    public InvalidResetTokenException(Exception e) {
        super(e);
    }
}
