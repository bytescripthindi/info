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

const handleCopy = () => {
  navigator.clipboard.writeText(pasteLink).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  });
};


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
      if (frame >= totalFrames) {
        recorder.stop();
        return;
      }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      frame++;
      requestAnimationFrame(draw);
    };

    draw();
  };

  const handlePastebinUpload = async () => {
  if (!pasteText.trim()) return;

  setPasteLoading(true);
  setPasteLink("");
  setPasteError("");

  try {
    const response = await fetch("https://dpaste.org/api/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `content=${encodeURIComponent(pasteText)}&syntax=plaintext&expiry_days=7`,
    });

    const url = await response.text();
    setPasteLink(url.trim());
  } catch (err) {
    setPasteError("Upload failed. Check your internet connection.");
  } finally {
    setPasteLoading(false);
  }
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
      <pre className="bg-gray-100 p-3 rounded break-words whitespace-pre-wrap text-sm">{pasteLink}</pre>
      <div className="relative">
        <button
          onClick={handleCopy}
          className="text-xl hover:text-green-600"
          title="Copy to clipboard"
        >
          📋
        </button>
        {copied && (
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-green-600 animate-fade-in">
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
    </div>
  );
}
