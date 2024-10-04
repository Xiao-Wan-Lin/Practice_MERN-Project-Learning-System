// 通常來說在main project中，如果希望做一些功能的話
// 會把這些功能叫做一種服務(services)
// 註冊使用者、登入使用者都可以用auth-service來做
//在React中一定會用axios去傳送http request到server裡面
import axios from "axios";
const API_URL = "http://localhost:8080/api/user";

class AuthService {
  login(email, password) {
    return axios.post(API_URL + "/login", {
      email,
      password,
    });
  }

  logout() {
    localStorage.removeItem("user");
  }

  register(username, email, password, role) {
    return axios.post(API_URL + "/register", {
      username,
      email,
      password,
      role,
    });
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
}

export default new AuthService();
