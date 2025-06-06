package service;

import exceptions.*;
import repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import util.JwtUtil;

import javax.sql.DataSource;
import java.sql.SQLException;

public class UserService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public UserService(DataSource dataSource) {
        this.jwtUtil = new JwtUtil();
        this.userRepository = new UserRepository(dataSource);
    }

    public void addUser(String username, String email, String password, String phoneNumber) throws UsernameAlreadyInUse, EmailAlreadyInUse, DatabaseException {
        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
        userRepository.addUser(username, email, hashedPassword, phoneNumber);
    }

    public void validateCredentials(String username, String password) throws SQLException, InvalidUsernameException, InvalidPasswordException {
        String hashedPasswordFromDb = this.userRepository.getPasswordForUser(username);
        if (!BCrypt.checkpw(password, hashedPasswordFromDb)){
            throw new InvalidPasswordException("The given password does not match the recorded one");
        }
    }

    public String generateJWT(String username) {
        return jwtUtil.generateToken(username);
    }
}
