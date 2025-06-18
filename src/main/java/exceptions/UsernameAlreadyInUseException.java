package exceptions;

public class UsernameAlreadyInUseException extends Exception {
    public UsernameAlreadyInUseException(String message) {
        super(message);
    }
}
