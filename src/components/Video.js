// src/components/Video.js
import React from 'react';
import Webcam from 'react-webcam';

const Video = () => {
    return (
        <Webcam
            audio={true}
            height={720}
            width={1280}
            videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: "user"
            }}
        />
    );
};

export default Video;
