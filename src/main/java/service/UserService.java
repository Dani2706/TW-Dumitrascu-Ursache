package service;

import com.fasterxml.jackson.core.JsonProcessingException;
import dto.UserDTO;
import entity.User;
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

    public void addUser(String username, String email, String password, String phoneNumber) throws UsernameAlreadyInUseException, EmailAlreadyInUseException, PhoneNumberAlreadyInUseException, DatabaseException {
        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
        userRepository.addUser(username, email, hashedPassword, phoneNumber);
    }

    public void validateCredentials(String username, String password) throws SQLException, InvalidUsernameException, InvalidPasswordException {
        String hashedPasswordFromDb = this.userRepository.getPasswordForUser(username);
        if (!BCrypt.checkpw(password, hashedPasswordFromDb)){
            throw new InvalidPasswordException("The given password does not match the recorded one");
        }
    }

    public String generateJWT(String username, int userId){
        return jwtUtil.generateToken(username, userId);
    }

    public UserDTO getUserData(int userId) throws DatabaseException, InvalidUserIdException {
        return this.userRepository.getUserDataByUserId(userId);
    }

    public int getUserIdByUsername(String username) throws InvalidUsernameException, DatabaseException {
        return this.userRepository.getUserIdByUsername(username);
    }

    public void updateUserById(User user) throws DatabaseException, EmailAlreadyInUseException, UsernameAlreadyInUseException, PhoneNumberAlreadyInUseException {
        this.userRepository.updateUser(user);
    }

    public void deleteUserById(int userId) throws DatabaseException, InvalidUserIdException {
        this.userRepository.deleteUser(userId);
    }
}
