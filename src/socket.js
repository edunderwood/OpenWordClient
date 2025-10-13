import io from 'socket.io-client'
const serverName = process.env.NEXT_PUBLIC_SERVER_NAME;

// ✅ FIX: Connect to participant namespace
const socket = io(serverName + '/participant', {autoConnect: false});
console.log(`Connecting socket.io to ${serverName}/participant`);

export default socket;
