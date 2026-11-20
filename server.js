const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { TikTokLiveConnection, WebcastEvent } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const tiktokUsername = 'sahassraka';

const tiktokConnection = new TikTokLiveConnection(tiktokUsername, {
    enableExtendedGiftInfo: true
});

tiktokConnection.connect().then(state => {
    console.log(`Connected to Room ID: ${state.roomId}`);
}).catch(err => {
    console.error('Connection failed:', err);
});

tiktokConnection.on(WebcastEvent.CHAT, data => {
    io.emit('tiktok-chat', {
        user: data.user.uniqueId,
        comment: data.comment
    });
});

tiktokConnection.on(WebcastEvent.GIFT, data => {
    if (data.giftType === 1 && !data.repeatEnd) return;
    io.emit('tiktok-gift', {
        user: data.user.uniqueId,
        giftName: data.giftName,
        giftId: data.giftId,
        count: data.repeatCount,
        diamonds: data.diamondCount * data.repeatCount
    });
});

tiktokConnection.on(WebcastEvent.LIKE, data => {
    io.emit('tiktok-like', {
        user: data.user.uniqueId,
        likeCount: data.likeCount
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
