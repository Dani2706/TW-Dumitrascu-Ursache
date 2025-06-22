package repository;

import dto.AdminUserDTO;
import dto.DataForJwtCreationDTO;
import dto.UserDTO;
import entity.User;
import exceptions.*;
import oracle.jdbc.proxy.annotation.Pre;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserRepository {
    DataSource dataSource;

    public UserRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void addUser(String username, String email, String password, String phoneNumber) throws EmailAlreadyInUseException, UsernameAlreadyInUseException, PhoneNumberAlreadyInUseException, DatabaseException {
        String addUser = "{call add_user(?,?,?,?)}";
        try(Connection connection = this.dataSource.getConnection();
            CallableStatement stmt = connection.prepareCall(addUser)){

            stmt.setString(1, username);
            stmt.setString(2, email);
            stmt.setString(3, password);
            stmt.setString(4, phoneNumber);

            stmt.execute();

        } catch (SQLException e) {
            if (e.getErrorCode() == 20001) {
                throw new EmailAlreadyInUseException(e.getMessage());
            }
            else if (e.getErrorCode() == 20002) {
                throw new UsernameAlreadyInUseException(e.getMessage());
            }
            else if (e.getErrorCode() == 20004) {
                throw new PhoneNumberAlreadyInUseException(e.getMessage());
            }
            else {
                throw new DatabaseException(e.getMessage());
            }
        }
    }

    public String getPasswordForUser(String username) throws SQLException, InvalidUsernameException {
        String stmtAsString = "SELECT password_hash FROM users WHERE username = ?";
        try(Connection connection = this.dataSource.getConnection();
            PreparedStatement stmt = connection.prepareStatement(stmtAsString)){
            stmt.setString(1, username);
            ResultSet result = stmt.executeQuery();
            if (!result.next()) {
                throw new InvalidUsernameException("The user with the given username (" + username + ") does not exist");
            }
            else {
                return result.getString(1);
            }
        }
    }

    public UserDTO getUserDataByUserId(int userId) throws DatabaseException, InvalidUserIdException {
        String stmtAsString = "SELECT username, email, phone_number FROM users WHERE user_id = ?";
        try(Connection connection = this.dataSource.getConnection();
            PreparedStatement stmt = connection.prepareStatement(stmtAsString)){

            stmt.setInt(1, userId);
            ResultSet result = stmt.executeQuery();

            if (!result.next()) {
                throw new InvalidUserIdException("The user with the given user_id (" + userId + ") does not exist");
            }
            else {
                return new UserDTO(result.getString(1), result.getString(2), result.getString(3));
            }
        } catch (SQLException e) {
            throw new DatabaseException(e);
        }
    }

    public int getUserIdByUsername(String username) throws InvalidUsernameException, DatabaseException {
        String stmtAsString = "SELECT user_id FROM users WHERE username = ?";
        try(Connection connection = this.dataSource.getConnection();
            PreparedStatement stmt = connection.prepareStatement(stmtAsString)){

            stmt.setString(1, username);
            ResultSet result = stmt.executeQuery();

            if (!result.next()) {
                throw new InvalidUsernameException("The user with the given username (" + username + ") does not exist");
            }
            else {
                return result.getInt("user_id");
            }
        } catch (SQLException e) {
            throw new DatabaseException(e);
        }
    }

    public void updateUser(User user) throws EmailAlreadyInUseException, UsernameAlreadyInUseException, PhoneNumberAlreadyInUseException, DatabaseException {
        String callAsString = "{call update_user(?,?,?,?)}";
        try(Connection connection = this.dataSource.getConnection();
            CallableStatement call = connection.prepareCall(callAsString)){

            call.setInt(1, user.getId());
            call.setString(2, user.getName());
            call.setString(3, user.getEmail());
            call.setString(4, user.getPhoneNumber());

            call.execute();

        } catch (SQLException e) {
            if (e.getErrorCode() == 20001) {
                throw new EmailAlreadyInUseException(e.getMessage());
            }
            else if (e.getErrorCode() == 20002) {
                throw new UsernameAlreadyInUseException(e.getMessage());
            }
            else if (e.getErrorCode() == 20004) {
                throw new PhoneNumberAlreadyInUseException(e.getMessage());
            }
            else {
                throw new DatabaseException(e.getMessage());
            }
        }
    }

    public void deleteUser(int userId) throws DatabaseException, InvalidUserIdException {
        String stmtAsString = "DELETE FROM users WHERE user_id = ?";
        try(Connection connection = this.dataSource.getConnection();
            PreparedStatement stmt = connection.prepareStatement(stmtAsString)){

            stmt.setInt(1, userId);

            int rowsAffected = stmt.executeUpdate();

            if (rowsAffected < 1) {
                throw new InvalidUserIdException("The user with the given user_id (" + userId + ") does not exist");
            }
        } catch (SQLException e) {
            throw new DatabaseException(e);
        }
    }

    public void changeAdminStatusOfUser(int adminStatus, int userId) throws DatabaseException, InvalidUserIdException {
        String stmtAsString = "UPDATE admin SET is_admin = ? WHERE user_id = ?";
        try(Connection connection = this.dataSource.getConnection();
            PreparedStatement stmt = connection.prepareStatement(stmtAsString)){

            stmt.setInt(1, adminStatus);
            stmt.setInt(2, userId);

            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected < 1) {
                throw new InvalidUserIdException("The user with the given user_id (" + userId + ") does not exist");
            }
        } catch (SQLException e){
            throw new DatabaseException(e);
        }
    }

    public DataForJwtCreationDTO getUserDataForJwtRecreationByUsername(String username) throws DatabaseException, InvalidUsernameException {
        String stmtAsString = "SELECT username, u.user_id, is_admin FROM users u JOIN admin a ON u.user_id = a.user_id WHERE username = ?";
        try(Connection connection = this.dataSource.getConnection();
            PreparedStatement stmt = connection.prepareStatement(stmtAsString)){

            stmt.setString(1, username);

            ResultSet rs = stmt.executeQuery();

            if (!rs.next()) {
                throw new InvalidUsernameException("The user with the username (" + username + ") does not exist");
            }

            return new DataForJwtCreationDTO(
                    rs.getString("username"),
                    rs.getInt("user_id"),
                    rs.getInt("is_admin")
            );
        } catch (SQLException e){
            throw new DatabaseException(e);
        }
    }

    public DataForJwtCreationDTO getUserDataForJwtRecreationByUserId(int userId) throws DatabaseException, InvalidUserIdException {
        String stmtAsString = "SELECT u.username, u.user_id, a.is_admin FROM users u JOIN admin a ON u.user_id = a.user_id WHERE u.user_id = ?";
        try(Connection connection = this.dataSource.getConnection();
            PreparedStatement stmt = connection.prepareStatement(stmtAsString)){

            stmt.setInt(1, userId);

            ResultSet rs = stmt.executeQuery();

            if (!rs.next()) {
                throw new InvalidUserIdException("The user with the username (" + userId + ") does not exist");
            }

            return new DataForJwtCreationDTO(
                    rs.getString("username"),
                    rs.getInt("user_id"),
                    rs.getInt("is_admin")
            );
        } catch (SQLException e){
            throw new DatabaseException(e);
        }
    }

    public List<AdminUserDTO> getAllUsers() throws DatabaseException {
        String stmtAsString = "SELECT username, user_id, created_at FROM users";
        try(Connection connection = this.dataSource.getConnection();
            PreparedStatement stmt = connection.prepareStatement(stmtAsString)){

            ResultSet rs = stmt.executeQuery();

            List<AdminUserDTO> users = new ArrayList<>();

            while(rs.next()){
                users.add(new AdminUserDTO(
                        rs.getString("username"),
                        rs.getInt("user_id"),
                        rs.getDate("created_at")
                        ));
            }

            return users;
        } catch (SQLException e){
            throw new DatabaseException(e);
        }
    }


//    public boolean doesUserExist(int userId) throws DatabaseException {
//        String stmtAsString = "SELECT user_id FROM users WHERE user_id = ?";
//        try(Connection connection = this.dataSource.getConnection();
//            PreparedStatement stmt = connection.prepareStatement(stmtAsString)){
//
//            stmt.setInt(1, userId);
//
//            ResultSet result = stmt.executeQuery();
//
//            return result.next();
//        } catch (SQLException e) {
//            throw new DatabaseException(e);
//        }
//    }
}
