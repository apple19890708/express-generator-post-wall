const mongoose = require('mongoose');
const { Server } = require("socket.io");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config({ path: '../config.env' });
const ChatRoom = require('../models/chatRoomModel');
const User = require('../models/usersModel');

const console = require('./console');
const { ObjectId } = mongoose.Types;
module.exports = (server) => {
	const idPath = '_id';
  // 宣告 new Server 進行操作
	const io = new Server(server, {
		path: '/socket.io/',
    cors: {
      origin: "*",
    },
  });


	// 驗證token
	io.use(async (socket, next) => {
		const token = socket.handshake.auth.token;
		if (!token) {
			return next(new Error('請重新登入'));
		};

		const decodedData = await new Promise((res, rej) => {
			jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
				if (error) {
					reject(next(new Error('請重新登入')));
				} else {
					resolve(payload);
				}
			});
		});

		socket.decoded = decodedData;

		return next();

	});

  // 解碼 JWT 後取得使用者 ID
	const getUserId = async (token) => {
    const decodedToken = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
        if (error) {
          reject(error);
        } else {
          resolve(payload);
        }
      });
    });
    const currentUser = await User.findById(decodedToken.id);
    return currentUser._id;
  };

	const getHistory = async (room, lastTime) => {
    let msgList = [];
    if (lastTime) {
      const [queryResult] = await ChatRoom.aggregate([
        { $match: { $expr: { $eq: ['$_id', { $toObjectId: room }] } } },
        {
          $project: {
            messages: 1,
          },
        },
        {
          $project: {
            messages: {
              $slice: [
                {
                  $filter: {
                    input: '$messages',
                    as: 'item',
                    cond: {
                      $lt: ['$$item.createdAt', new Date(lastTime)], // 取得時間小於 lastTime 的 30筆資料
                    },
                  },
                },
                30,
              ],
            },
          },
        },
        // {
        //   $lookup: {
        //       from: "users",
        //       localField: "messages.sender",
        //       foreignField: "_id",
        //       as: "patient_doc"
        //   }
        // }
      ]);
      await User.populate([queryResult], { // call populate with the aggregation result returned from aggergate
        path: "messages.sender",
        select: 'name photo'
      });
      console.log('queryResult', queryResult)
      msgList = queryResult.messages;
    } else {
      msgList = await ChatRoom.find(
        { _id: room },
        { messages: { $slice: -30 } },
      ).populate({
				path: 'messages.sender',
				select: 'name photo'
	    });
      msgList = msgList[0].messages;
    }
    console.log('msgList', msgList)
    return msgList;
  };

	// 建立連接
	io.of('/chat').on("connection", async (socket) => {
		// client端在建立連接時帶的參數
		const room = socket.handshake.query.room;
    const token = socket.handshake.auth.token;
		let userId = await getUserId(token);
		userId = userId.toString();
		console.log('connection----', room);
    const queryRoomMembersResult = await ChatRoom.findById(room).select('members'); // 查詢房間成員
    const isInChatRoom = queryRoomMembersResult.members.some( 
      (item) => {
        return item.toString() === userId
      } 
    );
    const UserName = await User.findById(userId).select("name")
    if(!isInChatRoom) {
      const createdAt = Date.now();
      socket.emit('joinRoomMessage', UserName);
      await ChatRoom.findByIdAndUpdate(room, {
        $push: { members: ObjectId(userId) },
      });
     
    }
    if (room) { // 連線成功後即將使用者加入房間
      socket.join(room);
      const createdAt = Date.now();
      if (!isInChatRoom) {
        await ChatRoom.findByIdAndUpdate(room, {
          $push: { messages: { sender: ObjectId('63048cc67c20701d55af0f2b'), message: `歡迎，${UserName.name} 加入聊天室`, createdAt } },
        });
      }
    }
    const msgList = await getHistory(room);
    socket.emit('history', msgList); // 連線成功後先打一次歷史訊息給前端
    socket.use(([payload], next) => {
      console.log('payloads', payload);
      if (payload?.message?.length > 100) {
        return next(new Error('您輸入的內容過長'));
      }
      return next();
    });

		// 監聽 client發來的訊息
		socket.on('chatMessage', async (msg) => {
      const { message } = msg;
      const createdAt = Date.now();
      await ChatRoom.findByIdAndUpdate(room, {
        $push: { messages: { sender: userId, message, createdAt } },
      });
      const currentUser = await User.findById(userId);
      // 針對該房間廣播訊息
      io.of('/chat')
        .to(room)
        .emit('chatMessage', { message, sender: {_id: userId, photo: currentUser.photo, name: currentUser.name }, createdAt });
    });

		// 使用者輸入中
    socket.on('typing', (boolean) => {
      socket.broadcast.in(room).emit('typing', boolean);
    });

		// 歷史訊息
    socket.on('history', async (info) => {
      const { lastTime } = info;
      const historyMsgList = await getHistory(room, lastTime);
      socket.emit('history', historyMsgList);
    });

		socket.on('leaveRoom', (currentRoom) => {
      console.log('leaveRoom~~~', currentRoom);
      socket.leave(currentRoom);
    });

		// 接收錯誤, 並且通知client端
    socket.on('error', (err) => {
      socket.emit('error', err.message);
    });
    // 斷開連接
    socket.on('disconnect', (currentSocket) => {
      console.log('socket-disconnect', currentSocket);
    });
	});

	io.of('/chat').on('connect_error', (err) => {
		console.log(`connect_error due to ${err.message}`);
	});

	return io;

}
