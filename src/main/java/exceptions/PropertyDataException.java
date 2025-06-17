package exceptions;

public class PropertyDataException extends Exception {
  public PropertyDataException(String message) {
    super(message);
  }

  public PropertyDataException(String message, Throwable cause) {
    super(message, cause);
  }
}