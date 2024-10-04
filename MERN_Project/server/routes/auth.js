//跟認證有關的都會用這個路由來處理
const router = require("express").Router();
const regisetrValidation = require("../validation").regisetrValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models").user;
const jwt = require("jsonwebtoken");

//這個middleware的目的是要讓我們知道有收到一個跟auth有關的請求
router.use((req, res, next) => {
  console.log("正在接一個跟auth有關的請求");
  next();
});

router.get("/testAPI", (req, res) => {
  return res.send("成功連結auth route...");
});

router.post("/register", async (req, res) => {
  //確認註冊數據是否符合規範
  console.log("註冊使用者...");
  let { error } = regisetrValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //確認信箱是否被註冊過
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("此信箱已經被註冊過了");

  //製作新用戶
  let { email, username, password, role } = req.body;
  let newUser = new User({ email, username, password, role });
  try {
    let savedUser = await newUser.save();
    return res.send({
      msg: "使用者成功儲存",
      savedUser,
    });
  } catch (e) {
    return res.status(500).send("無法儲存使用者");
  }
});

router.post("/login", async (req, res) => {
  let { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) {
    return res.status(401).send("無法找到使用者");
  }

  foundUser.comparePassword(req.body.password, (err, isMatch) => {
    //這裡的error是user-model中的bcrypt執行有問題，所以是送500
    if (err) return res.status(500).send(err);
    if (isMatch) {
      //isMatch是true的話，代表密碼compare成功，製作json web token
      const tokenObject = { _id: foundUser._id, email: foundUser.email };
      //用JWT做簽名
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      return res.send({
        message: "成功登入",
        //JET後面一定要有空白建，不然會有BUG
        token: "JWT " + token,
        user: foundUser,
      });
    } else {
      return res.status(401).send("密碼錯誤請重新輸入");
    }
  });
});

module.exports = router;
