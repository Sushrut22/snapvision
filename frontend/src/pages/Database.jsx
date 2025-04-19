import React, { useEffect, useState } from "react";
import "../index.css";
import { supabase } from "../utils/SupabaseClient";

function Database() {
  const [connectionStatus, setConnectionStatus] = useState("🔄 Connecting...");
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [selectedTab, setSelectedTab] = useState("full");

  // Test DB connection on mount
  useEffect(() => {
    const testConnection = async () => {
      const { error } = await supabase.from("video-data").select("*").limit(1);
      if (error) {
        console.error("❌ Failed to connect:", error.message);
        setConnectionStatus("❌ Failed to connect to Supabase");
      } else {
        setConnectionStatus("✅ Connected to Supabase");
        fetchVideos("full"); // default
      }
    };
    testConnection();
  }, []);

  const fetchVideos = async (type) => {
    setLoadingVideos(true);
    const bucketName = type === "full" ? "full-videos" : "summarised-videos";

    const { data, error } = await supabase
      .from("video-data")
      .select("*")
      .eq("bucket_name", bucketName);

    if (error) {
      console.error("Error fetching videos:", error.message);
      setLoadingVideos(false);
      return;
    }

    const videoList = await Promise.all(
      data.map(async (video) => {
        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(video.storage_path, 60 * 60, { download: false });

        if (urlError) {
          console.error("Error getting signed URL:", urlError.message);
          return null;
        }

        return {
          name: video.video_name,
          url: signedUrlData.signedUrl,
          duration: video.duration,
          size: video.size,
          createdAt: video.created_at,
        };
      })
    );

    setVideos(videoList.filter(Boolean));
    setLoadingVideos(false);
  };

  const handleTabChange = (type) => {
    setSelectedTab(type);
    fetchVideos(type);
  };

  return (
    <div className="db">
      <h1>{connectionStatus}</h1>

      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={() => handleTabChange("full")}
          style={{
            marginRight: "1rem",
            backgroundColor: selectedTab === "full" ? "#4caf50" : "#ddd",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
          }}
        >
          Full Videos
        </button>
        <button
          onClick={() => handleTabChange("summarised")}
          style={{
            backgroundColor: selectedTab === "summarised" ? "#4caf50" : "#ddd",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
          }}
        >
          Summarised Videos
        </button>
      </div>

      {loadingVideos ? (
        <p style={{ marginTop: "2rem" }}>🔄 Loading videos...</p>
      ) : (
        <div style={{ marginTop: "2rem" }}>
          {videos.length === 0 ? (
            <p>No videos found for this type.</p>
          ) : (
            videos.map((video, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                  padding: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.25)", // translucent white
                  backdropFilter: "blur(5px)", // optional: adds a frosted glass effect
                }}
              >
                <div style={{ flex: 1, paddingRight: "1rem" }}>
                  <h3>{video.name}</h3>
                  <p>Duration: {video.duration}</p>
                  <p>Size: {video.size || "Unknown"}</p>
                  <p>
                    Uploaded At: {new Date(video.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <video
                    controls
                    width="400"
                    src={video.url}
                    preload="metadata"
                    style={{ borderRadius: "8px" }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Database;
