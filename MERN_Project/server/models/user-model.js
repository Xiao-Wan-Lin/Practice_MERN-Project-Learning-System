const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 50,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "instructor"],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

//instance methods
userSchema.methods.isStudent = function () {
  return this.role == "student";
};

userSchema.methods.isInstructor = function () {
  return this.role == "instructor";
};

userSchema.methods.comparePassword = async function (password, cb) {
  //this.password是在userSchema(DB)裡面的雜湊密碼
  //password是使用者輸入在網頁的密碼
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    return cb(null, result);
  } catch (e) {
    //這個result是null
    return cb(e, result);
  }
};

//mongoose middlewares
//若使用者為新用戶，或是正在更改密碼，則將密碼進行雜湊處理
//要用function 而不是arrow function
//這樣才抓的到this是mongoDB的東西
userSchema.pre("save", async function (next) {
  //this代表mongoDB內的document
  //如果在mongoDB內是新的this.isNew會是true
  if (this.isNew || this.isModified("password")) {
    //將密碼進行雜湊處理
    const hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  }
  //執行next讓程式繼續往下，如果if沒有成立的話就直接往下，有成立的話就是雜湊結束後才往下
  next();
});

module.exports = mongoose.model("User", userSchema);
