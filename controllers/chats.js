const mongoose = require('mongoose');
const User = require('../models/usersModel');
const ChatRoom = require('../models/chatRoomModel');
const appError = require('../service/appError');

const { ObjectId } = mongoose.Types;
const idPath = '_id';

const chatController = {
  async getOpenChatRecord(req, res) {
    const queryResult = await ChatRoom.aggregate([
      { $match: { roomType: 1 } },
      {
        $project: { messages: 1, _id: 1 },
      },
      {
        $replaceRoot: {
          newRoot: { 
            messages: { $slice: ['$messages', -1] },
            id: '$_id' ,
            roomType: 1,
          },
        },
      },
    ])
    await User.populate([queryResult], {
      path: "message.sender",
      select: 'name photo'
    });
    return res.send({ status: true, chatRecord: queryResult });
    console.log('queryResult', queryResult);
  },
  async getChatRecord(req, res) {
    const queryResult = await User.aggregate([ // 以 user 的 chatRecord 撈詳細資料
      { $match: { _id: req.user[idPath] } },
      {
        $project: { chatRecord: 1 },
      },
      {
        $unwind: '$chatRecord',
      },
      {
        $lookup: {
          from: 'chatrooms',
          let: {
            roomId: '$chatRecord.roomId',
            chatRecord: '$chatRecord',
          },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$roomId'] } } },
            {
              $project: { messages: 1, _id: 0 },
            },
            {
              $replaceRoot: {
                newRoot: { message: { $slice: ['$messages', -1] } },
              },
            },
          ],
          as: 'message',
        },
      },
      {
        $lookup: {
          from: 'users',
          let: {
            receiverId: '$chatRecord.receiver',
            chatRecord: '$chatRecord',
          },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$receiverId'] } } },
            {
              $project: { photo: 1, name: 1, _id: 0 },
            },
          ],
          as: 'user',
        },
      },
      {
        $unwind: '$message',
      },
      {
        $unwind: '$user',
      },
      {
        $replaceRoot: {
          newRoot: {
            message: '$message.message',
            avatar: '$user.photo',
            name: '$user.name',
            roomId: '$chatRecord.roomId',
            roomType: 0,
          },
        },
      },
    ]);
    return res.send({ status: true, chatRecord: queryResult });
  },
  async postRoomInfo(req, res, next) {
    const sender = req.user[idPath].toString();
    const { receiver } = req.body;
    if (!receiver) {
      return next(appError(400, '未填寫聊天對象使用者id', next));
    }
    if (sender === receiver) {
      return next(appError(400, '自己不能跟自己聊天！', next));
    }
    const queryResult = await User.findById(sender).select('chatRecord'); // 取得傳送者所有在 user 裡面的房間紀錄
    const { receiver: receiverRecord, roomId } = queryResult.chatRecord.find(
      (item) => item.receiver.toString() === receiver, // 比對並回傳符合接收者的 ID 房間資訊
    ) || {};
    const receiverUser = await User.findById(receiver); // 取得接收者資訊
    if (!receiverUser) {
      return next(appError(400, '沒有這個人喔', next));
    }
    const { name, photo, _id } = receiverUser;
    // 已經有聊天記錄就直接回傳id
    let resData;
    if (receiverRecord) {
      resData = {
        status: true,
        roomId,
        name,
        avatar: photo,
        _id,
      };
    } else {
      // 沒有聊天記錄就新建房間
      const newRoom = await ChatRoom.create({
        members: [ObjectId(sender), ObjectId(receiver)],
      });
      await User.findByIdAndUpdate(sender, { // 傳送者更新 chatRecord紀錄
        $push: { chatRecord: { roomId: newRoom[idPath], receiver } },
      });
      await User.findByIdAndUpdate(receiver, { // 接收者更新 chatRecord紀錄
        $push: { chatRecord: { roomId: newRoom[idPath], receiver: sender } },
      });
      resData = {
        status: true,
        roomId: newRoom[idPath],
        name,
        avatar: photo,
        _id,
      };
    }
    return res.send(resData);
  },
  async deleteChatRecord(req, res) {
    await User.updateMany({}, { $set: { chatRecord: [] } });
    res.send({ status: true });
  },
  async deleteRoomRecord(req, res) {
    await ChatRoom.deleteMany({});
    res.send({ status: true });
  },
};

module.exports = chatController;
