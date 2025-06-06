package exceptions;

public class NoListingsForThisCategoryException extends Exception {
    public NoListingsForThisCategoryException(String message) {
        super(message);
    }
}
