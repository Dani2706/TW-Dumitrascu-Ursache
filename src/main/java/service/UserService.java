package service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dto.AdminUserDTO;
import dto.DataForJwtCreationDTO;
import dto.UserDTO;
import entity.User;
import exceptions.*;
import repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import util.JwtUtil;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.List;

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

    public String generateJWT(String username) throws DatabaseException, InvalidUsernameException {
        DataForJwtCreationDTO userData = this.userRepository.getUserDataForJwtRecreationByUsername(username);
        return jwtUtil.generateToken(userData.getUsername(), userData.getUserId(), userData.getAdminStatus());
    }

    public String refreshJWT(String token, int userId) throws DatabaseException, InvalidUserIdException {
        DataForJwtCreationDTO userData = this.userRepository.getUserDataForJwtRecreationByUserId(userId);
        //this.jwtUtil.blacklistToken(token);
        return jwtUtil.generateToken(userData.getUsername(), userData.getUserId(), userData.getAdminStatus());
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

    public void changeAdminStatusOfUser(int adminStatus, int userId) throws DatabaseException, InvalidUserIdException {
        this.userRepository.changeAdminStatusOfUser(adminStatus, userId);
    }

    public String getAllUsersExceptUserWithId(int userId) throws DatabaseException, JsonProcessingException {
        List<AdminUserDTO> users = this.userRepository.getAllUsersExceptUserWithId(userId);

        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.writeValueAsString(users);
    }
}
