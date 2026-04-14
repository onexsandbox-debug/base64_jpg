import axios from "axios";
import FormData from "form-data";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { base64, phone_number, apikey } = req.body;

    // Validation
    if (!base64 || !phone_number || !apikey) {
      return res.status(400).json({
        success: false,
        message: "base64, phone_number and apikey are required",
      });
    }

    // Step 1: Clean base64 string
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");

    // Step 2: Convert to buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Step 3: Prepare form-data (JPG upload)
    const formData = new FormData();
    formData.append("phone_number", phone_number);
    formData.append("file", buffer, {
      filename: "document.jpg",
      contentType: "image/jpeg",
    });

    // Step 4: Call Onexaura API with dynamic API key
    const response = await axios.post(
      "https://api.onexaura.com/wa/mediaupload",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          accept: "application/json",
          apikey: apikey, // 🔥 dynamic from request
        },
        timeout: 20000,
      }
    );

    // Step 5: Return response
    return res.status(200).json({
      success: true,
      data: response.data,
    });

  } catch (error) {
    console.error("Upload Error:", error?.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Media upload failed",
      error: error?.response?.data || error.message,
    });
  }
}
