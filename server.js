const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// serve index.html from same directory
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

// ====== GAME DATA ======
const CATEGORIES = {
  สถานที่: [
    { name: "ร้านอาหาร",       roles: ["พ่อครัว","เชฟ","บริกร","แคชเชียร์","ผู้จัดการ","ลูกค้า","นักชิม"] },
    { name: "โรงพยาบาล",       roles: ["แพทย์","พยาบาล","คนไข้","เภสัชกร","แม่บ้าน","ผู้เยี่ยม","นักศึกษาแพทย์"] },
    { name: "สนามบิน",         roles: ["นักบิน","แอร์โฮสเตส","ผู้โดยสาร","เจ้าหน้าที่รักษาความปลอดภัย","พนักงานเคาน์เตอร์","คนขับรถลาก","ช่างบำรุง"] },
    { name: "โรงเรียน",        roles: ["ครู","นักเรียน","ผู้อำนวยการ","แม่บ้าน","ยาม","พ่อแม่นักเรียน","นักการ"] },
    { name: "ชายหาด",          roles: ["นักท่องเที่ยว","ไลฟ์การ์ด","คนขายของ","นักดำน้ำ","ช่างภาพ","เด็กเล่นทราย","เจ้าหน้าที่กู้ภัย"] },
    { name: "สวนสัตว์",        roles: ["ผู้เลี้ยงสัตว์","สัตวแพทย์","ผู้เยี่ยมชม","ไกด์นำเที่ยว","ช่างภาพ","ยาม","นักชีววิทยา"] },
    { name: "ธนาคาร",          roles: ["พนักงานเคาน์เตอร์","ผู้จัดการ","ลูกค้า","เจ้าหน้าที่รักษาความปลอดภัย","นักบัญชี","โจร","พนักงานสินเชื่อ"] },
    { name: "ห้างสรรพสินค้า",  roles: ["พนักงานขาย","ลูกค้า","ยาม","ผู้จัดการ","แม่บ้าน","พนักงานส่งของ","นักช็อป"] },
    { name: "สถานีตำรวจ",      roles: ["นักสืบ","ผู้ต้องสงสัย","ตำรวจ","ทนายความ","ผู้เสียหาย","พยาน","ผู้ต้องขัง"] },
    { name: "ยานอวกาศ",        roles: ["กัปตัน","วิศวกร","นักวิทยาศาสตร์","หุ่นยนต์","นักบิน","ผู้โดยสาร","นักสื่อสาร"] },
    { name: "คาสิโน",          roles: ["ดีลเลอร์","ผู้เล่น","ยาม","ผู้จัดการ","บาร์เทนเดอร์","พนักงานเสิร์ฟ","นักนับไพ่"] },
    { name: "พิพิธภัณฑ์",      roles: ["ไกด์นำชม","ผู้เยี่ยมชม","ภัณฑารักษ์","เจ้าหน้าที่รักษาความปลอดภัย","นักวิชาการ","ช่างภาพ","นักบูรณะ"] },
    { name: "สนามฟุตบอล",      roles: ["นักฟุตบอล","โค้ช","ผู้ตัดสิน","แฟนบอล","ผู้ประกาศ","ช่างภาพ","แพทย์ทีม"] },
    { name: "ร้านเสริมสวย",    roles: ["ช่างทำผม","ลูกค้า","เจ้าของร้าน","ช่างเล็บ","พนักงานล้างหัว","นักศึกษาฝึกงาน","แม่บ้าน"] },
    { name: "ค่ายทหาร",        roles: ["ทหาร","นายพล","พลทหาร","นักสื่อข่าว","ช่างอาวุธ","แพทย์ทหาร","ผู้บัญชาการ"] },
  ],
  อาหาร: [
    { name: "ข้าวผัด",         roles: ["ไข่","ข้าว","หอมหัวใหญ่","น้ำมัน","ซีอิ๊ว","กระเทียม","พริก"] },
    { name: "ต้มยำกุ้ง",       roles: ["กุ้ง","ข่า","ตะไคร้","ใบมะกรูด","พริก","เห็ด","มะนาว"] },
    { name: "ผัดไทย",          roles: ["เส้นจันท์","กุ้ง","เต้าหู้","ไข่","ถั่วงอก","ต้นหอม","ถั่วลิสง"] },
    { name: "ส้มตำ",           roles: ["มะละกอ","พริก","กระเทียม","มะเขือเทศ","ถั่วฝักยาว","กุ้งแห้ง","น้ำปลา"] },
    { name: "แกงเขียวหวาน",    roles: ["เนื้อไก่","กะทิ","พริกแกง","มะเขือ","ใบโหระพา","น้ำปลา","น้ำตาลปี๊บ"] },
    { name: "ข้าวมันไก่",      roles: ["ไก่","ข้าว","น้ำซุป","ซอสพริก","ซอสขิง","แตงกวา","ผักชี"] },
    { name: "ราดหน้า",         roles: ["เส้นใหญ่","หมู","ไข่","ผักคะน้า","ซอสหอยนางรม","แป้ง","น้ำมัน"] },
    { name: "ไอศกรีม",         roles: ["ครีม","น้ำตาล","ไข่แดง","นม","วานิลลา","เกลือ","น้ำแข็ง"] },
    { name: "พิซซ่า",          roles: ["แป้ง","ซอสมะเขือเทศ","ชีส","เห็ด","ไส้กรอก","มะกอก","พริกหยวก"] },
    { name: "ราเมน",           roles: ["เส้น","น้ำซุป","ชาชู","ไข่ออนเซ็น","หน่อไม้","โนริ","ต้นหอม"] },
  ],
  ผลไม้: [
    { name: "แตงโม",           roles: ["เนื้อแดง","เปลือกเขียว","เมล็ด","น้ำ","น้ำตาล","ใยอาหาร","วิตามินซี"] },
    { name: "มะม่วง",          roles: ["เนื้อเหลือง","เปลือก","เมล็ด","น้ำมะม่วง","กลิ่นหอม","วิตามินเอ","ใย"] },
    { name: "กล้วย",           roles: ["เนื้อขาว","เปลือกเหลือง","ก้าน","แป้ง","โพแทสเซียม","น้ำตาล","ใยอาหาร"] },
    { name: "ส้ม",             roles: ["เนื้อส้ม","เปลือก","เมล็ด","น้ำส้ม","วิตามินซี","กลีบ","กลิ่นหอม"] },
    { name: "สตรอว์เบอร์รี",   roles: ["เนื้อแดง","เมล็ดเล็ก","ก้าน","ใบ","น้ำ","วิตามินซี","กลิ่นหอม"] },
    { name: "องุ่น",           roles: ["เนื้อ","เปลือก","เมล็ด","น้ำองุ่น","น้ำตาล","กิ่ง","แอนโทไซยานิน"] },
    { name: "สับปะรด",         roles: ["เนื้อเหลือง","เปลือกขรุขระ","แกน","ใบยอด","น้ำ","โบรเมเลน","น้ำตาล"] },
    { name: "ลิ้นจี่",         roles: ["เนื้อขาว","เปลือกแดง","เมล็ด","น้ำ","กลิ่นหอม","น้ำตาล","วิตามินซี"] },
    { name: "ทุเรียน",         roles: ["เนื้อเหลือง","เปลือกหนาม","เมล็ด","กลิ่นแรง","น้ำตาล","ไขมัน","โพแทสเซียม"] },
    { name: "มังคุด",          roles: ["เนื้อขาว","เปลือกม่วง","เมล็ด","น้ำ","ซันโทน","น้ำตาล","กลิ่นหอม"] },
  ],
  สัตว์: [
    { name: "สิงโต",           roles: ["กรงเล็บ","แผงคอ","ฟัน","หาง","ขน","เสียงคำราม","ตา"] },
    { name: "ช้าง",            roles: ["งวง","งา","หู","ขา","หนัง","หาง","ตา"] },
    { name: "ฉลาม",            roles: ["ฟัน","ครีบ","หาง","ผิวหนัง","ตา","เหงือก","กรามล่าง"] },
    { name: "นกแก้ว",          roles: ["ปาก","ปีก","ขน","ตีน","หาง","ตา","เสียง"] },
    { name: "แมว",             roles: ["หนวด","กรงเล็บ","หู","หาง","ขน","ตา","เสียงร้อง"] },
    { name: "กอริลลา",         roles: ["มือ","หน้าอก","หน้าผาก","ขน","แขน","ฟัน","ตา"] },
    { name: "จระเข้",          roles: ["ฟัน","หาง","เกล็ด","ขา","ตา","ปาก","กรามบน"] },
    { name: "นกอินทรี",        roles: ["จะงอยปาก","กรงเล็บ","ปีก","ขน","หาง","ตา","ขา"] },
    { name: "หมาป่า",          roles: ["เขี้ยว","ขน","หาง","หู","ตา","อุ้งเท้า","เสียงหอน"] },
    { name: "กบ",              roles: ["ขาหลัง","ผิวหนัง","ตา","ปาก","ลิ้น","ปอด","เสียงร้อง"] },
  ],
  สิ่งของ: [
    { name: "โทรศัพท์",        roles: ["หน้าจอ","แบตเตอรี่","กล้อง","ลำโพง","ปุ่มเปิดปิด","ซิมการ์ด","ชาร์จเจอร์"] },
    { name: "รถยนต์",          roles: ["เครื่องยนต์","พวงมาลัย","ยาง","เบรก","กระจก","เบาะ","กุญแจ"] },
    { name: "คอมพิวเตอร์",     roles: ["หน่วยประมวลผล","แรม","ฮาร์ดดิสก์","จอภาพ","คีย์บอร์ด","เมาส์","พัดลม"] },
    { name: "ร่ม",             roles: ["ผ้า","โครง","ด้ามจับ","ปุ่มเปิด","ปลายแหลม","ซี่","ผ้าคลุม"] },
    { name: "ตู้เย็น",         roles: ["ช่องแช่แข็ง","ช่องแช่เย็น","มอเตอร์","ประตู","ชั้นวาง","แผงควบคุม","น้ำแข็ง"] },
    { name: "กีตาร์",          roles: ["สาย","คอ","ตัวกีตาร์","รู","ลูกบิด","เฟรต","บริดจ์"] },
    { name: "กล้องถ่ายรูป",    roles: ["เลนส์","ชัตเตอร์","ฟิล์ม","แฟลช","ตัวกล้อง","แบตเตอรี่","ช่องมองภาพ"] },
    { name: "จักรยาน",         roles: ["ล้อ","โซ่","แฮนด์","เบรก","อาน","เฟือง","กระโดง"] },
    { name: "หนังสือ",         roles: ["ปก","กระดาษ","หมึก","สันปก","หน้าแรก","บทที่","ดัชนี"] },
    { name: "นาฬิกา",          roles: ["เข็มชั่วโมง","เข็มนาที","หน้าปัด","สาย","กลไก","แบตเตอรี่","กระจก"] },
  ],
  อาชีพ: [
    { name: "หมอ",             roles: ["เสื้อกาวน์","สเตทโทสโคป","ใบประกอบโรคศิลป์","ยา","เข็มฉีดยา","แฟ้มคนไข้","ถุงมือ"] },
    { name: "ตำรวจ",           roles: ["ปืน","กุญแจมือ","หมวก","วิทยุสื่อสาร","รองเท้า","บัตรตำรวจ","กระบอง"] },
    { name: "ครู",             roles: ["กระดาน","ชอล์ก","ไม้บรรทัด","หนังสือ","ปากกาแดง","แผนการสอน","โต๊ะครู"] },
    { name: "เชฟ",             roles: ["มีด","เขียง","ผ้ากันเปื้อน","หมวกทำอาหาร","กระทะ","ไฟ","เครื่องปรุง"] },
    { name: "นักกีฬา",         roles: ["รองเท้า","ชุดกีฬา","ลูกบอล","นกหวีด","สนาม","โค้ช","ถ้วยรางวัล"] },
    { name: "นักดนตรี",        roles: ["เครื่องดนตรี","โน้ต","สายไมค์","แอมป์","ฝ่ามือ","ผู้ชม","เวที"] },
    { name: "นักบิน",          roles: ["ห้องนักบิน","จอเรดาร์","คันบังคับ","ชุดนักบิน","หมวก","แผนที่บิน","วิทยุ"] },
    { name: "สถาปนิก",         roles: ["แบบแปลน","ไม้ที","ดินสอ","คอมพิวเตอร์","โมเดล","หมวกนิรภัย","สเกล"] },
    { name: "นักแสดง",         roles: ["บท","ชุดแต่งกาย","แสง","เวที","กล้อง","ผู้กำกับ","แป้งผัดหน้า"] },
    { name: "โปรแกรมเมอร์",    roles: ["คอมพิวเตอร์","คีย์บอร์ด","โค้ด","บั๊ก","กาแฟ","จอหลายจอ","หูฟัง"] },
  ],
};

const ALL_NAMES = Object.values(CATEGORIES).flat().map(l => l.name);

// ====== HELPERS ======
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ====== ROOMS ======
const rooms = {};

function getRoomPublic(room) {
  return {
    code: room.code,
    phase: room.phase,
    categories: room.categories,
    players: room.players.map(p => ({
      id: p.id, name: p.name, isHost: p.isHost, connected: p.connected,
      voted: room.votes && room.votes[p.id] !== undefined,
    })),
    location: room.phase === "result" ? room.location : undefined,
    timer: room.timer,
    timerRunning: room.timerRunning,
    result: room.result,
    spyGuessSubmitted: room.spyGuessSubmitted,
    spyGuessCorrect: room.spyGuessCorrect,
  };
}

function broadcastRoom(room) {
  room.players.forEach(p => {
    const sock = io.sockets.sockets.get(p.id);
    if (!sock) return;
    const pub = getRoomPublic(room);
    pub.myAssignment = (room.phase === "playing" || room.phase === "vote" || room.phase === "result")
      ? p.assignment : null;
    sock.emit("room_update", pub);
  });
}

// ====== SOCKET ======
io.on("connection", socket => {
  socket.on("create_room", ({ name, categories }) => {
    let code;
    do { code = generateCode(); } while (rooms[code]);
    // validate categories
    const validCats = (categories || []).filter(c => CATEGORIES[c]);
    const usedCats = validCats.length > 0 ? validCats : Object.keys(CATEGORIES);
    const room = {
      code, phase: "lobby",
      categories: usedCats,
      players: [{ id: socket.id, name: name.trim().slice(0, 16), isHost: true, connected: true, assignment: null }],
      location: null, timer: 480, timerRunning: false, timerInterval: null,
      votes: {}, result: null, spyGuessSubmitted: false, spyGuessCorrect: null,
    };
    rooms[code] = room;
    socket.join(code);
    socket.data.roomCode = code;
    socket.emit("joined", { code, playerId: socket.id });
    broadcastRoom(room);
  });

  socket.on("join_room", ({ code, name }) => {
    const room = rooms[code.toUpperCase()];
    if (!room) return socket.emit("error", "ไม่พบห้องนี้");
    if (room.phase !== "lobby") return socket.emit("error", "เกมเริ่มไปแล้ว");
    if (room.players.length >= 10) return socket.emit("error", "ห้องเต็มแล้ว (สูงสุด 10 คน)");
    room.players.push({ id: socket.id, name: name.trim().slice(0, 16), isHost: false, connected: true, assignment: null });
    socket.join(code.toUpperCase());
    socket.data.roomCode = code.toUpperCase();
    socket.emit("joined", { code: code.toUpperCase(), playerId: socket.id });
    broadcastRoom(room);
  });

  socket.on("start_game", () => {
    const room = rooms[socket.data.roomCode];
    if (!room || !room.players.find(p => p.id === socket.id)?.isHost) return;
    if (room.players.length < 3) return socket.emit("error", "ต้องการผู้เล่นอย่างน้อย 3 คน");

    // pick random location from selected categories
    const pool = Object.entries(CATEGORIES)
      .filter(([cat]) => room.categories.includes(cat))
      .flatMap(([, locs]) => locs);
    const location = pool[Math.floor(Math.random() * pool.length)];

    const shuffled = shuffle(room.players);
    const spyIdx = Math.floor(Math.random() * shuffled.length);
    const roles = shuffle(location.roles);
    shuffled.forEach((p, i) => {
      p.assignment = { isSpy: i === spyIdx, role: i === spyIdx ? null : roles[i % roles.length], locationName: i === spyIdx ? null : location.name };
    });

    room.location = location;
    room.phase = "playing";
    room.timer = 480;
    room.timerRunning = true;
    room.votes = {};
    room.result = null;
    room.spyGuessSubmitted = false;
    room.spyGuessCorrect = null;

    clearInterval(room.timerInterval);
    room.timerInterval = setInterval(() => {
      if (!room.timerRunning) return;
      room.timer--;
      io.to(room.code).emit("timer_tick", { timer: room.timer, timerRunning: room.timerRunning });
      if (room.timer <= 0) { clearInterval(room.timerInterval); room.timerRunning = false; io.to(room.code).emit("timer_tick", { timer: 0, timerRunning: false }); }
    }, 1000);
    broadcastRoom(room);
  });

  socket.on("toggle_timer", () => {
    const room = rooms[socket.data.roomCode];
    if (!room || !room.players.find(p => p.id === socket.id)?.isHost) return;
    room.timerRunning = !room.timerRunning;
    io.to(room.code).emit("timer_tick", { timer: room.timer, timerRunning: room.timerRunning });
  });

  socket.on("go_vote", () => {
    const room = rooms[socket.data.roomCode];
    if (!room || !room.players.find(p => p.id === socket.id)?.isHost) return;
    room.phase = "vote";
    room.timerRunning = false;
    clearInterval(room.timerInterval);
    broadcastRoom(room);
  });

  socket.on("cast_vote", ({ targetId }) => {
    const room = rooms[socket.data.roomCode];
    if (!room || room.phase !== "vote") return;
    room.votes[socket.id] = targetId;
    broadcastRoom(room);
    if (Object.keys(room.votes).length >= room.players.length) {
      const tally = {};
      room.players.forEach(p => tally[p.id] = 0);
      Object.values(room.votes).forEach(v => { if (tally[v] !== undefined) tally[v]++; });
      const max = Math.max(...Object.values(tally));
      const accused = Object.entries(tally).filter(([, c]) => c === max).map(([id]) => id);
      const spy = room.players.find(p => p.assignment?.isSpy);
      room.result = { tally, spyId: spy.id, spyName: spy.name, spyCaught: accused.includes(spy.id) && accused.length === 1 };
      room.phase = "result";
      broadcastRoom(room);
    }
  });

  socket.on("spy_guess", ({ locationName }) => {
    const room = rooms[socket.data.roomCode];
    if (!room || room.phase !== "result" || room.spyGuessSubmitted) return;
    const spy = room.players.find(p => p.assignment?.isSpy);
    if (socket.id !== spy?.id) return;
    room.spyGuessSubmitted = true;
    room.spyGuessCorrect = locationName === room.location.name;
    broadcastRoom(room);
  });

  socket.on("back_to_lobby", () => {
    const room = rooms[socket.data.roomCode];
    if (!room || !room.players.find(p => p.id === socket.id)?.isHost) return;
    clearInterval(room.timerInterval);
    Object.assign(room, { phase: "lobby", location: null, votes: {}, result: null, spyGuessSubmitted: false, spyGuessCorrect: null, timer: 480, timerRunning: false });
    room.players.forEach(p => p.assignment = null);
    broadcastRoom(room);
  });

  socket.on("disconnect", () => {
    const room = rooms[socket.data.roomCode];
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (player) player.connected = false;
    if (room.phase === "lobby") {
      room.players = room.players.filter(p => p.connected);
      if (room.players.length === 0) { clearInterval(room.timerInterval); delete rooms[socket.data.roomCode]; return; }
      if (!room.players.find(p => p.isHost)) room.players[0].isHost = true;
    }
    broadcastRoom(room);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Spyfall running → http://localhost:${PORT}`));