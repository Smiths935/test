// src/zegocloudConfig.js
const { ZegoExpressEngine } = require('zego-express-engine-webrtc');
const { SignJWT } = require('jose');

const appID = 1437669585;
const server = 'wss://webliveroom1437669585-api.coolzcloud.com/ws';
const secretKey = '99ff9083fe771d6948a91ebac6e4e8ed';

const zegoEngine = new ZegoExpressEngine(appID, server);

const generateToken = async (userID, roomID) => {
  try {
    const payload = {
      app_id: appID,
      user_id: userID,
      room_id: roomID,
      nonce: Math.floor(Math.random() * 1000000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const encoder = new TextEncoder();
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .sign(encoder.encode(secretKey));

    return jwt;
  } catch (error) {
    console.error('Error generating JWT:', error);
    return null;
  }
};

module.exports = { zegoEngine, generateToken };
