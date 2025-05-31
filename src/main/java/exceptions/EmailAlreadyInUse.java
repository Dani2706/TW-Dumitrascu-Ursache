package exceptions;

public class EmailAlreadyInUse extends Exception {
    public EmailAlreadyInUse(String message) {
        super(message);
    }
}
