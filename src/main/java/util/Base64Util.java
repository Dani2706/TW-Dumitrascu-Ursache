package util;

import java.util.Base64;

public class Base64Util {
    public static byte[] decodeBase64(String base64) {
        String base64Data = base64.contains(",") ? base64.split(",")[1] : base64;
        return Base64.getDecoder().decode(base64Data);
    }

    public static String encodeBase64(byte[] data) {
        return Base64.getEncoder().encodeToString(data);
    }
}
