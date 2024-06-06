const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bcrypt = require("bcrypt");
const cors = require("cors");
const fs = require("fs");

const port = 5000;
const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

const dbConfig = JSON.parse(fs.readFileSync("database.json"));

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error("MySQL 연결 실패:", err);
    process.exit(1);
  } else {
    console.log("MySQL 연결 성공");
    console.log(`Connected to database: ${dbConfig.database}`);
  }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const sessionStore = new MySQLStore(dbConfig);
app.use(session({
  key: "session_cookie_name",
  secret: "test1234",
  store: sessionStore,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  },
}));

app.get("/api/joins", (req, res) => {
  connection.query("SELECT * FROM joinlist", (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      return res.status(500).json({ message: "서버 오류 발생" });
    }
    res.json(results);
  });
});

app.post("/api/joins", async (req, res) => {
  const { user_id, password, email, phone } = req.body;

  if (!user_id || !password || !email || !phone) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO joinlist (user_id, password, email, phone) VALUES (?, ?, ?, ?)`;
    connection.query(query, [user_id, hashedPassword, email, phone], (error) => {
      if (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({ message: "회원가입 중 서버 오류 발생" });
      }
      res.json({ message: "회원가입 성공" });
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    return res.status(500).json({ message: "비밀번호 해싱 중 오류 발생" });
  }
});

app.post("/api/login", (req, res) => {
  const { user_id, password } = req.body;
  const sendData = { isLogin: "" };

  if (user_id && password) {
    connection.query("SELECT * FROM joinlist WHERE user_id = ?", [user_id], (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({ message: "서버 오류 발생" });
      }

      if (results.length > 0) {
        bcrypt.compare(password, results[0].password, (err, result) => {
          if (result === true) {
            req.session.is_logined = true;
            req.session.user_id = user_id;
            req.session.save(() => {
              sendData.isLogin = "True";
              res.json(sendData);
            });

            connection.query(`INSERT INTO userlist (user_id) VALUES (?)`, [user_id], (error) => {
              if (error) throw error;
              console.log("New user added to userlist table");
            });
          } else {
            sendData.isLogin = "로그인 정보가 일치하지 않습니다.";
            res.json(sendData);
          }
        });
      } else {
        sendData.isLogin = "아이디 정보가 일치하지 않습니다.";
        res.json(sendData);
      }
    });
  } else {
    sendData.isLogin = "아이디와 비밀번호를 입력하세요!";
    res.json(sendData);
  }
});

app.get("/api/authcheck", (req, res) => {
  if (req.session.is_logined) {
    res.json({ isLogin: true, user_id: req.session.user_id });
  } else {
    res.json({ isLogin: false });
  }
});

app.get("/api/logout", (req, res) => {
  const user_id = req.session.user_id;
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "로그아웃 중 오류 발생" });
    }

    connection.query(`DELETE FROM userlist WHERE user_id = ?`, [user_id], (error) => {
      if (error) {
        console.error("Error deleting user from userlist:", error);
      } else {
        console.log("User removed from userlist table");
      }
    });

    res.json({ message: "로그아웃 성공" });
  });
});

app.get("/api/checkUserExists", (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  const query = `SELECT COUNT(*) AS count FROM joinlist WHERE user_id = ?`;
  connection.query(query, [user_id], (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      return res.status(500).json({ message: "서버 오류 발생" });
    }
    const count = results[0].count;
    const exists = count > 0;
    res.json({ exists });
  });
});

// ------------------------------------------------------------------------------------------------------------------

app.post("/api/reservation", (req, res) => {
  const { movie_name, ticket_count, user_id } = req.body;

  // joinlist 테이블에 해당 user_id가 있는지 확인
  const checkQuery = `SELECT * FROM joinlist WHERE user_id = ?`;
  connection.query(checkQuery, [user_id], (error, results) => {
    if (error) {
      console.error("Error checking existing user:", error);
      return res.status(500).json({ message: "예매 실패" });
    }

    // 해당 user_id가 joinlist 테이블에 존재하는 경우
    if (results.length > 0) {
      // 티켓 예매 처리
      const reservationQuery = `INSERT INTO Reservation (user_id, movie_name, ticket_count, reservation_date) VALUES (?, ?, ?, NOW())`;
      connection.query(reservationQuery, [user_id, movie_name, ticket_count], (error) => {
        if (error) {
          console.error("Error reserving tickets:", error);
          return res.status(500).json({ message: "예매 실패" });
        }

        // joinlist 테이블에 예약 정보 업데이트
        const updateQuery = `UPDATE joinlist SET total_tickets = total_tickets + ?, movie_name = ? WHERE user_id = ?`;
        connection.query(updateQuery, [ticket_count, movie_name, user_id], (error) => {
          if (error) {
            console.error("Error updating joinlist:", error);
            return res.status(500).json({ message: "예매 실패" });
          }

          res.status(200).json({ message: "예매 성공" });
        });
      });
    } else { // 해당 user_id가 joinlist 테이블에 존재하지 않는 경우
      res.status(400).json({ message: "예매를 위해서는 먼저 회원가입을 해주세요." });
    }
  });
});



// 예매 취소 처리
app.delete("/api/cancel", (req, res) => {
  const { movie_name, ticket_count, user_id } = req.body;

  // 취소할 티켓 수가 1~3개 사이인지 확인
  if (ticket_count < 1 || ticket_count > 3) {
    return res.status(400).json({ message: "취소는 최소 1개에서 최대 3개까지 가능합니다." });
  }

  // joinlist 테이블에 해당 user_id가 있는지 확인
  const checkQuery = `SELECT * FROM joinlist WHERE user_id = ? AND movie_name = ?`;
  connection.query(checkQuery, [user_id, movie_name], (error, results) => {
    if (error) {
      console.error("Error checking user in joinlist:", error);
      return res.status(500).json({ message: "취소 실패" });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "해당 사용자는 이 영화에 대한 예매 기록이 없습니다." });
    }

    const currentTickets = results[0].total_tickets;

    if (currentTickets < ticket_count) {
      return res.status(400).json({ message: "취소할 티켓 수가 예매된 티켓 수보다 많습니다." });
    }

    // 시작 트랜잭션
    connection.beginTransaction((err) => {
      if (err) {
        console.error("트랜잭션 시작 오류:", err);
        return res.status(500).json({ message: "취소 실패" });
      }

      // Cancellation 테이블에 취소 정보 삽입
      const cancelQuery = `INSERT INTO Cancellation (user_id, movie_name, ticket_count, cancellation_date) VALUES (?, ?, ?, NOW())`;
      connection.query(cancelQuery, [user_id, movie_name, ticket_count], (insertError) => {
        if (insertError) {
          console.error("Error inserting into Cancellation:", insertError);
          return connection.rollback(() => {
            res.status(500).json({ message: "취소 실패" });
          });
        }

        // joinlist 테이블에 취소 정보 업데이트
        const updateQuery = `UPDATE joinlist SET total_tickets = total_tickets - ? WHERE user_id = ? AND movie_name = ?`;
        connection.query(updateQuery, [ticket_count, user_id, movie_name], (updateError) => {
          if (updateError) {
            console.error("Error updating joinlist:", updateError);
            return connection.rollback(() => {
              res.status(500).json({ message: "취소 실패" });
            });
          }

          // 영화 정보 삭제 (티켓이 0개인 경우)
          const deleteQuery = `DELETE FROM joinlist WHERE total_tickets = 0 AND user_id = ? AND movie_name = ?`;
          connection.query(deleteQuery, [user_id, movie_name], (deleteError) => {
            if (deleteError) {
              console.error("Error deleting movie info from joinlist:", deleteError);
              return connection.rollback(() => {
                res.status(500).json({ message: "취소 실패" });
              });
            }

            // 커밋 트랜잭션
            connection.commit((commitError) => {
              if (commitError) {
                console.error("트랜잭션 커밋 오류:", commitError);
                return connection.rollback(() => {
                  res.status(500).json({ message: "취소 실패" });
                });
              }

              res.status(200).json({ message: "취소 성공" });
            });
          });
        });
      });
    });
  });
});

app.get("/api/remainingtickets", (req, res) => {
  const { movie_name } = req.query;

  const query = `
    SELECT 100 - IFNULL(SUM(total_tickets), 0) AS remaining_tickets 
    FROM joinlist 
    WHERE movie_name = ?`;

  connection.query(query, [movie_name], (error, results) => {
    if (error) {
      console.error("남은 티켓 수 요청 오류:", error);
      return res.status(500).json({ message: "남은 티켓 수를 가져오는 중 오류가 발생했습니다." });
    }
    res.status(200).json({ remaining_tickets: results[0].remaining_tickets });
  });
});



// GET /api/usertickets 엔드포인트: 사용자가 예매한 티켓 수 가져오기
app.get("/api/usertickets", (req, res) => {
  const user_id = req.query.user_id;

  if (!user_id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const query = `SELECT total_tickets FROM joinlist WHERE user_id = ?`;
  connection.query(query, [user_id], (error, results) => {
    if (error) {
      console.error("Error fetching user tickets:", error);
      return res.status(500).json({ message: "서버 오류 발생" });
    }

    if (results.length > 0) {
      const total_tickets = results[0].total_tickets;
      res.json({ total_tickets });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });
});


//-------------------------------------------------------------------------------------------------------


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
