package service;

import exceptions.EmailAlreadyInUse;
import exceptions.InvalidPasswordException;
import exceptions.InvalidUsernameException;
import exceptions.UsernameAlreadyInUse;
import repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import util.JwtUtil;

import javax.sql.DataSource;
import java.sql.SQLException;

public class UserService {
    private UserRepository userRepository;
    private JwtUtil jwtUtil;

    public UserService() {
        this.jwtUtil = new JwtUtil();
        this.userRepository = new UserRepository();
    }

    public void addUser(DataSource dataSource, String username, String email, String password) throws SQLException, UsernameAlreadyInUse, EmailAlreadyInUse {
        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
        String result = userRepository.addUser(dataSource, username, email, hashedPassword);
        if (result.equals("User with given username already exists")) {
            throw new UsernameAlreadyInUse("The username (" + username + ") is already being used");
        }
        else if (result.equals("User with given email already exists")) {
            throw new EmailAlreadyInUse("The email (" + email + ") is already being used");
        }
    }

    public void validateCredentials(DataSource dataSource, String username, String password) throws SQLException, InvalidUsernameException, InvalidPasswordException {
        String hashedPasswordFromDb = this.userRepository.getPasswordForUser(dataSource, username);
        if (!BCrypt.checkpw(password, hashedPasswordFromDb)){
            throw new InvalidPasswordException("The given password does not match the recorded one");
        }
    }

    public String generateJWT(String username) {
        return jwtUtil.generateToken(username);
    }
}
