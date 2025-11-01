import React from 'react';
import VideoCall from './VideoCall';

// VideoCallSimple now uses Daily.co through VideoCall component
const VideoCallSimple = ({ roomName, onEndCall, onUserJoined, onUserLeft }) => {
  // Simply delegate to the main VideoCall component which handles Daily.co
  return (
    <VideoCall
      roomName={roomName}
      onEndCall={onEndCall}
      onUserJoined={onUserJoined}
      onUserLeft={onUserLeft}
    />
  );
};

export default VideoCallSimple;
