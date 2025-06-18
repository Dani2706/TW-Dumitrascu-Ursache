package exceptions;

public class PhoneNumberAlreadyInUseException extends Exception {
    public PhoneNumberAlreadyInUseException(String message) {
        super(message);
    }
}
