import React, { useRef, useState } from "react";

export default function Tools() {
  const imageToVideoRef = useRef(null);
  const pastebinRef = useRef(null);
  const canvasRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [generating, setGenerating] = useState(false);

  const [pasteText, setPasteText] = useState("");
  const [pasteLink, setPasteLink] = useState("");
  const [pasteError, setPasteError] = useState("");
  const [pasteLoading, setPasteLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [tweetURL, setTweetURL] = useState("");
  const [archiveResult, setArchiveResult] = useState("");
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveError, setArchiveError] = useState("");
  const [archiveCopied, setArchiveCopied] = useState(false);

  const scrollToTool = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImageSrc(URL.createObjectURL(file));
    setVideoURL(null);
  };

  const generateVideoFromImage = async () => {
    if (!imageFile) return;
    setGenerating(true);
    setVideoURL(null);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const image = new Image();
    image.src = imageSrc;

    await new Promise((res) => (image.onload = res));
    canvas.width = image.width;
    canvas.height = image.height;

    const stream = canvas.captureStream(30); // 30 FPS
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoURL(url);
      setGenerating(false);
    };

    recorder.start();

    const totalFrames = 5 * 30;
    let frame = 0;

    const draw = () => {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };

    const interval = setInterval(() => {
      draw();
      frame++;
      if (frame >= totalFrames) {
        clearInterval(interval);
        recorder.stop();
      }
    }, 1000 / 30);

    draw();
  };

  const handlePastebinUpload = async () => {
    if (!pasteText.trim()) return;

    setPasteLoading(true);
    setPasteLink("");
    setPasteError("");

    try {
      const response = await fetch(
        "https://corsproxy.io/?https://dpaste.org/api/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `content=${encodeURIComponent(pasteText)}&syntax=plaintext`,
        }
      );

      const pasteUrl = await response.text();
      setPasteLink(pasteUrl.trim());
    } catch (err) {
      setPasteError("Upload failed. Check your internet connection.");
    } finally {
      setPasteLoading(false);
    }
  };

  const tryArchive = async (url, attempts = 0) => {
  const res = await fetch("https://archive.vn/submit/", { /*...*/ });
  if (res.status === 429) {
    if (attempts < 3) {
      await new Promise(r => setTimeout(r, 2000 * (attempts + 1)));
      return tryArchive(url, attempts + 1);
    }
    throw new Error("Rate limit (429). Try again later.");
  }
  return res;
};


  const handleArchiveTweet = async () => {
  setArchiveResult("");
  setArchiveError("");
  setArchiveCopied(false);

  const re = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[^\/]+\/status\/\d+/;
  if (!re.test(tweetURL.trim())) {
    setArchiveError("❌ Please enter a valid Twitter/X post URL.");
    return;
  }

  setArchiveLoading(true);

  try {
    const form = new URLSearchParams({ url: tweetURL.trim() });
    const res = await tryArchive(tweetURL, 0);
    const html = await res.text();
    const m = html.match(/https?:\/\/archive\.vn\/(?:wip\/)?[A-Za-z0-9]+/);
    if (m) setArchiveResult(m[0]);
    else throw new Error("No archive link found.");
  } catch (err) {
    setArchiveError("❌ Archiving failed: " + err.message);
  } finally {
    setArchiveLoading(false);
  }
};


  const handleArchiveCopy = () => {
    navigator.clipboard.writeText(archiveResult);
    setArchiveCopied(true);
    setTimeout(() => setArchiveCopied(false), 1500);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Tools</h1>

      <div className="flex space-x-4 mb-8 border-b pb-4">
        <button
          onClick={() => scrollToTool(imageToVideoRef)}
          className="text-blue-600 hover:underline"
        >
          Generate 5s Video from Photo
        </button>
        <button
          onClick={() => scrollToTool(pastebinRef)}
          className="text-blue-600 hover:underline"
        >
          Create Pastebin Link
        </button>
        <button
          onClick={() => scrollToTool(pastebinRef)}
          className="text-blue-600 hover:underline"
        >
          Archive Twitter Post
        </button>
      </div>

      {/* Image to Video Tool */}
      <div ref={imageToVideoRef} className="mb-12">
        <h2 className="text-xl font-semibold mb-4">
          🎥 Photo ➜ 5s Silent Video
        </h2>

        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {imageSrc && (
          <div className="mt-4">
            <img
              src={imageSrc}
              alt="Uploaded"
              className="w-48 border rounded shadow"
            />
            <button
              onClick={generateVideoFromImage}
              disabled={generating}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {generating ? "Generating..." : "Generate Video"}
            </button>
          </div>
        )}

        {videoURL && (
          <div className="mt-6">
            <video
              src={videoURL}
              controls
              className="w-full max-w-md rounded shadow"
            />
            <a
              href={videoURL}
              download="photo-video.webm"
              className="block mt-2 text-blue-600 hover:underline text-center"
            >
              Download Video
            </a>
          </div>
        )}
      </div>

      {/* Pastebin Tool */}
      <div ref={pastebinRef} className="mb-12">
        <h2 className="text-xl font-semibold mb-4">📝 Text ➜ Pastebin Link</h2>
        <textarea
          rows="6"
          className="w-full p-3 border rounded mb-4"
          placeholder="Write or paste your content here..."
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
        />
        <button
          onClick={handlePastebinUpload}
          disabled={pasteLoading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {pasteLoading ? "Uploading..." : "Create Pastebin"}
        </button>

        {pasteLink && (
          <div className="mt-4 space-y-2">
            <p className="text-blue-600 font-medium">🔗 Paste created:</p>
            <div className="flex items-start space-x-2">
              <code className="bg-gray-100 px-3 py-2 rounded break-all">
                {pasteLink}
              </code>
              <div className="relative">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(String(pasteLink).trim());
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="text-xl hover:text-green-600"
                  title="Copy to clipboard"
                >
                  📋
                </button>
                {copied && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-green-600 animate-pulse">
                    Copied!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {pasteError && (
          <p className="mt-4 text-red-600">❌ {pasteError}</p>
        )}
      </div>

      {/* Twitter Archive Tool */}
      <div className="mb-12" ref={pastebinRef}>
        <h2 className="text-xl font-semibold mb-4">📦 Archive Twitter/X Post</h2>
        <input
          type="url"
          placeholder="Enter Twitter or X post link..."
          className="w-full p-3 border rounded mb-4"
          value={tweetURL}
          onChange={(e) => setTweetURL(e.target.value)}
        />

        <button
          onClick={handleArchiveTweet}
          disabled={archiveLoading}
          className={`px-4 py-2 rounded text-white ${
            archiveLoading ? "bg-gray-500" : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {archiveLoading ? "Archiving…" : "Archive Post"}
        </button>

        {archiveError && (
          <p className="mt-4 text-red-600">{archiveError}</p>
        )}

        {archiveResult && (
          <div className="mt-4 flex items-center space-x-2">
            <a
              href={archiveResult}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline break-all"
            >
              {archiveResult}
            </a>
            <button onClick={handleArchiveCopy} className="text-xl">
              {archiveCopied ? "✅" : "📋"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
