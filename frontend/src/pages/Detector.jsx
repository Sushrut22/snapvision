import React, { useState } from 'react';
import VideoUploader from '../components/VideoUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import SummarizedVideoDisplay from '../components/SummarizedVideoDisplay';
import axios from 'axios';
import '../index.css';

function Detector() {
  const [summarizedVideoUrl, setSummarizedVideoUrl] = useState(null);
  const [activitySummarizedVideoUrl, setActivitySummarizedVideoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActivityLoading, setIsActivityLoading] = useState(false);

  const handleDetect = async (video) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('video', video);

    try {
      const response = await axios.post('http://127.0.0.1:5000/snap-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      });

      const videoBlob = new Blob([response.data], { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(videoBlob);
      setSummarizedVideoUrl(videoUrl);
    } catch (error) {
      console.error('Error detecting:', error);
      alert('Error processing video.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetectActivities = async (video) => {
    setIsActivityLoading(true);

    const formData = new FormData();
    formData.append('video', video);

    try {
      const response = await axios.post('http://127.0.0.1:5000/detect-activity', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      });

      const videoBlob = new Blob([response.data], { type: 'video/avi' });
      const videoUrl = URL.createObjectURL(videoBlob);
      setActivitySummarizedVideoUrl(videoUrl);
    } catch (error) {
      console.error('Error detecting activities:', error);
      alert('Error processing video for activity detection.');
    } finally {
      setIsActivityLoading(false);
    }
  };

  // const handleDownload = () => {
  //   const link = document.createElement('a');
  //   link.href = summarizedVideoUrl;
  //   link.download = 'summarized_video.mp4';
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };
  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'summarized_video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // const handleCancel = () => {
  //   setSummarizedVideoUrl(null);
  // };
  const handleCancel = () => {
    setSummarizedVideoUrl(null);
    setActivitySummarizedVideoUrl(null);
  };

  // return (
  //   <div className="detector">
  //     {isLoading ? (
  //       <LoadingSpinner />
  //     ) : summarizedVideoUrl ? (
  //       <SummarizedVideoDisplay videoUrl={summarizedVideoUrl} onDownload={handleDownload} onCancel={handleCancel} />
  //     ) : (
  //       <VideoUploader onDetect={handleDetect} />
  //     )}
  //   </div>
  // );

  return (
    <div className="detector">
      {isLoading || isActivityLoading ? (
        <LoadingSpinner />
      ) : summarizedVideoUrl ? (
        <SummarizedVideoDisplay
          videoUrl={summarizedVideoUrl}
          onDownload={() => handleDownload(summarizedVideoUrl)}
          onCancel={handleCancel}
        />
      ) : activitySummarizedVideoUrl ? (
        <SummarizedVideoDisplay
          videoUrl={activitySummarizedVideoUrl}
          onDownload={() => handleDownload(activitySummarizedVideoUrl)}
          onCancel={handleCancel}
        />
      ) : (
        <VideoUploader onDetect={handleDetect} onDetectActivities={handleDetectActivities} />
      )}
    </div>
  );
}

export default Detector;