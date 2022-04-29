function handleSuccess (res, data) { 
  // 使用send的優勢
  // 傳入型別來決定回傳格式
  // String => HTML <h1>Hello</h1>
  // Array or Object => JSON
  // 預設帶 res.end()
  // res.status(200) 為預設，可不寫
  res.send({
    status: true,
    data
  });
}

module.exports = handleSuccess;