import React, { useState } from 'react';
import { ClipLoader } from 'react-spinners';
import '../index.css';

function VideoUploader({ onDetect, onDetectActivities }) {
  const [video, setVideo] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('yellow'); // yellow, green, red
  // const [detectType, setDetectType] = useState('anomalies');
  const [loading, setLoading] = useState(false);

  const handleVideoChange = (event) => {
    const file = event.target.files[0];
    setVideo(file);
    setUploadStatus('green');
  };


  const handleDetect = async () => {
    if (!video) {
      alert('Please upload a video first.');
      return;
    }
    setLoading(true);
    try {
      await onDetect(video);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectActivities = async () => {
    if (!video) {
      alert('Please upload a video first.');
      return;
    }
    setLoading(true);
    try {
      await onDetectActivities(video);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="video-uploader">
      <h1>Video Summarization & Detection Engine</h1>
      <input type="file" accept="video/*" onChange={handleVideoChange} />
      <div className={`status-light ${uploadStatus}`} />
      <span>{video ? video.name : 'No Video Uploaded!'}</span>
      <button onClick={handleDetect}>Anomaly Detection</button>
      <button onClick={handleDetectActivities}>Activity Detection</button>
      {loading && <ClipLoader color="#36D7B7" loading={loading} size={30} />}
    </div>
  );
}

export default VideoUploader;