package exceptions;

public class JwtSecretNotSet extends RuntimeException {
    public JwtSecretNotSet(String message) {
        super(message);
    }
}
