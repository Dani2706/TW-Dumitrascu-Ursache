package exceptions;

public class PropertyDataException extends RuntimeException {
  public PropertyDataException(String message) {
    super(message);
  }

  public PropertyDataException(String message, Throwable cause) {
    super(message, cause);
  }
}