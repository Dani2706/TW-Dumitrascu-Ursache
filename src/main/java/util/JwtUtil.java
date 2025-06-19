package util;

import entity.User;
import exceptions.JwtSecretNotSet;
import exceptions.NotAuthorizedException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.http.HttpHeaders;
import java.security.Key;
import java.util.Date;

public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);
    private final String jwtSecret = "abc6655sa54d5a4s54d54a5d1awd5adajsbdhaf5as5a656a6s56af6s5a6fa656f5s6a5f65a6sf56a5sf";//System.getenv("JWT_SECRET");
    private static final int JWT_EXPIRATION_MS = 86400000;
    //private static final int JWT_PASSWORD_EXPIRATION_MS = 600000;

    public JwtUtil() {
        if (jwtSecret == null) {
            throw new JwtSecretNotSet("JWT_SECRET not set");
        }
    }

    public String generateToken(String username, int userId) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(new Date().getTime() + JWT_EXPIRATION_MS))
                .claim("userId", userId)
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();

    }

    private Key key(){
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public String getUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public int getUserId(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return ((Number) claims.get("userId")).intValue();
    }

    public boolean validateToken(String token) {
        try{
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token);
            return true;
        } catch (SecurityException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {} ", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    public String verifyAuthorizationHeader(String authorizationHeader) throws NotAuthorizedException {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            if (!this.validateToken(token)){
                throw new NotAuthorizedException("Invalid JWT token");
            }
            return token;
        }
        else {
            throw new NotAuthorizedException("Authorization header is not set");
        }
    }

}
