import express from "express";
import cors from "cors";
import mysql from "mysql2";
import {v4 as uuid} from "uuid";
import jwt from "jsonwebtoken";
import {Server} from "socket.io";
import http from "http";
import dotenv from "dotenv";
dotenv.config();
const connection=mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE
});
const app=express();
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:"*"}});
const port=process.env.PORT;
server.listen(port,"0.0.0.0",()=>console.log("Listening"));
app.use(cors());
app.use(express.json()); 
connection.connect(err=>{
    if(err){
        console.log(err); 
    }else{
        console.log("Database connected successfully");
    } 
});
function authMiddleware(req,res,next) {
    try {
        const token = req.headers.authorization;
        const payload = jwt.verify(token,process.env.JWT_SECRET_KEY);
        req.user = payload;
        next();
    } catch (err) {
        console.log("Request caught by middleware");
        return res.status(401).json({ error: "Unauthorized" });
    }
}
app.post("/users/signup",(req,res)=>{
    const {username,password}=req.body;
    connection.query("INSERT INTO users(userid,username,password) VALUES (?,?,?)",[uuid(),username,password],(err,result)=>{
        if(err){
            res.send("Username Already Exist");
        }
        else{
            res.send("Success");
        }
    });
});

app.post("/users/login",(req,res)=>{
    const {username,password}=req.body;
    connection.query("SELECT * FROM users WHERE username=?",[username],(err,result)=>{
        if(err){
            res.json({status:""});
        }
        else if(result.length===0){
            res.json({field:"username",status:"Username Not Exists"});
        }else if(result[0].password!==password){
            res.json({field:"password",status:"Password Incorrect"});
        }else{
            const user=result[0];
            const token=jwt.sign({
                userid:user.userid,
                username:user.username
            },
            process.env.JWT_SECRET_KEY
        );
        console.log(token);
            res.json({status:"Success",token});
        }
    })
});

app.use(authMiddleware);

app.get("/users/me",(req,res)=>{
    console.log("Request for knowing username received");
    res.json({username:req.user.username});
});

app.get("/users/:user",(req,res)=>{
    const {user}=req.params;
    connection.query("SELECT username FROM users WHERE username=?",[user],(err,result)=>{
        if(err || result.length===0){
             res.json({username:""});
             return;
        }
        res.json(result[0]);
    });
});

app.post("/users/request/",(req,res)=>{
    const {sender,receiver}=req.body;
    connection.query("SELECT status FROM userrelations WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)",[sender,receiver,receiver,sender],(err,result)=>{
        if(err){
            res.json({status:"Error"});
            return;
        }
        if(result.length>0){
            res.json({status:"Request Already Sent Before"});
            return;
        }else{
            connection.query("INSERT INTO userrelations VALUES (?,?,?,?)",[uuid(),sender,receiver,"pending"],(Err,Result)=>{
            if(Err) res.json({status:"Error"});
            else res.json({status:"Success"});
            });
        }
    });
});

app.post("/users/requests/pending/user2",(req,res)=>{
    const {user}=req.body;
    console.log(user);
    connection.query("SELECT user1 FROM userrelations WHERE user2=? AND status=?",[user,"pending"],(err,result)=>{
        if(err){
            res.json({status:"Error"});
            console.log("Error");
            return;
        }
        console.log(result);
        res.send(result);
    });
});

app.post("/users/requests/pending/user1",(req,res)=>{
    const {user}=req.body;
    console.log(user);
    connection.query("SELECT user2 FROM userrelations WHERE user1=? AND status=?",[user,"pending"],(err,result)=>{
        if(err){
            res.json({status:"Error"});
            console.log("Error");
            return;
        }
        console.log(result);
        res.send(result);
    });
});

app.post("/users/requests/accept",(req,res)=>{
    const {sender,acceptor}=req.body;
    connection.query("UPDATE userrelations SET status=? WHERE user1=? AND user2=?",["accepted",sender,acceptor],(err,result)=>{
        if(err){
            res.json({status:"Error"});
            return;
        }
        res.json({status:"Success"});
    });
});

app.post("/users/requests/reject",(req,res)=>{
    const {sender,rejector}=req.body;
    connection.query("DELETE FROM userrelations WHERE user1=? AND user2=?",[sender,rejector],(err,result)=>{
        if(err){
            res.json({status:"Error"});
            return;
        }
        res.json({status:"Success"});
    });
});

app.get("/users/friends/display",(req,res)=>{
    const username=req.user.username;
    console.log(username);
    connection.query(`SELECT user1 AS friend FROM userrelations WHERE user2=? AND status='accepted' UNION SELECT user2 AS friend FROM userrelations WHERE user1=? AND status='accepted'`,[username,username],(err,result)=>{
            if(err){
                console.log("error in querying");
                res.json({status:"Error"});
                return;
            }
            console.log(result);
            res.send(result);
        });
});

app.get("/users/get/messages/:opp",(req,res)=>{
    const {opp}=req.params;
    const curruser=req.user.username;
    console.log("request received");
    connection.query("SELECT sender AS \`from\`,message AS msg,timestamp FROM messages WHERE (sender=? AND receiver=?) OR (sender=? AND receiver=?) ORDER BY timestamp ASC",
        [curruser,opp,opp,curruser],
        (err,result)=>{
            if(err){
                res.json([]);
                return;
            }
            res.json(result);
        }
    );
});
io.use((socket,next)=>{
    const payload=jwt.verify(socket.handshake.auth.token,process.env.JWT_SECRET_KEY);
    socket.username=payload.username;
    next();
});

io.on("connection",socket=>{
    const username=socket.username;
    socket.join(username);
    socket.on("private-message",({to,msg})=>{
        connection.query("INSERT INTO messages(id,sender,receiver,message) VALUES(?,?,?,?)",[uuid(),socket.username,to,msg],(err,result)=>{
        if(err){
            console.log(err);
            return; 
        }
        console.log("Message stored in database successfully");
       });
       const completeMsg={
        from:socket.username,
        msg,
        timestamp:new Date()
       }
       console.log(completeMsg);
       io.to(to).emit("private-message",completeMsg);
       io.to(socket.username).emit("private-message",completeMsg);
    });
});
